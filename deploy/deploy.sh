#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# KPPDF 2.0 — Deploy Script
# Usage: sudo bash deploy/deploy.sh [--seed]
# ============================================================

APP_DIR="/opt/kppdf-2.0"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/dist/kppdf-2.0/browser"
NVM_DIR="$HOME/.nvm"
NODE_VERSION="20"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

# ---- Проверки ----
[[ $EUID -eq 0 ]] || err "Запустите с sudo: sudo bash $0"

cd "$APP_DIR" || err "Директория $APP_DIR не найдена"

# ---- Git ----
log "Pull latest code..."
git fetch origin
git reset --hard origin/main
git clean -fd

# ---- Backend ----
log "Install backend deps..."
cd "$BACKEND_DIR"
npm ci --omit=dev
npm run build

# ---- Frontend ----
log "Install frontend deps..."
cd "$APP_DIR"
npm ci --omit=dev
npx ng build --configuration=production

# ---- Environment ----
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
    warn ".env не найден, копирую .env.production"
    cp "$APP_DIR/deploy/.env.production" "$BACKEND_DIR/.env"
fi

# ---- MongoDB ----
if ! systemctl is-active --quiet mongod; then
    log "Starting MongoDB..."
    systemctl start mongod
fi

# ---- Seed (опционально) ----
if [[ "${1:-}" == "--seed" ]]; then
    log "Seeding admin user..."
    cd "$BACKEND_DIR"
    npx tsx src/scripts/seed-admin.ts
fi

# ---- Restart backend ----
log "Restarting backend service..."
systemctl daemon-reload
systemctl restart kppdf-backend
systemctl enable kppdf-backend

# ---- Nginx ----
log "Reload nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/kppdf
ln -sf /etc/nginx/sites-available/kppdf /etc/nginx/sites-enabled/
nginx -t || err "nginx config невалидный"
systemctl reload nginx

# ---- Health check ----
sleep 2
HEALTH=$(curl -s http://localhost:3000/health || echo '{"status":"fail"}')
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    log "✅ Deploy success! Health: $HEALTH"
else
    err "Health check failed: $HEALTH"
fi
