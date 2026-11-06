---
name: maintain
description: Maintenance pass for posti — bump the mise toolchain (mise.toml + mise.lock), npm dependencies, the GitHub Actions pins (actions by SHA, Node matrix, service images by digest) to their latest versions (at least a day old), keep package.json packageManager/engines in step, run the full check suite (Biome, shellcheck, tsc, unit + integration tests on all four databases, package checks, audit), check CI health and the npm publish path, reconcile the docs, report, commit. Use when the user runs /maintain or asks for a maintenance/housekeeping pass on this repo.
---

# posti maintenance pass

**What this repo is:** a TypeScript CLI + library that loads Posti's open postal data (BAF,
PCF, POM) into PostgreSQL, MySQL, MariaDB or SQLite, published to npmjs.org as `posti` (ESM +
.d.ts, Node >= 22.12; CI tests Node 22, 24 and 26). Hosted on GitHub (`Kirbo/posti`, default
branch `master`); CI is GitHub Actions on GitHub-hosted runners (`.github/workflows/ci.yml`).
Released from `master` by CI: git-cliff computes the version (`scripts/next-version.sh`),
`scripts/release.ts` stamps it into package.json in the job only, STAGES it with npm trusted
publishing (`npm stage publish`, GitHub OIDC, no token) and creates the GitHub release + tag
marked "pending npm approval". The owner then approves the staged version on npmjs.com
("Staged Packages" tab, 2FA). Toolchain: `mise.toml` (exact pins) + the committed `mise.lock`
(URLs + checksums for linux-x64, linux-arm64, macos-arm64, windows-x64). No secrets: fnox is
not used (docs/SECRETS.md).

Read `CLAUDE.md` and `.claude/rules/*.md` first; their code rules apply to every change.
Work from ground truth (registries, the locks, the live workflow runs). Finish with a report
and logically scoped Conventional Commits. **The commit type decides the release:**
`fix(deps):` for a runtime (`dependencies` / `optionalDependencies`) bump that reaches
consumers; a devDependency bump is `chore(deps):`, a toolchain/CI bump `build(deps):` /
`ci(deps):`; anything breaking for consumers is `feat!:` / `BREAKING CHANGE:`. **Never push
without the owner's OK**: a push to `master` stages a release. **Never call `op`.**

## Phase 1 — Dependencies (release age: nothing younger than 1 day)
1. Toolchain: for each `mise.toml` pin, the latest release ≥ 1 day old (`mise latest <tool>`).
   Node stays on the **latest LTS line** (nodejs.org `index.json`, `lts` set), never Current.
   pnpm stays on the aqua backend (`"aqua:pnpm/pnpm"`), latest 12.x (or the next major once it
   is out a week).
2. Any pin moved → `mise lock` (set `MISE_GITHUB_TOKEN` if GitHub's anonymous limit bites) and
   commit `mise.lock` with it. CI installs in locked mode, so a stale lock fails `check`.
3. pnpm moved → package.json `packageManager` = `pnpm@<v>+sha512.<hex>`, the hex of the npm
   tarball's `dist.integrity` (`curl -s https://registry.npmjs.org/pnpm/<v> | jq -r
   .dist.integrity`, base64 → hex). `engines.node` is the OLDEST supported Node (`>=22.12`
   now); `@types/node` stays on that major. When the oldest line reaches end of life (Node 22:
   2027-04-30), raising the floor is a breaking change (`feat!:`) and its matrix entry goes;
   a new LTS line gets a matrix entry. `bash scripts/check-versions.sh` must pass.
4. npm packages: `pnpm outdated`, then devDependencies with `pnpm add -D -E <pkg>@<version>`
   (exact pins) and runtime dependencies with `pnpm add <pkg>@^<version>` (caret ranges: it is
   a library). `pnpm-workspace.yaml` `minimumReleaseAge` refuses anything younger than a day.
   TypeScript, Vitest + @vitest/coverage-v8 (same version), Biome (after a minor or major,
   `pnpm biome migrate --write`, then update the `$schema` URL), tsx, publint,
   @arethetypeswrong/cli, the @types packages. A dependency that gains an install script must
   be listed in `pnpm-workspace.yaml` `allowBuilds` (pnpm 12 fails the install otherwise).
   Watch the native optional dependency `better-sqlite3` (N-API prebuilds since 13.x).
5. GitHub Actions pins in `.github/workflows/ci.yml`:
   - each `uses:` at the latest release's **commit SHA** with the tag in the comment
     (`git ls-remote --tags https://github.com/<owner>/<action>.git`; ≥ 1 day old);
   - `MISE_VERSION` (the mise binary; latest release ≥ 1 day old);
   - the `test` matrix: the latest 22.x and 24.x, and mise.toml's 26.x;
   - the `integration` service images `tag@sha256:<index digest>` (`docker buildx imagetools
     inspect <image:tag>`), the same majors (MySQL 8.4, MariaDB 11.8 LTS, PostgreSQL 17) unless
     the owner decides otherwise; `docker-compose.yaml` uses the same references.
   A floating tag, a tag-only action or a missing digest is a defect. `actionlint` must be clean
   (`mise exec actionlint@<latest> -- actionlint`).

## Phase 2 — Verify (tests first, every tool clean)
- `mise install --locked` and `pnpm install --frozen-lockfile` succeed.
- `mise run check`: check-versions, `pnpm lint` (Biome), `pnpm lint:shell`, `pnpm typecheck`
  (src + scripts), `pnpm test:unit`, `pnpm test:sqlite`, `pnpm check:package` (tarball
  contents, publint, attw, installed smoke test: ESM import, CommonJS require, the CLI),
  `pnpm audit`.
- The other databases: `docker compose up -d`, then `pnpm test:integration` (all four dialect
  files), `docker compose down`.
- Zero warnings, no suppressions (`biome-ignore`, `@ts-expect-error`, `# shellcheck
  disable`) — fix the cause or stop and ask.
- `pnpm pack --dry-run` lists only `dist/` (JS, .d.ts, maps), `package.json`, `README.md`,
  `LICENSE`.
- `mise run next-version` (or `git cliff --bumped-version`) gives the version the next push
  would release; say it in the report.
- `VERSION=<next> RELEASE_DRY_RUN=1 node scripts/release.ts` after `pnpm build`: the release's
  tarball checks and `npm stage publish --dry-run` (package.json is restored on exit).
- Behaviour changes are **test-driven** (CLAUDE.md): a failing test first, then the code; an
  integration test change goes to all four dialect files.

## Phase 3 — CI health
- The last runs on `master` are green: `gh run list --branch master --limit 5` (or, without
  `gh`, `curl -s "https://api.github.com/repos/Kirbo/posti/actions/runs?branch=master&per_page=5"
  | jq -r '.workflow_runs[] | "\(.created_at) \(.event) \(.conclusion)"'`; mind the anonymous
  rate limit of 60/h).
- Publishing: the `release` job keeps `environment: release`, `permissions: contents: write,
  id-token: write` (that job only), and mise's Node whose bundled npm is >= 11.5.1. The
  npmjs.com trusted publisher (docs/SECRETS.md) must still match: GitHub Actions, `Kirbo` /
  `posti`, workflow `ci.yml`, environment `release`, stage publish only (renaming any of them
  breaks releasing). Staged versions waiting for approval: `npm stage list posti` (logged in);
  remind the owner of any. Compare the latest GitHub release with npm's `dist-tags.latest`
  (`curl -s https://registry.npmjs.org/posti | jq '."dist-tags"'`).
- The repo needs no Actions secret or variable.

## Phase 4 — Docs
`README.md` (requirements, install, usage, development, releases, CI, project structure —
CLAUDE.md's README rules apply), `CLAUDE.md`, `.claude/rules/*.md`, `docs/SECRETS.md` and the
comments in `mise.toml`, `pnpm-workspace.yaml`, `.github/workflows/ci.yml` and
`docker-compose.yaml` match the code, the versions and the workflow.

## Phase 5 — Report, then commit
Report per phase: bumps (old → new), locks refreshed, each tool's output (clean or not), CI
health, the next version, doc fixes, held-back items and why. Commit as above, each body
ending with the Co-Authored-By trailer. Do not push without the owner's OK.
