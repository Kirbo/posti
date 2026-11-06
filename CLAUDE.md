# CLAUDE.md

## Project

Finnish postal data loader (BAF/PCF/POM) — TypeScript, pnpm, Biome, Vitest.

## Rules

- Never use `any`. Use `unknown` + type guards. No `as` without runtime check. No `// @ts-ignore`. No non-null assertions (`!`) — use type guards or optional chaining.
- Keep `strict: true` and `noUncheckedIndexedAccess: true`.
- Biome for linting/formatting. No ESLint or Prettier. Double quotes everywhere (including `.js` config files and README code blocks).
- No `console.log` in library code — use `src/utils/logger.ts`.
- Always use `pnpm`. Never `npm` or `yarn`.
- Always use `Number.parseInt` / `Number.parseFloat`, never the global forms.
- TDD: write tests first, then implement. All tests must pass: `pnpm test`.
- Always run `pnpm lint` after changes. Only run `pnpm typecheck` and `pnpm test` when `src/`, `test/`, `package.json`, `tsconfig*.json`, `vitest.config.ts`, or `biome.json` changed — skip for doc/config-only changes (`.md`, `.claude/`, `.gitlab-ci.yml`, `.gitignore`, `.editorconfig`, `LICENSE`).
- All DB writes wrapped in transactions via `withTransaction()`.
- No silent error swallowing (empty `catch {}`) unless the fallback behavior is documented. No try/catch fallback patterns (try A, catch and silently retry B).
- No hardcoded secrets outside test fixtures.
- Conventional Commits. Semantic Versioning.
- Every `fetch()` call must check `response.ok` and throw a descriptive error on failure.
- Every config/schema field must be functional — never expose an option that has no implementation.
- No dead fields in interfaces/types. If a field is not read anywhere, remove it.
- User-supplied strings used in SQL must be validated or escaped. Use `quoteIdentifier()` for **all** identifiers — table names AND column names — including in `UPDATE SET` clauses and upsert conflict handling. Never hardcode dialect-specific quoting (e.g., `"col"` or `` `col` ``); always call `quoteIdentifier(dialect, name)`.
- State/config files read from disk must be validated, not blindly cast.
- Dynamic `import()` results must be validated at runtime (`typeof mod === "object"`, `"default" in mod`, etc.) — never bare `as` cast.
- DB driver return values must be validated at runtime — use type guard helpers, not bare `as` casts.
- Numeric schema fields that must be positive must use `.positive()` (or `.min(1)`). Numeric schema fields that must be whole numbers must also use `.int()`. Utility functions accepting sizes/counts must guard against non-positive values.
- Code targeting the build output (`tsconfig.build.json`) must only use APIs available in the minimum `engines.node` version (`>=22.12`, the oldest maintained Node LTS; `@types/node` stays on that major so the types never offer a newer API).
- `lint:fix` script scope must match `lint` script scope. Both must cover `src/` and `test/`.
- CI must use `corepack install` (not `corepack prepare pnpm@latest`) to respect the `packageManager` field.
- CI integration tests must run dialect-specific test files (not a shared test) so each database is actually exercised.
- No dead exports — if a function/type is exported but never imported outside its own module, remove it.
- No dead type variants — if a union type includes a variant that no code path ever produces, remove it.
- Port-like numeric schema fields must use `.int().min(1).max(65535)`.
- Avoid redundant config across files. Keep one source of truth.
- README project structure must match the actual directory layout — no phantom paths.
- README code examples must follow the same rules as production code (e.g., use `quoteIdentifier()` for SQL identifiers, double quotes, etc.).
- README config example must exactly match `posti.config.example.js` — keep one source of truth and copy it verbatim.
- PostgreSQL is the primary target database. All examples, dialect listings, and defaults must lead with `postgres`. MySQL, MariaDB, and SQLite are secondary.
- Explicit config file paths (`--config` or `POSTI_CONFIG`) that fail to produce a valid config object must throw, never silently return defaults. Auto-discovered config files may fail silently.
- `.gitignore` must cover all generated/cached artifacts including CI-specific directories (e.g., `.pnpm-store/`).
- Integration tests must exercise INSERT and UPSERT for **every** table type (addresses, postalcodes, postalcode_changes), not just one.
- Test data for upsert tests must use non-null values in all UNIQUE key columns — SQL treats `NULL != NULL`, so null unique key columns won't trigger constraint violations.
- When adding integration tests for one dialect, add the same tests to **all** dialect test files (sqlite, mysql, mariadb, postgres) — do not leave some dialects with partial coverage.
- Internal-only helpers (e.g., `withTransaction`) must not be exported — keep the `export` keyword only on functions that are imported by other modules or re-exported from the public API.
- SQL generation tests must assert that identifiers in the output are properly quoted (e.g., backticks for MySQL, double quotes for Postgres/SQLite) — not just check for SQL keywords like `INSERT INTO` or `ON CONFLICT`.
- Data definition objects (field definitions, column lists, etc.) must not carry metadata fields that no code reads. Documentation belongs in comments, not in dead interface fields.
- Integration test names must follow a consistent naming pattern per test category (e.g., "should handle upsert for X table" for all upsert tests) — do not use ad-hoc names like "should handle upsert from temp table" that obscure which table is being tested.
- When copying file content into README (e.g., config examples), the copy must be byte-for-byte identical to the source file — including whitespace alignment. Diff the two after editing.

## Skills

- `/audit` — full codebase audit (deps, lint, typecheck, tests, manual review). See [.claude/rules/review.md](.claude/rules/review.md) for the checklist.
- `/implement <description>` — implement any code change (feature, refactor, bugfix) following the checklists in [.claude/rules/implementation.md](.claude/rules/implementation.md).

## Self-maintenance

If you discover a new rule, exception, gotcha, or workflow improvement worth preserving, suggest adding it to the relevant context file (or propose a new one). If you identify a repeatable workflow that would benefit from a skill (saved prompt with checklist), suggest creating one in `.claude/skills/`. Always ask the user before writing — present the content you'd like to add. The goal is to keep guidance accurate, current, and useful for every future session.

## Context files

**Always read the relevant file before starting work:**

| File | Read when… |
|------|-----------|
| [.claude/rules/pre-flight.md](.claude/rules/pre-flight.md) | You are about to start any implementation or review work |
| [.claude/rules/implementation.md](.claude/rules/implementation.md) | You are about to write, edit, or delete any code in `src/` or `test/` |
| [.claude/rules/review.md](.claude/rules/review.md) | You are asked to review, audit, or check the codebase |
