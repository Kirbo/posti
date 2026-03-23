---
description: Full codebase audit procedure — trigger with "please do a comprehensive review"
---

## Scope

This checklist is a **minimum baseline**, not an exhaustive list. The review must apply current best practices across every dimension of the project — including but not limited to:

- **Node.js / TypeScript** — idiomatic patterns, modern APIs, strict typing, proper error handling
- **Database** — schema design, query safety, transaction correctness, index effectiveness
- **Testing** — meaningful assertions, proper isolation, edge cases, no false positives
- **Security** — OWASP top 10, input validation, dependency supply chain
- **Code quality** — readability, maintainability, no dead code, no code smells
- **Performance** — unnecessary allocations, N+1 patterns, streaming vs buffering
- **DevOps / CI** — pipeline correctness, reproducible builds, proper caching

If something looks wrong or outdated but isn't on the checklist below, flag it anyway. When a finding falls outside the checklist, suggest adding it as a new checklist item so future reviews catch it automatically.

## Checklist

### 1. Automated checks
- [ ] `pnpm deps:check` — outdated deps and vulnerabilities
- [ ] `pnpm lint` — Biome on src/ and test/
- [ ] `pnpm typecheck` — TypeScript strict mode
- [ ] `pnpm test` — all unit and integration tests

### 2. CLAUDE.md rule compliance
- [ ] Read through all `src/` and `test/` files and verify every rule in CLAUDE.md is followed

### 3. Functional completeness
- [ ] Every CLI command in help text is implemented in `cli.ts`
- [ ] Every CLI flag in help text is wired through `args.ts` → `loadConfig` → actual behavior
- [ ] Every config schema field has a code path that uses it
- [ ] Every config schema field has tests (schema validation + integration)
- [ ] README documents all features that exist, and nothing that doesn't

### 4. Test coverage
- [ ] Every public function in `src/` has unit tests
- [ ] SQL generation functions tested per dialect (sqlite, mysql, postgres)
- [ ] Config loading tested: env vars, CLI args, priority order, error cases
- [ ] Edge cases: empty input, invalid input (NaN, corrupt JSON, non-numeric ports), boundary values, non-positive sizes
- [ ] Field definitions: overlap checks, field count checks
- [ ] Schema validation: rejection tests for invalid/boundary values (zero chunk size, float chunk size, bad prefix chars, invalid table names, port boundaries 1/65535, etc.)
- [ ] All test helper config factory functions are actually imported by test files

### 5. Doc/code sync
- [ ] CLI help text matches README CLI Options section
- [ ] Config example file matches README config example byte-for-byte (diff, don't eyeball)
- [ ] Environment variables documented match what `loadConfig` reads
- [ ] `package.json` scripts match README development section
- [ ] `engines` field matches README requirements section
- [ ] `package.json` `files` field references only files/dirs that actually exist

### 6. Configuration files
- [ ] `biome.json` includes scope matches `lint` script scope
- [ ] `tsconfig.json` strict settings enabled
- [ ] `tsconfig.build.json` target is compatible with `engines.node` minimum
- [ ] `vitest.config.ts` coverage excludes match actual project structure (no phantom paths)
- [ ] CI pipeline stages match local development workflow
