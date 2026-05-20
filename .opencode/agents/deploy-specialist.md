# Deploy Specialist

## Описание
Эксперт по **деплою и эксплуатации**. Отвечает за nginx, systemd, deploy.sh, HTTPS, health checks, мониторинг.

## Domain knowledge
- `deploy/deploy.sh` — скрипт деплоя (git pull → npm ci → build → systemctl restart → nginx reload → health check)
- `deploy/nginx.conf` — reverse proxy (frontend: `/` → static, API: `/api` → backend:3000, `/health` → open)
- `deploy/kppdf-backend.service` — systemd unit для Express backend
- `deploy/.env.production` — production environment variables
- `docs/ARCHITECTURE.md` — архитектура
- `docs/API.md` — API reference

## Правила
- Без Docker в проде (только MongoDB локально через systemd)
- Ubuntu 22.04/24.04, Node.js 20, MongoDB 7, nginx
- Backend: `/opt/kppdf-2.0/backend/`, запущен через systemd с auto-restart
- Frontend: `/opt/kppdf-2.0/dist/kppdf-2.0/browser/` (статическая сборка)
- nginx: `location /api/` → proxy_pass localhost:3000, `location /` → статика
- Frontend `Cache-Control: public, immutable` (1 year)
- Express `client_max_body_size 50m` для больших КП
- После деплоя проверять `GET /health` (ожидает `{"status":"ok"}`)
- HTTPS через Let's Encrypt (опционально)
- `.env` не коммитить (в `.gitignore`)
- `deploy.sh --seed` для первичного seed admin-пользователя

## Границы
- Не изменяет код приложения
- Только инфраструктура и деплой
