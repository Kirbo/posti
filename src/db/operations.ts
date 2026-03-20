import type { PostiConfig } from "../config/schema.js";
import { sliceIntoChunks } from "../utils/chunks.js";
import { getInsertSQL, getUpsertSQL, type SqlValue } from "./dialects.js";
import type { DbConnection } from "./index.js";

async function withTransaction<T>(db: DbConnection, fn: () => Promise<T>): Promise<T> {
  switch (db.dialect) {
    case "sqlite": {
      // SQLite better-sqlite3 transactions are synchronous, but our operations
      // use the sync API internally for SQLite, so we manually wrap with BEGIN/COMMIT
      try {
        db.raw.exec("BEGIN");
        const result = await fn();
        db.raw.exec("COMMIT");
        return result;
      } catch (error) {
        db.raw.exec("ROLLBACK");
        throw error;
      }
    }
    case "mysql":
    case "mariadb": {
      const conn = await db.raw.getConnection();
      try {
        await conn.beginTransaction();
        const result = await fn();
        await conn.commit();
        return result;
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    }
    case "postgres": {
      const client = await db.raw.connect();
      try {
        await client.query("BEGIN");
        const result = await fn();
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
  }
}

export async function dropTables(db: DbConnection, config: PostiConfig): Promise<void> {
  for (const table of config.tables) {
    const tableName = `${config.tablePrefix}${table}`;
    await dropTable(db, tableName);
  }
}

export async function dropTable(db: DbConnection, tableName: string): Promise<void> {
  await execSQL(db, `DROP TABLE IF EXISTS ${quoteIdentifier(db.dialect, tableName)}`);
}

export async function createTempTable(db: DbConnection, tempTableName: string, sourceTableName: string): Promise<void> {
  await dropTable(db, tempTableName);
  const quotedTemp = quoteIdentifier(db.dialect, tempTableName);
  const quotedSource = quoteIdentifier(db.dialect, sourceTableName);

  let sql: string;
  switch (db.dialect) {
    case "sqlite":
      sql = `CREATE TABLE ${quotedTemp} AS SELECT * FROM ${quotedSource} WHERE 0`;
      break;
    case "mysql":
    case "mariadb":
      sql = `CREATE TABLE ${quotedTemp} LIKE ${quotedSource}`;
      break;
    case "postgres":
      sql = `CREATE TABLE ${quotedTemp} (LIKE ${quotedSource} INCLUDING ALL)`;
      break;
  }

  await execSQL(db, sql);
}

export async function insertRows(
  db: DbConnection,
  tableName: string,
  rows: Record<string, SqlValue>[],
  chunkSize = 1000,
): Promise<void> {
  if (rows.length === 0) return;

  await withTransaction(db, async () => {
    const chunks = sliceIntoChunks(rows, chunkSize);
    for (const chunk of chunks) {
      const { sql, values } = getInsertSQL(db.dialect, tableName, chunk);
      await execSQL(db, sql, values);
    }
  });
}

export async function upsertFromTemp(
  db: DbConnection,
  dialect: PostiConfig["dialect"],
  tempTableName: string,
  finalTableName: string,
  tableType: string,
): Promise<void> {
  await withTransaction(db, async () => {
    const sql = getUpsertSQL(dialect, tempTableName, finalTableName, tableType);
    await execSQL(db, sql);
  });
}

export async function countRows(db: DbConnection, tableName: string): Promise<number> {
  const sql = `SELECT COUNT(*) as cnt FROM ${quoteIdentifier(db.dialect, tableName)}`;

  switch (db.dialect) {
    case "sqlite": {
      const rows = db.raw.prepare(sql).all();
      return extractCount(rows[0]);
    }
    case "mysql":
    case "mariadb": {
      const [rows] = await db.raw.execute(sql);
      const first = Array.isArray(rows) ? rows[0] : undefined;
      return extractCount(first);
    }
    case "postgres": {
      const result = await db.raw.query(sql);
      return extractCount(result.rows[0]);
    }
  }
}

function extractCount(row: unknown): number {
  if (row == null || typeof row !== "object") return 0;
  const cnt = (row as Record<string, unknown>).cnt;
  if (typeof cnt === "number") return cnt;
  if (typeof cnt === "string") return Number.parseInt(cnt, 10) || 0;
  if (typeof cnt === "bigint") return Number(cnt);
  return 0;
}

export function quoteIdentifier(dialect: PostiConfig["dialect"], name: string): string {
  switch (dialect) {
    case "mysql":
    case "mariadb":
      return `\`${name.replaceAll("`", "``")}\``;
    case "postgres":
    case "sqlite":
      return `"${name.replaceAll('"', '""')}"`;
  }
}

export async function execSQL(db: DbConnection, sql: string, values?: SqlValue[]): Promise<void> {
  switch (db.dialect) {
    case "sqlite":
      if (values && values.length > 0) {
        db.raw.prepare(sql).run(...values);
      } else {
        db.raw.exec(sql);
      }
      break;
    case "mysql":
    case "mariadb":
      await db.raw.execute(sql, values);
      break;
    case "postgres":
      await db.raw.query(sql, values);
      break;
  }
}

export async function queryRows(
  db: DbConnection,
  sql: string,
  values?: SqlValue[],
): Promise<Record<string, unknown>[]> {
  switch (db.dialect) {
    case "sqlite":
      return toRecordArray(db.raw.prepare(sql).all(...(values ?? [])));
    case "mysql":
    case "mariadb": {
      const [rows] = await db.raw.execute(sql, values);
      return toRecordArray(rows);
    }
    case "postgres": {
      const result = await db.raw.query(sql, values);
      return toRecordArray(result.rows);
    }
  }
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null);
}
