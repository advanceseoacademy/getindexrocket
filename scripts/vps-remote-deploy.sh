#!/usr/bin/env bash
# Full deploy on VPS — run as root on the server:
#   bash <(curl -fsSL "https://raw.githubusercontent.com/advanceseoacademy/getindexrocket/main/scripts/vps-remote-deploy.sh")

set -euo pipefail

APP_DIR="/var/www/getindexrocket"
OLD_DIR="/var/www/indexflow"

echo "============================================"
echo " GetindexRocket — full remote deploy"
echo "============================================"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Cloning repo..."
  mkdir -p "$APP_DIR"
  git clone https://github.com/advanceseoacademy/getindexrocket.git "$APP_DIR"
fi

cd "$APP_DIR"
git pull origin main

if [[ ! -f .env ]]; then
  if [[ -f "$OLD_DIR/.env" ]]; then
    echo "Copying .env from $OLD_DIR/.env (review after deploy)"
    cp "$OLD_DIR/.env" .env
  elif [[ -f "$OLD_DIR/backend/.env" ]]; then
    echo "Copying legacy backend .env — you MUST add new keys (see .env.production.example)"
    cp "$OLD_DIR/backend/.env" .env
  else
    cp .env.production.example .env
    echo "ERROR: Edit $APP_DIR/.env then re-run this script."
    exit 1
  fi
fi

# Ensure DIRECT_URL uses port 5432 (migrations hang on 6543 pooler)
if ! grep -q '^DIRECT_URL=' .env; then
  echo "Adding DIRECT_URL from DATABASE_URL (port 5432)..."
  db_url="$(grep '^DATABASE_URL=' .env | cut -d= -f2- | tr -d '"')"
  direct_url="${db_url//:6543/:5432}"
  direct_url="${direct_url//pgbouncer=true/}"
  direct_url="${direct_url%\?}"
  echo "DIRECT_URL=\"${direct_url}\"" >> .env
fi

if grep '^DIRECT_URL=' .env | grep -q ':6543'; then
  echo "Fixing DIRECT_URL port 6543 -> 5432..."
  sed -i 's/:6543/:5432/g' .env
  sed -i 's/pgbouncer=true//g' .env
fi

if ! grep -q '^NEXT_PUBLIC_APP_URL=' .env; then
  echo 'NEXT_PUBLIC_APP_URL="https://getindexrocket.com"' >> .env
fi

if ! grep -q '^ADMIN_EMAILS=' .env; then
  echo 'ADMIN_EMAILS="mdlitonislam69@gmail.com"' >> .env
fi

bash scripts/vps-deploy.sh

echo "--- Stop legacy indexflow PM2 (if running) ---"
pm2 delete indexflow-api 2>/dev/null || true
pm2 delete indexflow-web 2>/dev/null || true
pm2 save || true

echo "--- Health check ---"
sleep 2
PORT="${GETINDEXROCKET_PORT:-3005}"
curl -s "http://127.0.0.1:${PORT}/api/health" || true
echo ""
pm2 status || true

echo ""
echo "If https://getindexrocket.com still shows old site:"
echo "  CyberPanel -> getindexrocket.com -> Reverse Proxy -> http://127.0.0.1:3005"
echo "  Or restart LiteSpeed: systemctl restart lsws"

echo "============================================"
echo " Done. Test: https://getindexrocket.com/api/health"
echo " Expected: {\"status\":\"ok\",\"service\":\"getindexrocket\",...}"
echo "============================================"
