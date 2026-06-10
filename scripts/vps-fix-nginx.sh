#!/usr/bin/env bash
# Fix nginx 502 — point getindexrocket.com proxy to Node on :3005
# Run on VPS as root:
#   bash /var/www/getindexrocket/scripts/vps-fix-nginx.sh

set -euo pipefail

PORT="${GETINDEXROCKET_PORT:-3005}"
UPSTREAM="http://127.0.0.1:${PORT}"

echo "============================================"
echo " Fix nginx proxy -> $UPSTREAM"
echo "============================================"

# Verify app is up
if ! curl -sf "http://127.0.0.1:${PORT}/api/health" | grep -q getindexrocket; then
  echo "ERROR: app not healthy on :$PORT — run vps-recover-502.sh first"
  exit 1
fi

mapfile -t CONF_FILES < <(
  grep -rlE 'getindexrocket|127\.0\.0\.1:300[0-9]' \
    /etc/nginx/sites-enabled \
    /etc/nginx/conf.d \
    /etc/nginx/sites-available 2>/dev/null | sort -u
)

if [[ ${#CONF_FILES[@]} -eq 0 ]]; then
  echo "No nginx site files found — creating /etc/nginx/sites-available/getindexrocket.com.conf"
  cat > /etc/nginx/sites-available/getindexrocket.com.conf <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name getindexrocket.com www.getindexrocket.com;

    location / {
        proxy_pass ${UPSTREAM};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
}
NGINX
  ln -sf /etc/nginx/sites-available/getindexrocket.com.conf /etc/nginx/sites-enabled/getindexrocket.com.conf
  CONF_FILES=(/etc/nginx/sites-available/getindexrocket.com.conf)
fi

for f in "${CONF_FILES[@]}"; do
  [[ -f "$f" ]] || continue
  cp "$f" "${f}.bak.$(date +%s)"
  sed -i -E "s|proxy_pass[[:space:]]+http://127\.0\.0\.1:[0-9]+|proxy_pass ${UPSTREAM}|g" "$f"
  sed -i -E "s|proxy_pass[[:space:]]+http://localhost:[0-9]+|proxy_pass ${UPSTREAM}|g" "$f"
  echo "Patched: $f"
done

nginx -t
systemctl reload nginx

echo ""
echo "--- Test via nginx ---"
curl -sI -H "Host: getindexrocket.com" http://127.0.0.1/ | head -8
curl -s -H "Host: getindexrocket.com" http://127.0.0.1/api/health
echo ""
echo "Purge Cloudflare cache, then open https://getindexrocket.com"
echo "============================================"
