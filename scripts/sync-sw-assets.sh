#!/usr/bin/env bash
# Generate ASSETS and CACHE_NAME in sw.js.
#
# Usage:
#   scripts/sync-sw-assets.sh --write
#   scripts/sync-sw-assets.sh --check
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SW="$ROOT/sw.js"
START='/* sync-sw-assets:start */'
END='/* sync-sw-assets:end */'

mode="${1:-}"
cache_id="${2:-}"

if [[ "$mode" != "--write" && "$mode" != "--check" ]]; then
  echo "Usage: $0 --write|--check [cache-id]" >&2
  exit 2
fi

if [[ -z "$cache_id" ]]; then
  cache_id="$(git -C "$ROOT" rev-parse --short=7 HEAD 2>/dev/null || echo 0000000)"
fi

assets=("./")
for name in index.html style.css main.js manifest.webmanifest; do
  if [[ ! -f "$ROOT/$name" ]]; then
    echo "Missing required asset: $name" >&2
    exit 1
  fi
  assets+=("./$name")
done

if [[ ! -d "$ROOT/icons" ]]; then
  echo "Missing icons/ directory" >&2
  exit 1
fi

icon_count=0
while IFS= read -r icon; do
  assets+=("./icons/$(basename "$icon")")
  icon_count=$((icon_count + 1))
done < <(find "$ROOT/icons" -maxdepth 1 -type f ! -name '.*' | sort)

if [[ "$icon_count" -eq 0 ]]; then
  echo "No files found in icons/" >&2
  exit 1
fi

expected_assets="$(printf '%s\n' "${assets[@]}")"

existing_assets="$(
  sed -n '/sync-sw-assets:start/,/sync-sw-assets:end/p' "$SW" \
    | sed -n "s/^  '\\(.*\\)',\$/\\1/p"
)"

if [[ "$mode" == "--check" ]]; then
  if [[ "$existing_assets" == "$expected_assets" ]]; then
    echo "ASSETS in sw.js is up to date."
    exit 0
  fi
  echo "ASSETS in sw.js is out of date." >&2
  echo "Expected:" >&2
  echo "$expected_assets" | sed 's/^/  /' >&2
  echo "Found:" >&2
  echo "$existing_assets" | sed 's/^/  /' >&2
  echo >&2
  echo "Run: scripts/sync-sw-assets.sh --write" >&2
  exit 1
fi

block="$(
  echo "$START"
  echo "const CACHE_NAME = 'minesweeper-${cache_id}';"
  echo "const ASSETS = ["
  for asset in "${assets[@]}"; do
    echo "  '${asset}',"
  done
  echo "];"
  echo "$END"
)"

if ! grep -Fq "$START" "$SW" || ! grep -Fq "$END" "$SW"; then
  echo "Markers not found in sw.js" >&2
  exit 1
fi

tmp="$(mktemp)"
{
  awk -v start="$START" '$0 == start { exit } { print }' "$SW"
  printf '%s\n' "$block"
  awk -v end="$END" '$0 == end { found=1; next } found { print }' "$SW"
} > "$tmp"

if cmp -s "$tmp" "$SW"; then
  rm -f "$tmp"
  echo "sw.js already up to date (${cache_id})."
  exit 0
fi

mv "$tmp" "$SW"
echo "Updated sw.js (CACHE_NAME=minesweeper-${cache_id}, ${#assets[@]} assets)."
