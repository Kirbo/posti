# posti

Finnish postal data loader — fetches Basic Address File (BAF), Postal Code File (PCF), and Postal Code Changes (POM) from [Posti's open data services](https://www.posti.fi/webpcode/) and loads them into your database.

Supports **PostgreSQL**, **MySQL**, **MariaDB**, and **SQLite**.

## Requirements

- Node.js >= 20.11.0 (latest 3 LTS versions: 20, 22, 24)
- pnpm
- Development requires Node.js 24 (current LTS)

## Installation

```bash
# As a CLI tool
pnpm add -g posti

# As a library
pnpm add posti
```

## Quick Start

### CLI

```bash
# Load into PostgreSQL
posti --dialect postgres --host localhost --port 5432 --database posti --user posti --password posti

# Load into MySQL
posti --dialect mysql --host localhost --port 3306 --database posti --user posti --password posti

# Load into SQLite (no server needed)
posti --dialect sqlite --database ./posti.db

# Force re-process even if files haven't changed
posti --force

# Only load specific tables
posti --dialect postgres --database posti --tables postalcodes,addresses
```

### CLI Options

```
posti [command] [options]

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
```

### Config File

Instead of CLI flags, you can use a config file. Create `posti.config.js`:

```js
export default {
  dialect: "postgres",       // postgres, mysql, mariadb, sqlite
  host: "localhost",
  port: 5432,
  user: "posti",
  password: "posti",
  database: "posti",
  tablePrefix: "posti_",
  migrate: true,             // Auto-run migrations on startup (disable with false)

  process: {
    chunkSize: 1000,         // Rows per bulk insert
    deleteOnComplete: true,  // Remove temp files after processing
  },

  // Which tables to process (default: all three)
  tables: ["addresses", "postalcodes", "postalcode_changes"],
};
```

Config file resolution order:
1. `--config` CLI flag
2. `POSTI_CONFIG` environment variable
3. `$XDG_CONFIG_HOME/posti/config.js` (defaults to `~/.config/posti/config.js`)
4. `./posti.config.js` in current directory

### Environment Variables

All settings can be set via environment variables (overrides config file):

```bash
POSTI_DIALECT=postgres
POSTI_HOST=localhost
POSTI_PORT=5432
POSTI_USER=posti
POSTI_PASSWORD=posti
POSTI_DATABASE=posti
POSTI_TABLE_PREFIX=posti_
POSTI_CONFIG=/path/to/config.js
```

**Priority:** CLI flags > environment variables > config file > defaults

### Progress

The CLI displays a multi-bar progress indicator during processing:

```
files   ████████░░░░░░░░░░░░ 1/3 files
BAF_20250315.zip ████████████░░░░░░░░ Loading (4500/12000)
```

Steps shown per file: Downloading, Extracting, Converting encoding, Parsing, Loading (with row count), Upserting.

### Programmatic Usage

```typescript
import { run, loadConfig } from "posti";

const config = await loadConfig({
  dialect: "postgres",
  host: "localhost",
  database: "posti",
  user: "posti",
  password: "posti",
});

// With progress bar (default)
await run(config, { force: true });

// Silent mode (no progress output, useful for scripts/programmatic use)
await run(config, { silent: true });
```

## Database Migrations

Posti uses a lightweight custom migration system. Migration files are TypeScript modules in `src/db/migrations/` that use dialect-aware helpers to generate correct SQL for all supported databases.

### Automatic migrations

By default, `posti run` applies any pending migrations before loading data. To disable this:

```bash
# Skip migrations on startup
posti run --no-migrate

# Or in config file
export default {
  migrate: false,
  // ...
};
```

### Manual migrations

Run migrations explicitly without loading data:

```bash
posti migrate --dialect postgres --host localhost --database posti --user posti --password posti
```

### How migrations work

- Migrations are tracked in a `{tablePrefix}schema_migrations` table (created automatically)
- Each migration runs once — already-applied migrations are skipped
- Migrations must be **idempotent** (use `IF NOT EXISTS` / `IF EXISTS`) since MySQL/MariaDB auto-commit DDL
- No down migrations — write a new forward migration to undo changes

### Adding a new migration (development)

1. Create `src/db/migrations/NNN_description.ts`:
   ```typescript
   import type { Migration } from "../migrate.js";
   import { execSQL, quoteIdentifier } from "../operations.js";

   export const myMigration: Migration = {
     name: "002_add_index",
     up: async (db, config) => {
       const table = quoteIdentifier(db.dialect, `${config.tablePrefix}addresses`);
       const col1 = quoteIdentifier(db.dialect, "postal_code");
       const col2 = quoteIdentifier(db.dialect, "municipality_id_code");
       await execSQL(db, `CREATE INDEX IF NOT EXISTS idx_example ON ${table} (${col1}, ${col2})`);
     },
   };
   ```
2. Register it in `src/db/migrations/index.ts`:
   ```typescript
   import { myMigration } from "./002_add_index.js";
   export const migrations = [initialSchema, myMigration];
   ```
3. Add tests in `test/unit/migrate.test.ts`

## Posti Postal Code Services

### Documentation

**Homepage:**
- [Finnish](https://www.posti.fi/yrityksille/asiakastuki/postinumerotiedostot)
- [English](https://www.posti.fi/en/for-businesses/customer-support/postal-code-services)
- [Swedish](https://www.posti.fi/sv/for-foretag/kundsupport/postnummerfiler)

**Service Description and Terms of Use:**
- [Finnish](https://www.posti.fi/mzj3zpe8qb7p/1eKbwM2WAEY5AuGi5TrSZ7/33cfc2c66d2649af885b36e3935556a1/posti-postinumeropalvelut-palvelukuvaus-ja-kayttoehdot-20150101.pdf)
- [English](https://www.posti.fi/mzj3zpe8qb7p/1eKbwM2WAEY5AuGi5TrSZ7/c76a865cf5feb2c527a114b8615e9580/posti-postal-code-services-service-description-and-terms-of-use-20150101.pdf)
- [Swedish](https://www.posti.fi/mzj3zpe8qb7p/1eKbwM2WAEY5AuGi5TrSZ7/d1dfc920ff1cd5e3ef17f8234bd3d7aa/posti-postnummertjanster-tjanstebeskrivning-och-anvandnings-villkor-20150101.pdf)

### Data Files

The files can be downloaded from: https://www.posti.fi/webpcode/

Posti provides three data files:

| File | Table | Description | Update Frequency |
|------|-------|-------------|------------------|
| BAF | `addresses` | Basic Address File — street addresses with postal codes | Weekly (Saturdays after 15:00 EET/EEST) |
| PCF | `postalcodes` | Postal Code File — all postal codes with metadata | Daily (except Sundays) |
| POM | `postalcode_changes` | Postal Code Changes — history of postal code changes | Monthly (3rd business day) |

## File Paths (XDG)

The tool follows the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/latest/):

| Purpose | Default Path |
|---------|-------------|
| Config | `~/.config/posti/config.js` |
| Cache (downloaded files) | `~/.cache/posti/` |
| State (processing history) | `~/.local/state/posti/latest.json` |

Override with `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, and `XDG_STATE_HOME` environment variables.

## Development

### Setup

```bash
git clone https://github.com/kirbo/posti.git
cd posti
pnpm install
```

### Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests (SQLite runs without Docker)
pnpm test:integration

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Local Databases (Docker)

To run integration tests against MySQL, MariaDB, and PostgreSQL:

```bash
# Start database containers
docker compose up -d

# Services:
#   MySQL     — localhost:3306 (user: posti, password: posti, db: posti)
#   MariaDB   — localhost:3307 (user: posti, password: posti, db: posti)
#   PostgreSQL — localhost:5432 (user: posti, password: posti, db: posti)

# Run integration tests
pnpm test:integration

# Stop containers
docker compose down
```

### Other Commands

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Build (compile TypeScript)
pnpm build

# Run CLI in dev mode
pnpm start -- --dialect sqlite --database ./test.db --force

# Run CLI in watch mode
pnpm dev -- --dialect sqlite --database ./test.db
```

### Project Structure

```
src/
  cli.ts                  # CLI entry point
  cli/args.ts             # Argument parser
  index.ts                # Library exports
  config/                 # Configuration loading, Zod schema, XDG paths
  db/                     # Database connection, operations, dialect-specific SQL, migrations
  fetcher/                # URL parsing from Posti index page
  parser/                 # Fixed-width file parsing, encoding conversion, ZIP extraction
  loader/                 # Main orchestration pipeline, state tracking
  utils/                  # Logger, array chunking, time formatting

test/
  unit/                   # Unit tests (no external dependencies)
  integration/            # Database integration tests
```

## License

MIT
