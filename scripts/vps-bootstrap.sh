#!/usr/bin/env bash
# First-time VPS setup for GetIndexRocket (single Next.js app)
# Run as root on VPS:
#   bash <(curl -fsSL "https://raw.githubusercontent.com/advanceseoacademy/getindexrocket/main/scripts/vps-bootstrap.sh")

set -euo pipefail

APP_DIR="/var/www/getindexrocket"
REPO="https://github.com/advanceseoacademy/getindexrocket.git"
DOMAIN="getindexrocket.com"

echo "============================================"
echo " Bootstrap GetIndexRocket on VPS"
echo "============================================"

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
  mkdir -p "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  cp .env.production.example .env
  echo ""
  echo "IMPORTANT: Edit $APP_DIR/.env with production secrets, then re-run:"
  echo "  bash scripts/vps-deploy.sh"
  exit 0
fi

bash scripts/vps-deploy.sh

echo ""
echo "Nginx: point $DOMAIN to http://127.0.0.1:3005"
echo "Example location block:"
cat <<'NGINX'

server {
    listen 80;
    server_name getindexrocket.com www.getindexrocket.com;
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

echo "============================================"
echo " Bootstrap done"
echo "============================================"
