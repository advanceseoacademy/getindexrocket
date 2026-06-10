#!/usr/bin/env bash
# Fix getindexrocket.com → correct Next.js app (port 3005)
# Run on VPS as root:
#   bash /var/www/getindexrocket/scripts/vps-fix-live.sh

set -euo pipefail

APP_DIR="/var/www/getindexrocket"
PORT="${GETINDEXROCKET_PORT:-3005}"
VHOST="/usr/local/lsws/conf/vhosts/getindexrocket.com/vhost.conf"

echo "============================================"
echo " Fix getindexrocket.com live proxy -> :$PORT"
echo "============================================"

cd "$APP_DIR"
git pull origin main 2>/dev/null || true

# Dedicated port — avoid conflict with advance-seo-academy on :3000
export PORT
grep -q "GETINDEXROCKET_PORT" .env 2>/dev/null || echo "GETINDEXROCKET_PORT=$PORT" >> .env

pm2 delete indexflow-api 2>/dev/null || true
pm2 delete indexflow-web 2>/dev/null || true
pm2 delete getindexrocket 2>/dev/null || true

PORT="$PORT" pm2 start ecosystem.config.cjs --update-env
pm2 save

sleep 3
echo "--- Health on :$PORT ---"
curl -s "http://127.0.0.1:${PORT}/api/health" || true
echo ""

if [[ -f "$VHOST" ]]; then
  cp "$VHOST" "${VHOST}.bak.$(date +%s)"
  sed -i -E "s/127\.0\.0\.1:[0-9]+/127.0.0.1:${PORT}/g" "$VHOST"
  echo "Updated LiteSpeed vhost -> :$PORT"
  systemctl restart lsws 2>/dev/null || service lsws restart 2>/dev/null || true
fi

# CyberPanel public_html .htaccess proxy (if present)
for ht in /home/getindexrocket.com/public_html/.htaccess /home/getindexrocket/public_html/.htaccess; do
  if [[ -f "$ht" ]]; then
    cp "$ht" "${ht}.bak.$(date +%s)"
    if grep -q "RewriteRule" "$ht" && grep -q "127.0.0.1" "$ht"; then
      sed -i -E "s/127\.0\.0\.1:[0-9]+/127.0.0.1:${PORT}/g" "$ht"
      echo "Updated $ht -> :$PORT"
    fi
  fi
done

# nginx front proxy (if used)
if [[ -f /etc/nginx/sites-enabled/getindexrocket.com.conf ]]; then
  sed -i -E "s/127\.0\.0\.1:[0-9]+/127.0.0.1:${PORT}/g" /etc/nginx/sites-enabled/getindexrocket.com.conf
  nginx -t && systemctl reload nginx
fi

echo ""
echo "--- PM2 ---"
pm2 status | grep -E "getindexrocket|indexflow|advance" || pm2 status

echo ""
echo "Test locally:"
echo "  curl -s http://127.0.0.1:${PORT}/api/health"
echo "  curl -sI -H 'Host: getindexrocket.com' http://127.0.0.1/ | head -5"
echo ""
echo "Then purge Cloudflare cache for getindexrocket.com"
echo "Expected health: {\"status\":\"ok\",\"service\":\"getindexrocket\",...}"
echo "============================================"
