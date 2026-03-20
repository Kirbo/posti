import type { PostiConfig } from "../config/schema.js";
import { logger } from "../utils/logger.js";
import type { DbConnection } from "./index.js";
import { migrations as defaultMigrations } from "./migrations/index.js";
import { execSQL, queryRows, quoteIdentifier } from "./operations.js";

export interface Migration {
  name: string;
  up: (db: DbConnection, config: PostiConfig) => Promise<void>;
}

export async function runMigrations(
  db: DbConnection,
  config: PostiConfig,
  migrations: Migration[] = defaultMigrations,
): Promise<void> {
  await ensureMigrationsTable(db, config);
  const applied = await getAppliedMigrations(db, config);

  let count = 0;
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;

    logger.info(`Applying migration: ${migration.name}`);
    await migration.up(db, config);
    await recordMigration(db, config, migration.name);
    count++;
  }

  if (count > 0) {
    logger.info(`Applied ${count} migration(s)`);
  }
}

async function ensureMigrationsTable(db: DbConnection, config: PostiConfig): Promise<void> {
  const tableName = quoteIdentifier(db.dialect, `${config.tablePrefix}schema_migrations`);
  const colName = quoteIdentifier(db.dialect, "name");
  const colAppliedAt = quoteIdentifier(db.dialect, "applied_at");

  let timestampDefault: string;
  switch (db.dialect) {
    case "sqlite":
      timestampDefault = "TIMESTAMP DEFAULT (datetime('now'))";
      break;
    case "mysql":
    case "mariadb":
      timestampDefault = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
      break;
    case "postgres":
      timestampDefault = "TIMESTAMP DEFAULT NOW()";
      break;
  }

  await execSQL(
    db,
    `CREATE TABLE IF NOT EXISTS ${tableName} (
  ${colName} VARCHAR(255) PRIMARY KEY,
  ${colAppliedAt} ${timestampDefault}
)`,
  );
}

async function getAppliedMigrations(db: DbConnection, config: PostiConfig): Promise<Set<string>> {
  const tableName = quoteIdentifier(db.dialect, `${config.tablePrefix}schema_migrations`);
  const colName = quoteIdentifier(db.dialect, "name");
  const rows = await queryRows(db, `SELECT ${colName} FROM ${tableName}`);
  return new Set(rows.map((r) => String(r.name)));
}

async function recordMigration(db: DbConnection, config: PostiConfig, migrationName: string): Promise<void> {
  const tableName = quoteIdentifier(db.dialect, `${config.tablePrefix}schema_migrations`);
  const colName = quoteIdentifier(db.dialect, "name");

  if (db.dialect === "postgres") {
    await execSQL(db, `INSERT INTO ${tableName} (${colName}) VALUES ($1)`, [migrationName]);
  } else {
    await execSQL(db, `INSERT INTO ${tableName} (${colName}) VALUES (?)`, [migrationName]);
  }
}
