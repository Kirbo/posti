#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { parseArgs } from "./cli/args.js";
import { loadConfig } from "./config/index.js";
import { closeConnection, createConnection } from "./db/index.js";
import { runMigrations } from "./db/migrate.js";
import { run } from "./loader/index.js";
import { logger } from "./utils/logger.js";
import { formatDuration } from "./utils/time.js";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.version) {
  printVersion();
  process.exit(0);
}

const started = Date.now();

try {
  const config = await loadConfig(args);

  if (args.command === "migrate") {
    const db = await createConnection(config);
    try {
      await runMigrations(db, config);
    } finally {
      await closeConnection(db);
    }
    logger.success(`Migrations complete in ${formatDuration(Date.now() - started)}`);
  } else {
    await run(config, { force: args.force });
    logger.success(`Finished in ${formatDuration(Date.now() - started)}`);
  }
} catch (error) {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function printHelp(): void {
  console.info(
    `
posti - Finnish postal data loader

Usage: posti [command] [options]

Commands:
  run                   Fetch and load postal data (default)
  migrate               Run database migrations only

Options:
  --config <path>       Path to config file
  --force               Force re-processing even if files haven't changed
  --no-migrate          Skip automatic database migrations on startup
  --dialect <dialect>   Database dialect (postgres, mysql, mariadb, sqlite)
  --host <host>         Database host
  --port <port>         Database port
  --database <name>     Database name (or file path for SQLite)
  --user <user>         Database user
  --password <pass>     Database password
  --tables <list>       Comma-separated tables (addresses,postalcodes,postalcode_changes)
  --help                Show this help
  --version             Show version

Environment variables:
  POSTI_CONFIG          Path to config file
  POSTI_DIALECT         Database dialect
  POSTI_HOST            Database host
  POSTI_PORT            Database port
  POSTI_USER            Database user
  POSTI_PASSWORD        Database password
  POSTI_DATABASE        Database name
  POSTI_TABLE_PREFIX    Table name prefix (default: posti_)
`.trim(),
  );
}

function printVersion(): void {
  try {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
    console.info(`posti v${pkg.version}`);
  } catch {
    console.info("posti (unknown version)");
  }
}
