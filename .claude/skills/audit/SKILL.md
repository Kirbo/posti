---
name: audit
description: Run a comprehensive codebase audit — deps, lint, typecheck, tests, then manual review of all source and test files
disable-model-invocation: true
---

Run a comprehensive review of the posti codebase.

## Steps

1. Read and follow `.claude/rules/pre-flight.md`.

2. Run automated checks in parallel:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`

3. Read the review checklist at `.claude/rules/review.md` and work through every item.

4. Fix all findings. After fixes, re-run lint, typecheck, and tests.

5. If any finding reveals a missing rule or checklist item, propose adding it to `CLAUDE.md` or `.claude/rules/review.md`.
