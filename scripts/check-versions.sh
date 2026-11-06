#!/usr/bin/env bash
# check-versions.sh — fail when package.json disagrees with mise.toml, the toolchain's single
# source of truth. Run by `mise run check` and by CI's `check` job.
#
#   - `packageManager` must name mise's pnpm: pnpm would otherwise download and switch to
#     another version, bypassing mise.lock.
#   - `engines.node` is the OLDEST supported Node (`>=MAJOR.MINOR`, the consumers'
#     requirement; CI tests every supported major), and mise's Node (the development
#     toolchain, the newest LTS) must satisfy it.
#   - `@types/node` follows the oldest supported major, never a newer one: types ahead of
#     that runtime would let code use APIs it does not have.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
mise_pnpm=$(sed -n 's/^"aqua:pnpm\/pnpm" = "\([^"]*\)"$/\1/p' mise.toml)
mise_node=$(sed -n 's/^node = "\([^"]*\)"$/\1/p' mise.toml)
pm=$(node -p 'require("./package.json").packageManager ?? ""')
engines=$(node -p 'require("./package.json").engines?.node ?? ""')
types_node=$(node -p 'require("./package.json").devDependencies?.["@types/node"] ?? ""')

if [[ -z "${mise_pnpm}" || -z "${mise_node}" ]]; then
  echo "check-versions: mise.toml pins no pnpm or node" >&2
  exit 1
fi
if [[ "${pm}" != "pnpm@${mise_pnpm}+sha512."* ]]; then
  echo "check-versions: package.json packageManager is '${pm}', mise.toml pins pnpm ${mise_pnpm}" >&2
  echo "  (set it to pnpm@${mise_pnpm}+sha512.<hex of the npm tarball's sha512 integrity>)" >&2
  fail=1
fi

# Versions as comparable numbers: 22.12 → 22012000, 26.13.0 → 26013000.
as_number() {
  local major minor patch
  IFS=. read -r major minor patch <<<"$1"
  echo $((major * 1000000 + ${minor:-0} * 1000 + ${patch:-0}))
}

if [[ ! "${engines}" =~ ^\>=([0-9]+)\.([0-9]+)(\.[0-9]+)?$ ]]; then
  echo "check-versions: package.json engines.node is '${engines}', expected '>=MAJOR.MINOR' (the oldest supported Node)" >&2
  fail=1
else
  floor="${engines#>=}"
  if (($(as_number "${mise_node}") < $(as_number "${floor}"))); then
    echo "check-versions: mise.toml node ${mise_node} does not satisfy engines.node '${engines}'" >&2
    fail=1
  fi
  if [[ -n "${types_node}" && "${types_node%%.*}" != "${floor%%.*}" ]]; then
    echo "check-versions: @types/node is ${types_node}, expected the oldest supported major (${floor%%.*}.x)" >&2
    fail=1
  fi
fi

if [[ "${fail}" -eq 0 ]]; then
  echo "check-versions: package.json matches mise.toml (node ${mise_node} satisfies ${engines}, pnpm ${mise_pnpm})"
fi
exit "${fail}"
