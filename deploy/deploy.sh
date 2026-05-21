#!/usr/bin/env bash
# KPPDF 2.0 — Скрипт деплоя
# Запускать на сервере: bash deploy/deploy.sh
set -euo pipefail

# === Конфигурация ===
APP_DIR="/var/www/kppdf"
REPO_URL="git@github.com:your-org/kppdf-2.0.git"
BRANCH="main"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
BACKEND_ENV_FILE="$APP_DIR/backend/.env"

echo "=== KPPDF 2.0 Deploy ==="
date

# 1. Загрузка nvm
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
    nvm use 22 || nvm install 22
fi

# 2. Получение последней версии кода
echo "[1/6] Pulling code from $BRANCH..."
cd "$APP_DIR"
git fetch origin
git reset --hard "origin/$BRANCH"

# 3. Установка зависимостей фронтенда
echo "[2/6] Installing frontend dependencies..."
npm ci --omit=dev --ignore-scripts 2>/dev/null || npm ci

# 4. Сборка фронтенда (Angular)
echo "[3/6] Building frontend..."
npx ng build --configuration production

# 5. Установка зависимостей бэкенда
echo "[4/6] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci --omit=dev --ignore-scripts 2>/dev/null || npm ci

# 6. Сборка бэкенда (TypeScript → JS)
echo "[5/6] Building backend..."
npx tsc

# 7. Перезапуск сервисов
echo "[6/6] Restarting services..."
sudo systemctl daemon-reload
sudo systemctl restart kppdf
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx

# 8. Проверка
sleep 3
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "=== ✅ Deploy successful! Health check: $HEALTH_CHECK ==="
else
    echo "=== ⚠️  Deploy completed but health check returned: $HEALTH_CHECK ==="
    exit 1
fi
