#!/usr/bin/env bash
set -euo pipefail

APP_NAME="aiot-hub"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_REF="${1:-}"

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*"
}

usage() {
  cat <<'EOF'
Usage:
  ./deploy/rollback.sh <git-ref>

Examples:
  ./deploy/rollback.sh HEAD~1
  ./deploy/rollback.sh v1.2.3
  ./deploy/rollback.sh 9f3c2ab

Notes:
- Working tree must be clean unless FORCE=1 is set.
- Script checks out target ref (detached HEAD), then rebuilds and restarts PM2 app.
- To return to previous branch, run: git switch -
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: missing command '$1'" >&2
    exit 1
  fi
}

check_clean_tree() {
  if [[ "${FORCE:-0}" == "1" ]]; then
    log "FORCE=1 detected, skipping clean tree check"
    return 0
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Error: working tree is not clean. Commit/stash changes or use FORCE=1" >&2
    git status --short
    exit 1
  fi
}

wait_for_health() {
  local url="http://127.0.0.1:3000/api/mqtt/status"
  local retries=20
  local delay=2
  local i

  for i in $(seq 1 "$retries"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "Health check passed at $url"
      return 0
    fi
    sleep "$delay"
  done

  log "Warning: health check did not pass in expected time"
  curl -sS "$url" || true
  return 1
}

if [[ -z "$TARGET_REF" ]]; then
  usage
  exit 1
fi

require_cmd git
require_cmd npm
require_cmd pm2
require_cmd curl

cd "$APP_DIR"

log "Starting rollback flow"
check_clean_tree

if ! git rev-parse --verify "$TARGET_REF^{commit}" >/dev/null 2>&1; then
  echo "Error: target ref not found: $TARGET_REF" >&2
  exit 1
fi

CURRENT_REF="$(git rev-parse --short HEAD)"
TARGET_COMMIT="$(git rev-parse --short "$TARGET_REF^{commit}")"

log "Current commit: $CURRENT_REF"
log "Rollback target: $TARGET_COMMIT"

# Deploy exactly the chosen revision in detached HEAD mode.
git checkout --detach "$TARGET_REF"

mkdir -p logs

log "Installing dependencies"
npm ci

if [[ "${SKIP_LINT:-0}" != "1" ]]; then
  log "Running lint"
  npm run lint
else
  log "Skipping lint because SKIP_LINT=1"
fi

log "Building application"
npm run build

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  log "Reloading PM2 app: $APP_NAME"
  pm2 reload ecosystem.config.cjs --only "$APP_NAME" --update-env
else
  log "Starting PM2 app: $APP_NAME"
  pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env
fi

pm2 save >/dev/null
wait_for_health || true

log "Rollback deployment completed"
log "Detached HEAD is active at $TARGET_COMMIT"
log "Use 'git switch -' to return to previous branch when ready"
