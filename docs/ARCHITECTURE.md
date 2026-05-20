# KPPDF 2.0 — Архитектура

## Быстрый старт (локальная разработка)

```bash
# 1. Запустить MongoDB
mongod

# 2. В терминале 1 — бэкенд
cd backend
cp .env.example .env
npm install
npx tsx src/scripts/seed-admin.ts   # создать админа
npm run dev                          # Express на :3000

# 3. В терминале 2 — фронтенд
# Из корня проекта (там лежит angular.json)
ng serve                             # Angular на :4200
```

**Важно:** `proxy.conf.json` в корне перенаправляет `/api/*` из `localhost:4200` в `localhost:3000`. Без него — ошибка `"<!doctype html>" is not valid JSON`.

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Angular 21 (Standalone, Signals, OnPush) |
| UI Kit | PrimeNG 21 + Aura theme + PrimeIcons |
| Backend | Node.js 20 / Express 4 |
| Database | MongoDB 7 + Mongoose |
| Auth | JWT (access 7d + refresh 30d) |
| Build | Angular CLI / esbuild, tsc |

## Структура монорепозитория

```
kppdf-2.0/
├── shared/           # Canonical TypeScript интерфейсы + константы
│   ├── types/        #   IKp, IProduct, ICounterparty, IUser, ISettings
│   └── constants/    #   KP_STATUS_TRANSITIONS, ROLE_PERMISSIONS
├── src/              # Angular frontend
│   └── app/
│       ├── core/     #   ApiService, AuthService, AuthStore, guards, interceptors
│       ├── shared/   #   UI-компоненты, pipes, utils + локальные копии types
│       ├── entities/ #   Бизнес-сущности (product, deal, counterparty...)
│       ├── features/ #   Пользовательские сценарии
│       └── pages/    #   Страницы (роутинг)
├── backend/          # Express backend
│   └── src/
│       ├── core/     #   config, database connection
│       ├── shared/   #   errors, middleware (error handler)
│       └── modules/  #   auth, product, counterparty, kp, settings, health
├── docs/             # Документация
└── deploy/           # Deploy-скрипты
```

## Слои импортов (micro-architecture)

```
core/ → только shared/, внешние библиотеки
shared/ → только внешние библиотеки (НИКОГДА core/, entities/, features/)
entities/ → shared/, core/, другие entities/ (только модели)
features/ → shared/, core/, entities/
pages/ → всё ниже
```

## Безопасность

- JWT accessToken (7d) в Bearer header + refreshToken (30d) для ротации
- RBAC: owner, admin, manager, viewer
- `express-rate-limit` на `/auth/login` (anti-brute-force)
- Optimistic Concurrency Control для статусов КП (findOneAndUpdate с фильтром)
- Auth Interceptor на фронтенде с очередью (queue) при refresh
- Все пароли — bcrypt 12 rounds
- CORS ограничен origin из конфига

## Статусная модель КП

```
draft ──→ sent ──→ accepted
  ↑               ↓
  └────── rejected
```

Каждый переход атомарен (OCC) и логируется в `versions[]`.

## Frontend state management

- Только Signals (NgRx запрещён)
- `AuthStore` — Signal-based, persists tokens в localStorage
- `ResourceState<T>` — loading/error/data для асинхронных данных
- `toSignal()` для конвертации Observable → Signal
- `APP_INITIALIZER` для восстановления сессии при старте

## API-ответы

```json
{
  "data": { ... },
  "total": 42
}
```

Ошибки:

```json
{
  "error": {
    "message": "Description",
    "code": "VALIDATION_ERROR"
  }
}
```

## HTTP статусы

| Статус | Когда |
|--------|-------|
| 200 | Успех |
| 201 | Создано |
| 204 | Удалено |
| 400 | Validation error |
| 401 | Не авторизован |
| 403 | Нет прав (RBAC) |
| 404 | Не найдено |
| 409 | Conflict (OCC / дубликат) |
| 429 | Rate limit |
| 500 | Internal error |

## Deploy

- Ubuntu 22.04 / 24.04
- Node.js 20 / npm
- MongoDB 7 (локально, не Docker)
- nginx reverse proxy → Angular static + Express API
- systemd для бэкенд-сервиса
- deploy.sh: git pull → npm ci → build → restart
