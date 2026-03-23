---
description: Checklists for code changes — what files to update when CLI, config, DB schema, or features change
---

## Before starting any code change

Read and follow `.claude/rules/pre-flight.md`.

## Before considering any code change complete

1. Run `pnpm lint` — fix any findings.
2. If `src/`, `test/`, `package.json`, `tsconfig*.json`, `vitest.config.ts`, or `biome.json` changed:
   - Run `pnpm typecheck` — fix any type errors.
   - Run `pnpm test` — all tests must pass.
3. Skip typecheck/test for documentation-only or config-only changes (`.md` files, `.claude/`, `.gitlab-ci.yml`, `.gitignore`, `.editorconfig`, `LICENSE`).

## When CLI flags, commands, or config options change

Update **all of**:
- `src/cli.ts` (help text + command handling)
- `src/cli/args.ts` (parser and `ParsedArgs` interface)
- `src/config/index.ts` (wire new args through `loadCliOverrides`)
- `src/config/schema.ts` (Zod schema, if config option)
- `posti.config.example.js` (example config)
- `README.md` (CLI Options section, Config File section, any relevant examples)
- `test/unit/cli-args.test.ts` (new test cases)
- `test/unit/config.test.ts` (if schema changed)
- `test/unit/config-loading.test.ts` (if loadConfig behavior changed)

## When database schema changes (columns, indexes, tables)

Update:
- `src/db/dialects.ts` (column/index definitions — ensure column widths match field definitions in `src/parser/field-definitions.ts`)
- Create a new migration file in `src/db/migrations/NNN_description.ts` using dialect-aware helpers (`execSQL`, `quoteIdentifier`)
- Register the migration in `src/db/migrations/index.ts`
- Migrations must be **idempotent** (`IF NOT EXISTS` / `IF EXISTS`) — MySQL/MariaDB auto-commit DDL, so transactions don't help
- `test/unit/indexes.test.ts`
- `test/unit/sql-generation.test.ts`
- `test/unit/migrate.test.ts` (test the new migration)

## When adding any user-facing feature or behavioral change

Update `README.md` in the same pass. This includes but is not limited to:
- New flags, commands, or config options
- Changed defaults or behavior
- New output (progress bars, log format changes)
- New `RunOptions` fields (document in Programmatic Usage section)
- New file paths or directory conventions
- New npm scripts

Do not wait to be asked. If the user can see it or use it, it belongs in README.

## When updating dependencies

- Run `pnpm deps:update` to update all dependencies.
- Always re-run `pnpm lint`, `pnpm typecheck`, and `pnpm test` after updating.
- Watch for breaking changes (e.g., Zod v3 -> v4 nested defaults behavior).
- Update `packageManager` field via `corepack use pnpm@latest` if pnpm itself is outdated.

## When modifying integration tests

- When adding or modifying tests for one dialect, apply the same change to **all** dialect test files (sqlite, mysql, mariadb, postgres).
- Test names must follow consistent naming patterns per category (e.g., all upsert tests: "should handle upsert for X table").

## No empty directories

- Do not create placeholder/empty directories. Only create directories when adding files to them.
- Clean up directories that become empty after file removals.
