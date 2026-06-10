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

echo "--- Git pull ---"
git pull origin main

echo "--- Install dependencies ---"
npm ci

echo "--- Backup database ---"
npm run db:backup || echo "WARN: backup failed (continuing)"

echo "--- Database migrations ---"
npm run db:migrate:deploy

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
echo " Health: curl -s http://127.0.0.1:3000/api/health"
echo "============================================"
