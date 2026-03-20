import { describe, expect, it } from "vitest";
import { configSchema } from "../../src/config/schema.js";

describe("configSchema", () => {
  it("should validate a minimal mysql config", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("should validate a minimal postgres config", () => {
    const result = configSchema.safeParse({
      dialect: "postgres",
      host: "localhost",
      database: "posti",
      user: "posti",
      password: "posti",
    });
    expect(result.success).toBe(true);
  });

  it("should validate a minimal sqlite config", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
    });
    expect(result.success).toBe(true);
  });

  it("should validate mariadb dialect", () => {
    const result = configSchema.safeParse({
      dialect: "mariadb",
      host: "localhost",
      database: "posti",
      user: "root",
      password: "root",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid dialect", () => {
    const result = configSchema.safeParse({
      dialect: "mssql",
      database: "posti",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing database", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
    });
    expect(result.success).toBe(false);
  });

  it("should apply defaults for tablePrefix", () => {
    const result = configSchema.parse({
      dialect: "mysql",
      host: "localhost",
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.tablePrefix).toBe("posti_");
  });

  it("should apply defaults for process settings", () => {
    const result = configSchema.parse({
      dialect: "mysql",
      host: "localhost",
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.process.chunkSize).toBe(1000);
    expect(result.process.deleteOnComplete).toBe(true);
  });

  it("should allow overriding defaults", () => {
    const result = configSchema.parse({
      dialect: "mysql",
      host: "localhost",
      database: "posti",
      user: "root",
      password: "secret",
      tablePrefix: "custom_",
      process: {
        chunkSize: 500,
        deleteOnComplete: false,
      },
    });
    expect(result.tablePrefix).toBe("custom_");
    expect(result.process.chunkSize).toBe(500);
    expect(result.process.deleteOnComplete).toBe(false);
  });

  it("should reject tablePrefix with special characters", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
      tablePrefix: "drop`table",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid tablePrefix patterns", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
      tablePrefix: "my_app_",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-positive chunkSize", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
      process: { chunkSize: 0, deleteOnComplete: true },
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative chunkSize", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
      process: { chunkSize: -5, deleteOnComplete: true },
    });
    expect(result.success).toBe(false);
  });

  it("should allow port as number", () => {
    const result = configSchema.parse({
      dialect: "mysql",
      host: "localhost",
      port: 3306,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.port).toBe(3306);
  });

  it("should reject port 0", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      port: 0,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative port", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      port: -1,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("should reject port above 65535", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      port: 70000,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer port", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      port: 3306.5,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("should allow specifying tables to process", () => {
    const result = configSchema.parse({
      dialect: "sqlite",
      database: ":memory:",
      tables: ["addresses", "postalcodes"],
    });
    expect(result.tables).toEqual(["addresses", "postalcodes"]);
  });

  it("should default tables to all three", () => {
    const result = configSchema.parse({
      dialect: "sqlite",
      database: ":memory:",
    });
    expect(result.tables).toEqual(["addresses", "postalcodes", "postalcode_changes"]);
  });

  it("should reject invalid table name", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
      tables: ["invalid_table"],
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer chunkSize", () => {
    const result = configSchema.safeParse({
      dialect: "sqlite",
      database: ":memory:",
      process: { chunkSize: 1.5, deleteOnComplete: true },
    });
    expect(result.success).toBe(false);
  });

  it("should accept port at lower boundary (1)", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      port: 1,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("should accept port at upper boundary (65535)", () => {
    const result = configSchema.safeParse({
      dialect: "mysql",
      host: "localhost",
      port: 65535,
      database: "posti",
      user: "root",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });
});
