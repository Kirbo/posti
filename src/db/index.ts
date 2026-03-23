import type BetterSqlite3 from "better-sqlite3";
import type { Pool as MysqlPool } from "mysql2/promise";
import type { Pool as PgPool } from "pg";

interface SqliteConnection {
  dialect: "sqlite";
  raw: BetterSqlite3.Database;
}

interface MysqlConnection {
  dialect: "mysql" | "mariadb";
  raw: MysqlPool;
}

interface PostgresConnection {
  dialect: "postgres";
  raw: PgPool;
}

export type DbConnection = SqliteConnection | MysqlConnection | PostgresConnection;

export async function createConnection(config: {
  dialect: "postgres" | "mysql" | "mariadb" | "sqlite";
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database: string;
}): Promise<DbConnection> {
  switch (config.dialect) {
    case "sqlite": {
      const Database = (await import("better-sqlite3")).default;
      const sqlite = new Database(config.database);
      sqlite.pragma("journal_mode = WAL");
      sqlite.pragma("foreign_keys = ON");
      return { dialect: "sqlite", raw: sqlite };
    }
    case "mysql":
    case "mariadb": {
      const mysql2 = await import("mysql2/promise");
      const pool = mysql2.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      });
      return { dialect: config.dialect, raw: pool };
    }
    case "postgres": {
      const pg = await import("pg");
      const pool = new pg.default.Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      });
      return { dialect: "postgres", raw: pool };
    }
  }
}

export async function closeConnection(conn: DbConnection): Promise<void> {
  switch (conn.dialect) {
    case "sqlite":
      conn.raw.close();
      break;
    case "mysql":
    case "mariadb":
      await conn.raw.end();
      break;
    case "postgres":
      await conn.raw.end();
      break;
  }
}
