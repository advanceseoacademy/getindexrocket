#!/usr/bin/env bash
# Recover from Cloudflare 502 — get app listening, then fix proxy
# Run on VPS as root:
#   bash /var/www/getindexrocket/scripts/vps-recover-502.sh

set -euo pipefail

APP_DIR="/var/www/getindexrocket"
PORT="${GETINDEXROCKET_PORT:-3005}"
VHOST="/usr/local/lsws/conf/vhosts/getindexrocket.com/vhost.conf"

echo "============================================"
echo " Recover getindexrocket.com (502 fix)"
echo "============================================"

cd "$APP_DIR"
git pull origin main

if [[ ! -f .env ]]; then
  echo "ERROR: missing .env"
  exit 1
fi

grep -q '^GETINDEXROCKET_PORT=' .env || echo "GETINDEXROCKET_PORT=$PORT" >> .env

echo "--- Build (skip migrate) ---"
npm ci
SKIP_DB_MIGRATE=1 bash scripts/vps-deploy.sh

echo "--- Restart PM2 on :$PORT ---"
pm2 delete getindexrocket 2>/dev/null || true
export PORT="$PORT"
pm2 start ecosystem.config.cjs --update-env
pm2 save

sleep 4
HEALTH="$(curl -sf "http://127.0.0.1:${PORT}/api/health" || true)"
echo "Health: $HEALTH"

if [[ "$HEALTH" != *"getindexrocket"* ]]; then
  echo "ERROR: app not healthy on :$PORT"
  pm2 logs getindexrocket --lines 30 --nostream || true
  exit 1
fi

if [[ -f "$VHOST" ]]; then
  echo "--- Fix LiteSpeed proxy -> :$PORT ---"
  if ! grep -q "127.0.0.1:${PORT}" "$VHOST"; then
    cp "$VHOST" "${VHOST}.bak.$(date +%s)"
    sed -i -E "s/127\.0\.0\.1:[0-9]+/127.0.0.1:${PORT}/g" "$VHOST"
  fi
  systemctl restart lsws 2>/dev/null || service lsws restart 2>/dev/null || true
fi

echo "--- Local domain test ---"
curl -sI -H "Host: getindexrocket.com" http://127.0.0.1/ | head -5 || true

echo ""
echo "If still 502: Cloudflare -> Purge cache"
echo "============================================"
