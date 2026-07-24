#!/usr/bin/env bash
set -euo pipefail

SKIP_CHECK=0
SCHEMA_SYNCED=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-check)
      SKIP_CHECK=1
      shift
      ;;
    --schema-synced)
      SCHEMA_SYNCED=1
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: bash scripts/release-prod.sh --schema-synced [--skip-check]" >&2
      exit 1
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd git
require_cmd gh
require_cmd vercel
require_cmd npm

REPO_SLUG="${REPO_SLUG:-enzo-prism/tim-next-js}"
REPO_URL="${REPO_URL:-https://github.com/${REPO_SLUG}.git}"
VERCEL_PROJECT_NAME="${VERCEL_PROJECT_NAME:-tim-next-js}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-prj_bzwJ806oFI1FxU70DEIi2iyV0sl1}"
VERCEL_ORG_ID="${VERCEL_ORG_ID:-team_NbogaPSGlnnTm8RNaeS0B4Pl}"

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before release." >&2
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "main" ]]; then
  echo "Current branch is '$current_branch'. Switch to 'main' before release." >&2
  exit 1
fi

echo "Fetching latest main from origin..."
git fetch origin main --quiet

local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse origin/main)"
if [[ "$local_sha" != "$remote_sha" ]]; then
  echo "Local main is not aligned with origin/main." >&2
  echo "local:  $local_sha" >&2
  echo "remote: $remote_sha" >&2
  exit 1
fi

default_branch="$(gh api "repos/${REPO_SLUG}" --jq '.default_branch')"
if [[ "$default_branch" != "main" ]]; then
  echo "GitHub default branch is '$default_branch', not 'main'. Fix it explicitly before release." >&2
  exit 1
fi

if [[ "$SCHEMA_SYNCED" -ne 1 ]]; then
  echo "Production schema confirmation is required." >&2
  echo "Apply and verify the database migration, then rerun with --schema-synced." >&2
  exit 1
fi

echo "Verifying production lead schema..."
npm run db:verify

echo "Ensuring Vercel project is linked..."
if [[ ! -f ".vercel/project.json" ]]; then
  vercel link --yes --project "$VERCEL_PROJECT_ID" --team "$VERCEL_ORG_ID"
fi

linked_project_id="$(node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(".vercel/project.json","utf8")); process.stdout.write(data.projectId || "")')"
linked_org_id="$(node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(".vercel/project.json","utf8")); process.stdout.write(data.orgId || "")')"
linked_project_name="$(node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(".vercel/project.json","utf8")); process.stdout.write(data.projectName || "")')"

if [[ "$linked_project_id" != "$VERCEL_PROJECT_ID" || "$linked_org_id" != "$VERCEL_ORG_ID" || "$linked_project_name" != "$VERCEL_PROJECT_NAME" ]]; then
  echo "Linked Vercel project does not match the production project for this repo." >&2
  echo "Expected:" >&2
  echo "  projectName=$VERCEL_PROJECT_NAME" >&2
  echo "  projectId=$VERCEL_PROJECT_ID" >&2
  echo "  orgId=$VERCEL_ORG_ID" >&2
  echo "Found:" >&2
  echo "  projectName=${linked_project_name:-<missing>}" >&2
  echo "  projectId=${linked_project_id:-<missing>}" >&2
  echo "  orgId=${linked_org_id:-<missing>}" >&2
  echo "Recovery:" >&2
  echo "  vercel link --yes --project \"$VERCEL_PROJECT_ID\" --team \"$VERCEL_ORG_ID\"" >&2
  exit 1
fi

echo "Ensuring Vercel Git integration is connected..."
git_connect_log="$(mktemp)"
if ! vercel git connect "$REPO_URL" >"$git_connect_log" 2>&1; then
  if grep -qi "already connected" "$git_connect_log"; then
    cat "$git_connect_log"
  else
    cat "$git_connect_log" >&2
    rm -f "$git_connect_log"
    exit 1
  fi
else
  cat "$git_connect_log"
fi
rm -f "$git_connect_log"

if [[ "$SKIP_CHECK" -eq 0 ]]; then
  echo "Running quality checks..."
  npm run quality:all
else
  echo "Skipping quality checks (--skip-check)."
fi

echo "Deploying to Vercel production..."
deploy_log="$(mktemp)"
if ! vercel --prod --yes 2>&1 | tee "$deploy_log"; then
  rm -f "$deploy_log"
  exit 1
fi

deploy_url="$(grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' "$deploy_log" | tail -n 1 || true)"
rm -f "$deploy_log"

echo
echo "Release completed successfully."
if [[ -n "$deploy_url" ]]; then
  echo "Deployment URL: $deploy_url"
fi
