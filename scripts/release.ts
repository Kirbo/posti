// release.ts: the CI `release` job (`node scripts/release.ts`; Node >= 22.18 runs TypeScript
// directly). STAGES posti@$VERSION on npmjs.org with npm trusted publishing, then creates the
// GitHub release (and with it the vVERSION tag) with the notes in RELEASE_NOTES.md.
//
// Staged, not published: npm's trusted publisher for this package allows only
// `npm stage publish`. The version reaches the registry once the maintainer approves it, with
// 2FA, in npmjs.com's "Staged Packages" tab (or `npm stage approve <stage-id>`). So the job
// succeeding means "staged, awaiting approval". The GitHub release and tag are created right
// after staging (the tag is what git-cliff counts the next version from, so it must exist
// even before the approval), and the release says the npm version is pending approval.
//
// VERSION and the notes come from the `version` job (scripts/next-version.sh); an empty
// VERSION means nothing is releasable. dist/ comes from the `check` job.
//
// No token for npm: the npm CLI exchanges the job's GitHub OIDC ID token (the workflow grants
// `id-token: write` to this job only) for a short-lived credential, and npm signs provenance
// with it too (https://docs.npmjs.com/trusted-publishers). The GitHub release is created with
// the job's own GITHUB_TOKEN (`contents: write`).
//
// The version is stamped into package.json in this job's checkout only: CI never commits it
// back (the repo says 0.0.0-development). Safe to rerun: an existing GitHub release vVERSION
// means the version was already staged (or published) and nothing is done; a version already
// on npm is not staged again; npm refusing to stage a version twice is treated as staged.
// Staging is atomic: a failure stages nothing and creates no tag or release, and every check
// the GitHub step needs runs BEFORE staging, so there is never a staged version without its
// release.
//
// RELEASE_DRY_RUN=1 (locally, e.g. `VERSION=4.0.0 RELEASE_DRY_RUN=1 node scripts/release.ts`
// after `pnpm build`): the same tarball checks and `npm stage publish --dry-run`, no GitHub.
// It stamps package.json for the pack and puts the original back on exit.

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const PACKAGE = "posti";
const REGISTRY = "https://registry.npmjs.org";
/** npm CLI versions before this cannot stage a publish through trusted publishing. */
const MIN_NPM = [11, 5, 1];

// A function declaration, not an arrow: TypeScript narrows after a call to it only then.
function fail(message: string): never {
  console.error(`release: ${message}`);
  process.exit(1);
}

const env = (name: string): string => process.env[name] || fail(`${name} is not set`);

const run = (cmd: string, args: string[]): string =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const atLeast = (version: string, minimum: number[]): boolean => {
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  for (const [i, min] of minimum.entries()) {
    const part = parts[i] ?? 0;
    if (part !== min) return part > min;
  }
  return true;
};

/** The first `stageId` anywhere in npm's --json output. */
const findStageId = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;
  if (typeof value.stageId === "string") return value.stageId;
  for (const child of Object.values(value)) {
    const found = findStageId(child);
    if (found) return found;
  }
  return undefined;
};

/** `npm pack --json` output: the tarball's filename and the paths it holds. */
const parsePack = (output: string): { filename: string; files: string[] } => {
  const parsed: unknown = JSON.parse(output);
  const packed = Array.isArray(parsed) ? parsed[0] : undefined;
  if (!isRecord(packed) || typeof packed.filename !== "string" || !Array.isArray(packed.files)) {
    return fail("unexpected `npm pack --json` output");
  }
  const files = packed.files.map((file: unknown) =>
    isRecord(file) && typeof file.path === "string" ? file.path : fail("unexpected `npm pack --json` file entry"),
  );
  return { filename: packed.filename, files };
};

/** What the tarball may hold: the compiled package and its metadata, nothing else. */
const ALLOWED = /^(dist\/.+\.(js|d\.ts|js\.map|d\.ts\.map)|package\.json|README\.md|LICENSE)$/;
const REQUIRED = ["package.json", "README.md", "LICENSE", "dist/index.js", "dist/index.d.ts", "dist/cli.js"];

const version = process.env.VERSION ?? "";
if (version === "") {
  console.log("release: no releasable commits since the last tag; nothing to release.");
  process.exit(0);
}
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`VERSION '${version}' is not a SemVer version`);
}
const dryRun = process.env.RELEASE_DRY_RUN === "1";
const notes = dryRun ? "" : readFileSync("RELEASE_NOTES.md", "utf8");
if (!dryRun && notes.trim() === "") fail("RELEASE_NOTES.md is empty");
const tag = `v${version}`;
const npmPage = `https://www.npmjs.com/package/${PACKAGE}/v/${version}`;

// 0. GitHub first: everything its step needs is checked BEFORE staging (never a staged version
// without its release), and an existing release means this version is done.
let repoApi = "";
let headers: Record<string, string> = {};
let commit = "";
if (!dryRun) {
  repoApi = `${env("GITHUB_API_URL")}/repos/${env("GITHUB_REPOSITORY")}`;
  headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  commit = env("GITHUB_SHA");
  const existing = await fetch(`${repoApi}/releases/tags/${tag}`, { headers });
  if (existing.ok) {
    console.log(`release: GitHub release ${tag} exists: ${PACKAGE}@${version} was already staged or published.`);
    process.exit(0);
  }
  if (existing.status !== 404) fail(`GitHub answered ${existing.status} for release ${tag}`);
  // A tag without a release is a state this script never leaves behind: a human must look.
  const tagRef = await fetch(`${repoApi}/git/ref/tags/${tag}`, { headers });
  if (tagRef.ok) fail(`tag ${tag} exists without a GitHub release; resolve that by hand first`);
  if (tagRef.status !== 404) fail(`GitHub answered ${tagRef.status} for tag ${tag}`);
}

// 1. npm: stage the version, unless it is published already.
let npmState = "";
const published = await fetch(`${REGISTRY}/${PACKAGE}/${version}`);
if (published.ok) {
  console.log(`release: ${PACKAGE}@${version} is already published on npm; not staging it again.`);
  npmState = `published on npm: ${npmPage}`;
} else if (published.status !== 404) {
  fail(`${REGISTRY} answered ${published.status} for ${PACKAGE}@${version}`);
} else {
  if (!dryRun && !process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    fail("no GitHub OIDC token: the job needs `permissions: id-token: write`");
  }
  const npmVersion = run("npm", ["--version"]).trim();
  if (!atLeast(npmVersion, MIN_NPM)) {
    fail(`npm ${npmVersion} cannot stage through trusted publishing (needs >= ${MIN_NPM.join(".")})`);
  }

  const original = readFileSync("package.json", "utf8");
  const pkg: unknown = JSON.parse(original);
  if (!isRecord(pkg)) fail("package.json is not an object");
  // A dry run leaves the working tree as it found it, however it ends.
  if (dryRun) process.on("exit", () => writeFileSync("package.json", original));
  writeFileSync("package.json", `${JSON.stringify({ ...pkg, version }, null, 2)}\n`);

  // dist/ is the `check` job's: no build here, so no lifecycle scripts either.
  const packed = parsePack(run("npm", ["pack", "--ignore-scripts", "--json"]));
  const unexpected = packed.files.filter((file) => !ALLOWED.test(file));
  const missing = REQUIRED.filter((file) => !packed.files.includes(file));
  if (unexpected.length > 0 || missing.length > 0) {
    fail(`tarball contents: unexpected [${unexpected.join(", ")}], missing [${missing.join(", ")}]`);
  }
  console.log(`release: ${packed.filename}: ${packed.files.length} files`);

  console.log(`release: staging ${PACKAGE}@${version} on ${REGISTRY} (trusted publishing)`);
  const dry = dryRun ? ["--dry-run"] : [];
  const staged = spawnSync("npm", ["stage", "publish", packed.filename, "--access", "public", "--json", ...dry], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  process.stdout.write(staged.stdout ?? "");
  process.stderr.write(staged.stderr ?? "");
  if (staged.status === 0) {
    let stageId: string | undefined;
    try {
      stageId = findStageId(JSON.parse(staged.stdout));
    } catch {
      // Not JSON (e.g. a dry run's text): the stage id is only cosmetic, the status decides.
      stageId = undefined;
    }
    npmState = `staged on npm${stageId ? ` (stage id ${stageId})` : ""}, awaiting the maintainer's approval`;
  } else if (/already (been )?staged|E409|\b409\b|conflict/i.test(`${staged.stdout}${staged.stderr}`)) {
    console.log(`release: npm says ${PACKAGE}@${version} is already staged; continuing.`);
    npmState = "staged on npm, awaiting the maintainer's approval";
  } else {
    fail(
      "npm stage publish failed (see above); nothing was staged, no tag or release was created. " +
        "If npm reported missing authentication (E404 / ENEEDAUTH / E403), the trusted publisher on " +
        "npmjs.com does not match this workflow or does not allow `npm stage publish`: docs/SECRETS.md.",
    );
  }
}
console.log(`release: ${PACKAGE}@${version}: ${npmState}`);

if (dryRun) {
  console.log("release: dry run; no GitHub release.");
  process.exit(0);
}

// 2. GitHub: the release, which creates the vVERSION tag on this commit.
const pending = npmState.startsWith("staged");
const banner = pending
  ? `> **npm:** ${PACKAGE}@${version} is ${npmState}. It is not installable until a maintainer ` +
    `approves it in npmjs.com's "Staged Packages" tab (or with \`npm stage approve <stage-id>\`); ` +
    `then it is at ${npmPage}.\n\n`
  : `> **npm:** ${npmPage}\n\n`;
const created = await fetch(`${repoApi}/releases`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ tag_name: tag, target_commitish: commit, name: tag, body: `${banner}${notes}` }),
});
if (!created.ok) fail(`creating GitHub release ${tag}: ${created.status} ${await created.text()}`);
console.log(`release: created GitHub release ${tag}`);
if (pending) {
  console.log(`release: NEXT STEP: approve ${PACKAGE}@${version} in npmjs.com's "Staged Packages" tab (2FA).`);
}
