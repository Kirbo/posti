import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PostiConfig } from "../../src/config/schema.js";
import type { DbConnection } from "../../src/db/index.js";
import { closeConnection, createConnection } from "../../src/db/index.js";
import { type Migration, runMigrations } from "../../src/db/migrate.js";
import { countRows, dropTable, queryRows } from "../../src/db/operations.js";
import { getSqliteConfig } from "../integration/helpers.js";

describe("runMigrations", () => {
  let config: PostiConfig;
  let db: DbConnection;

  beforeEach(async () => {
    config = getSqliteConfig();
    db = await createConnection(config);
  });

  afterEach(async () => {
    await closeConnection(db);
  });

  it("should create tracking table on first run", async () => {
    await runMigrations(db, config);

    const rows = await queryRows(db, `SELECT name FROM "${config.tablePrefix}schema_migrations"`);
    expect(rows).toBeDefined();
  });

  it("should apply pending migrations in order", async () => {
    const applied: string[] = [];
    const testMigrations: Migration[] = [
      {
        name: "001_first",
        up: async () => {
          applied.push("first");
        },
      },
      {
        name: "002_second",
        up: async () => {
          applied.push("second");
        },
      },
      {
        name: "003_third",
        up: async () => {
          applied.push("third");
        },
      },
    ];

    await runMigrations(db, config, testMigrations);
    expect(applied).toEqual(["first", "second", "third"]);
  });

  it("should skip already-applied migrations", async () => {
    const applied: string[] = [];
    const testMigrations: Migration[] = [
      {
        name: "001_first",
        up: async () => {
          applied.push("first");
        },
      },
      {
        name: "002_second",
        up: async () => {
          applied.push("second");
        },
      },
    ];

    // Run once
    await runMigrations(db, config, testMigrations);
    expect(applied).toEqual(["first", "second"]);

    // Run again — should not re-apply
    applied.length = 0;
    await runMigrations(db, config, testMigrations);
    expect(applied).toEqual([]);
  });

  it("should handle empty migration list", async () => {
    await runMigrations(db, config, []);

    const rows = await queryRows(db, `SELECT name FROM "${config.tablePrefix}schema_migrations"`);
    expect(rows).toEqual([]);
  });

  it("should record migration name and timestamp after success", async () => {
    const testMigrations: Migration[] = [{ name: "001_test", up: async () => {} }];

    await runMigrations(db, config, testMigrations);

    const rows = await queryRows(db, `SELECT name, applied_at FROM "${config.tablePrefix}schema_migrations"`);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe("001_test");
    expect(rows[0]?.applied_at).toBeDefined();
  });

  it("should not record migration on failure", async () => {
    const testMigrations: Migration[] = [
      { name: "001_good", up: async () => {} },
      {
        name: "002_bad",
        up: async () => {
          throw new Error("migration failed");
        },
      },
    ];

    await expect(runMigrations(db, config, testMigrations)).rejects.toThrow("migration failed");

    const rows = await queryRows(db, `SELECT name FROM "${config.tablePrefix}schema_migrations"`);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe("001_good");
  });

  it("should apply only new migrations on retry after failure", async () => {
    const applied: string[] = [];
    const failOnce: Migration[] = [
      {
        name: "001_good",
        up: async () => {
          applied.push("good");
        },
      },
      {
        name: "002_bad",
        up: async () => {
          throw new Error("fail");
        },
      },
    ];

    await expect(runMigrations(db, config, failOnce)).rejects.toThrow("fail");
    expect(applied).toEqual(["good"]);

    // Fix the migration and retry
    applied.length = 0;
    const fixed: Migration[] = [
      {
        name: "001_good",
        up: async () => {
          applied.push("good");
        },
      },
      {
        name: "002_bad",
        up: async () => {
          applied.push("bad-fixed");
        },
      },
    ];

    await runMigrations(db, config, fixed);
    expect(applied).toEqual(["bad-fixed"]); // 001 skipped, 002 retried
  });
});

describe("initial schema migration", () => {
  let config: PostiConfig;
  let db: DbConnection;

  beforeEach(async () => {
    config = getSqliteConfig();
    db = await createConnection(config);
  });

  afterEach(async () => {
    // Clean up all tables including tracking table
    for (const table of config.tables) {
      await dropTable(db, `${config.tablePrefix}${table}`);
    }
    await dropTable(db, `${config.tablePrefix}schema_migrations`);
    await closeConnection(db);
  });

  it("should create all tables and indexes via default migrations", async () => {
    await runMigrations(db, config);

    // Verify tables exist by counting rows
    const addressCount = await countRows(db, `${config.tablePrefix}addresses`);
    const zipcodeCount = await countRows(db, `${config.tablePrefix}postalcodes`);
    const changeCount = await countRows(db, `${config.tablePrefix}postalcode_changes`);

    expect(addressCount).toBe(0);
    expect(zipcodeCount).toBe(0);
    expect(changeCount).toBe(0);
  });

  it("should be idempotent (safe to run on existing tables)", async () => {
    // Run migrations twice — second run should be a no-op
    await runMigrations(db, config);
    await runMigrations(db, config);

    const addressCount = await countRows(db, `${config.tablePrefix}addresses`);
    expect(addressCount).toBe(0);
  });
});
