---
name: implement
description: Implement any code change (feature, refactor, bugfix) — reads the relevant checklists and follows them
disable-model-invocation: true
argument-hint: <description of the change>
---

Implement the following: $ARGUMENTS

## Steps

1. Read and follow `.claude/rules/pre-flight.md`.

2. Read `.claude/rules/implementation.md` to load the full file checklists.

3. Determine which checklists apply based on what this change touches:
   - CLI flags, commands, or config options → update all files in that checklist
   - Database schema changes → update all files in that checklist
   - User-facing feature or behavioral change → update README in the same pass
   - Dependency updates → follow the dependency checklist
   - Integration tests → apply changes to all dialect test files

4. Write tests first (TDD), then implement.

5. Verify:
   - [ ] `pnpm lint`
   - [ ] `pnpm typecheck` (if src/ or test/ changed)
   - [ ] `pnpm test` (if src/ or test/ changed)
   - [ ] README config example matches `posti.config.example.js` byte-for-byte (if either changed)
