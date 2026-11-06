#!/usr/bin/env bash
# check-package.sh: check the package as npm consumers will get it (`pnpm check:package`, CI
# job `check`). Builds through `pnpm pack`'s prepack hook, then:
#
#   1. the tarball holds exactly dist/ (JS, .d.ts and their source maps), package.json,
#      README.md and LICENSE (`pnpm pack --dry-run` lists the same files);
#   2. publint: package.json fields, exports and bin point at files that exist, in the right
#      format;
#   3. are-the-types-wrong: the types resolve for every ESM consumer (profile esm-only: the
#      package ships no CommonJS build; CommonJS callers `require()` the ESM, which every
#      supported Node, >= 22.12, does synchronously);
#   4. a smoke test installs the tarball (with its dependencies) into an empty project and uses
#      it the ways consumers do: ESM import, require() from CommonJS, and the `posti` CLI.
set -euo pipefail
cd "$(dirname "$0")/.."

work=$(mktemp -d)
trap 'rm -rf "${work}"' EXIT

pnpm pack --pack-destination "${work}" >/dev/null
tarball=$(find "${work}" -maxdepth 1 -name '*.tgz' -print -quit)
[[ -n "${tarball}" ]] || {
  echo "check-package: pnpm pack wrote no tarball" >&2
  exit 1
}

echo "== tarball contents"
contents=$(tar -tzf "${tarball}" | sed 's|^package/||' | sort)
echo "${contents}"
unexpected=$(echo "${contents}" | grep -Ev '^(dist/.+\.(js|d\.ts|js\.map|d\.ts\.map)|package\.json|README\.md|LICENSE)$' || true)
if [[ -n "${unexpected}" ]]; then
  echo "check-package: unexpected files in the tarball:" >&2
  echo "${unexpected}" >&2
  exit 1
fi
for required in package.json README.md LICENSE dist/index.js dist/index.d.ts dist/cli.js; do
  grep -qx "${required}" <<<"${contents}" || {
    echo "check-package: ${required} is missing from the tarball" >&2
    exit 1
  }
done

echo "== publint"
pnpm exec publint run --strict "${tarball}"

echo "== are-the-types-wrong"
# JSON output only for the verdict: the table would also print the CommonJS resolutions the
# esm-only profile ignores. On failure, the full table says what is wrong.
if ! pnpm exec attw --profile esm-only --format json "${tarball}" >/dev/null; then
  pnpm exec attw --profile esm-only "${tarball}" || true
  exit 1
fi
echo "Types resolve for ESM consumers (node16 from ESM, bundler)."

echo "== smoke test (installed tarball)"
mkdir -p "${work}/consumer"
echo '{ "name": "consumer", "private": true }' >"${work}/consumer/package.json"
version=$(node -p 'require("./package.json").version')
(
  cd "${work}/consumer"
  # The dependencies come from the store the repo's own install filled, where it can.
  pnpm add --prefer-offline "${tarball}" >/dev/null
  node --input-type=module -e '
    import { run, loadConfig, configSchema } from "posti";
    if (typeof run !== "function" || typeof loadConfig !== "function") throw new Error("ESM: missing run/loadConfig");
    const config = configSchema.parse({ dialect: "sqlite", database: ":memory:" });
    if (config.tablePrefix === undefined) throw new Error("ESM: configSchema gave no defaults");
    console.log("ESM import: ok");
  '
  node --input-type=commonjs -e '
    const posti = require("posti");
    if (typeof posti.run !== "function") throw new Error("CommonJS: missing run");
    console.log("CommonJS require: ok");
  '
  out=$(./node_modules/.bin/posti --version)
  [[ "${out}" == "posti v${version}" ]] || {
    echo "check-package: posti --version printed '${out}', expected 'posti v${version}'" >&2
    exit 1
  }
  ./node_modules/.bin/posti --help >/dev/null
  echo "CLI (posti --version, --help): ok"
)
echo "check-package: ok"
