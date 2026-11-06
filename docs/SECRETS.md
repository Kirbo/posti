# Secrets

**This repo holds no secret.** Releasing to npm uses
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers) in its **staged** form:
the `release` job of [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) proves who it
is with a short-lived GitHub Actions OIDC ID token and may only stage a version; a maintainer
approves it on npmjs.com with 2FA. There is no npm token to store, rotate or leak, and no
repository secret or variable. The GitHub release is created with the job's own
`GITHUB_TOKEN`.

fnox is not used here: there is nothing to encrypt. If a secret is ever needed, add the fnox
scaffold the owner's other repos use (`fnox.toml` with age recipients, a helper script, fnox +
age pinned in `mise.toml`).

## npm trusted publishing

npm trusts exactly one CI identity for `posti`, configured on npmjs.com
(package `posti` → **Settings** → **Trusted publisher** → **GitHub Actions**):

| Field | Value |
|---|---|
| Organization or user | `Kirbo` |
| Repository | `posti` |
| Workflow filename | `ci.yml` |
| Environment name | `release` |
| Allowed actions | `npm stage publish` only ("Allow npm publish" and "Allow npm dist-tag" off) |

The `release` job runs only on `master` (a push, or the workflow run by hand), after every
check, test and integration job is green, in the GitHub environment `release`, with
`permissions: contents: write, id-token: write` (that job only; the workflow's default is
`contents: read`). It runs `npm stage publish` (`scripts/release.ts`) with the npm CLI bundled
in mise's Node 26 (npm 11.20.0; trusted publishing needs npm >= 11.5.1). npm adds provenance
automatically (public repository and package); package.json `repository.url` must stay
`git+https://github.com/Kirbo/posti.git`, matching the repository exactly.

Renaming the workflow file or the environment, or moving the job to another repository,
breaks releasing until the trusted publisher is updated to match.

**Approving a staged version (the maintainer's step).** A green `release` job means the
version is *staged*, not published. Approve it on npmjs.com in the **Staged Packages** tab
(review, then **Approve**; npm asks for 2FA), or from a terminal: `npm stage list posti`, then
`npm stage approve <stage-id>` (the job log and the GitHub release show the stage id).
Rejecting it (`npm stage reject <stage-id>`) leaves the vVERSION tag and GitHub release
behind: delete both before releasing the same version again.

The GitHub release and its tag are created right after staging, marked "pending approval",
because the tag is what git-cliff counts the next version from; creating them only after the
approval would need a second job, and the next push would compute (and try to stage) the same
version again.

**If the trusted publisher is missing or does not match the job,** staging fails for lack of
authentication: the job fails with a hint, nothing is staged, and no tag or release is
created. Fix the trusted publisher, then re-run the failed job (or run the workflow on
`master` by hand). npm recommends setting the package's **Settings → Publishing access** to
"Require two-factor authentication and disallow tokens": trusted publishing keeps working and
no token can publish.

## The `release` environment

GitHub creates the `release` environment on the job's first run if it does not exist. It can
be tightened in the repository's **Settings → Environments → release**: "Deployment branches
and tags" → selected branches → `master`, so no other ref can ever run a job in it.
