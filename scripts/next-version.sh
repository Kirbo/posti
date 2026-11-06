#!/usr/bin/env bash
# next-version.sh [--notes FILE] — the next SemVer release, from the Conventional
# Commits since the last v* tag (git-cliff, cliff.toml).
#
# Prints the version without the "v" (e.g. 2.0.0) to stdout, or nothing when no
# commit since the last tag is releasable. With --notes, also writes that
# release's notes (Markdown) to FILE; FILE is left alone when nothing is
# releasable.
#
# Releasable, as with semantic-release before: a breaking change (`type!:`
# or a BREAKING CHANGE footer) → major, `feat` → minor, `fix` or `perf` → patch.
# Anything else (docs, ci, chore, build, refactor, …) alone releases nothing,
# but is listed in the notes of the next release. git-cliff's own
# --bumped-version would bump the patch for any commit, hence the check.
#
# Needs git-cliff and jq (mise.toml) and the full history with tags.
set -euo pipefail

notes=""
if [[ "${1:-}" == "--notes" ]]; then
  notes="${2:?--notes needs a file}"
elif [[ $# -gt 0 ]]; then
  echo "usage: $0 [--notes FILE]" >&2
  exit 2
fi

cd "$(dirname "$0")/.."

releasable=$(git cliff --unreleased --context | jq '
  [.[].commits[] | select(.breaking or (.group | test("Feature|Bug Fixes|Performance")))] | length')
if [[ "${releasable}" -eq 0 ]]; then
  exit 0
fi

version=$(git cliff --bumped-version 2>/dev/null)
version="${version#v}"
[[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || {
  echo "next-version: git-cliff gave '${version}', not a SemVer version" >&2
  exit 1
}

if [[ -n "${notes}" ]]; then
  git cliff --unreleased --tag "v${version}" --strip all >"${notes}"
fi
echo "${version}"
