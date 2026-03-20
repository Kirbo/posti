import type { PostiConfig } from "../../src/config/schema.js";

export function getSqliteConfig(prefix = "test_"): PostiConfig {
  return {
    dialect: "sqlite",
    database: ":memory:",
    tablePrefix: prefix,
    migrate: true,
    process: { chunkSize: 100, deleteOnComplete: true },
    tables: ["addresses", "postalcodes", "postalcode_changes"],
  };
}

export function getMysqlConfig(prefix = "test_"): PostiConfig {
  return {
    dialect: "mysql",
    host: process.env.POSTI_HOST ?? "127.0.0.1",
    port: Number.parseInt(process.env.POSTI_PORT ?? "3306", 10),
    user: process.env.POSTI_USER ?? "posti",
    password: process.env.POSTI_PASSWORD ?? "posti",
    database: process.env.POSTI_DATABASE ?? "posti",
    tablePrefix: prefix,
    migrate: true,
    process: { chunkSize: 100, deleteOnComplete: true },
    tables: ["addresses", "postalcodes", "postalcode_changes"],
  };
}

export function getMariadbConfig(prefix = "test_"): PostiConfig {
  return {
    ...getMysqlConfig(prefix),
    dialect: "mariadb",
    port: Number.parseInt(process.env.POSTI_PORT ?? "3307", 10),
  };
}

export function getPostgresConfig(prefix = "test_"): PostiConfig {
  return {
    dialect: "postgres",
    host: process.env.POSTI_HOST ?? "127.0.0.1",
    port: Number.parseInt(process.env.POSTI_PORT ?? "5432", 10),
    user: process.env.POSTI_USER ?? "posti",
    password: process.env.POSTI_PASSWORD ?? "posti",
    database: process.env.POSTI_DATABASE ?? "posti",
    tablePrefix: prefix,
    migrate: true,
    process: { chunkSize: 100, deleteOnComplete: true },
    tables: ["addresses", "postalcodes", "postalcode_changes"],
  };
}
