#!/usr/bin/env bash
set -euo pipefail

APP_NAME="aiot-hub"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTH_URL="http://127.0.0.1:3000/api/mqtt/status"

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: missing command '$1'" >&2
    exit 1
  fi
}

wait_for_health() {
  local retries=20
  local delay=2
  local i
  for i in $(seq 1 "$retries"); do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      log "Health check passed at $HEALTH_URL"
      return 0
    fi
    sleep "$delay"
  done
  log "Warning: health check did not pass within expected time"
  return 1
}

get_pm2_exec_cwd() {
  pm2 describe "$APP_NAME" 2>/dev/null | awk -F'│' '
    /exec cwd/ {
      v=$3
      gsub(/^ +| +$/, "", v)
      print v
      exit
    }
  '
}

log "Starting standardized deploy flow"
cd "$APP_DIR"

require_cmd node
require_cmd npm
require_cmd pm2
require_cmd curl

if [[ ! -f ".env.local" ]]; then
  if [[ -f ".env.example" ]]; then
    cp .env.example .env.local
    log "Created .env.local from .env.example (please verify secrets)"
  else
    log "Warning: .env.local missing and .env.example not found"
  fi
fi

mkdir -p logs

log "Installing dependencies"
npm ci

if [[ "${SKIP_LINT:-0}" != "1" ]]; then
  log "Running lint"
  npm run lint
else
  log "Skipping lint because SKIP_LINT=1"
fi

log "Building Next.js production bundle"
npm run build

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  existing_cwd="$(get_pm2_exec_cwd || true)"
  if [[ -n "$existing_cwd" && "$existing_cwd" != "$APP_DIR" ]]; then
    log "Detected existing PM2 app with same name but different cwd: $existing_cwd"
    log "Recreating PM2 app from current project to avoid config mismatch"
    pm2 delete "$APP_NAME"
    pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env
  else
    log "Reloading existing PM2 app: $APP_NAME"
    pm2 reload ecosystem.config.cjs --only "$APP_NAME" --update-env
  fi
else
  log "Starting PM2 app: $APP_NAME"
  pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env
fi

pm2 save >/dev/null
if ! wait_for_health; then
  log "Health endpoint response for debugging:"
  curl -sS "$HEALTH_URL" || true
fi

log "Deploy completed"
log "Useful commands: pm2 status | pm2 logs $APP_NAME --lines 100"
