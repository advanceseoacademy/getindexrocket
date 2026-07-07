#!/usr/bin/env bash
# Deploy GetIndexRocket (single Next.js app) on VPS
# Usage: cd /var/www/getindexrocket && bash scripts/vps-deploy.sh

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"

echo "============================================"
echo " Deploy GetIndexRocket"
echo " Directory: $APP_DIR"
echo "============================================"

if [[ ! -f .env ]]; then
  echo "ERROR: .env missing in $APP_DIR"
  echo "Copy .env.production.example and fill secrets."
  exit 1
fi

echo "--- Indexer env ---"
node scripts/ensure-indexer-env.mjs .env || true

echo "--- Production env check ---"
node scripts/production-check.mjs || {
  code=$?
  if [[ "$code" -eq 1 ]]; then
    echo "ERROR: production-check failed — fix .env before deploy."
    exit 1
  fi
  echo "WARN: production-check warnings (continuing)"
}

echo "--- Git pull ---"
git pull origin main

echo "--- Install dependencies ---"
npm ci

echo "--- Database migrations ---"
if [[ "${SKIP_DB_MIGRATE:-}" == "1" ]]; then
  echo "SKIP_DB_MIGRATE=1 — skipping migrations"
else
  npm run db:migrate:deploy || {
    echo ""
    echo "Migration failed. To continue without migrate:"
    echo "  SKIP_DB_MIGRATE=1 bash scripts/vps-deploy.sh"
    exit 1
  }
fi

echo "--- Backup database ---"
npm run db:backup || echo "WARN: backup failed (continuing)"

echo "--- Seed admin roles ---"
npm run db:seed || true

echo "--- Build ---"
npm run build

echo "--- PM2 reload ---"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env 2>/dev/null \
    || pm2 start ecosystem.config.cjs
  pm2 save
else
  echo "PM2 not installed. Run: npm run start:prod"
fi

echo "============================================"
echo " Deploy complete"
PORT="${GETINDEXROCKET_PORT:-3005}"
echo " Health: curl -s http://127.0.0.1:${PORT}/api/health"
echo " Indexer: curl -s http://127.0.0.1:${PORT}/api/health/indexer"
echo "============================================"

echo ""
echo "--- Post-deploy indexer bootstrap ---"
if [[ -f .env ]] && grep -q '^CRON_SECRET=' .env; then
  CRON_SECRET_VAL="$(grep '^CRON_SECRET=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")"
  if [[ -n "$CRON_SECRET_VAL" ]]; then
    curl -fsS -H "Authorization: Bearer ${CRON_SECRET_VAL}" \
      "http://127.0.0.1:${PORT}/api/cron/ping-feeds" && echo " Feed ping OK" || echo "WARN: feed ping failed"
    curl -fsS -H "Authorization: Bearer ${CRON_SECRET_VAL}" \
      "http://127.0.0.1:${PORT}/api/cron/index-run" && echo " Indexer run OK" || echo "WARN: indexer run failed"
  fi
fi

echo ""
echo "--- Indexer cron (every 5 min) ---"
if [[ -f .env ]] && grep -q '^CRON_SECRET=' .env; then
  CRON_SECRET_VAL="$(grep '^CRON_SECRET=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")"
  if [[ -n "$CRON_SECRET_VAL" ]]; then
    mkdir -p logs
    CRON_LINE="*/5 * * * * curl -fsS -H \"Authorization: Bearer ${CRON_SECRET_VAL}\" \"http://127.0.0.1:${PORT}/api/cron/index-run\" >> \"$(pwd)/logs/indexer-cron.log\" 2>&1"
    (crontab -l 2>/dev/null | grep -v '/api/cron/index-run' || true; echo "$CRON_LINE") | crontab -
    echo "Indexer cron installed."
  else
    echo "WARN: CRON_SECRET empty — set it in .env and re-run deploy."
  fi
else
  echo "WARN: CRON_SECRET missing in .env — indexer queue will not auto-run."
fi
