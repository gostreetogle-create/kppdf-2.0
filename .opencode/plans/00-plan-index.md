# KPPDF 2.0 — ПОЛНЫЙ ПЛАН РЕАЛИЗАЦИИ

> Если связь прервалась — скажи номер шага, и продолжаем.

---

## ✅ Завершено
```
[x] Шаг 0: План согласован
```

## ❌ Очередь

### Этап A: Фундамент (backend + shared)
```
[ ] A1: shared/types/     — Создать канонические TypeScript интерфейсы
[ ] A2: shared/constants/ — Создать статусы, transitions, permissions
[ ] A3: backend/          — Express scaffold + MongoDB + health check
[ ] A4: backend/auth/     — Модуль авторизации (JWT, bcrypt, логин)
[ ] A5: backend/product/  — Модуль товаров (CRUD)
[ ] A6: backend/counterparty/ — Модуль контрагентов (CRUD)
[ ] A7: backend/kp/       — Модуль КП (CRUD + статусы + расчёты)
[ ] A8: backend/settings/ — Модуль настроек
```

### Этап B: API-слой на фронтенде
```
[ ] B1: core/api/         — ApiService (универсальный HTTP-клиент)
[ ] B2: core/api/         — Interceptor (JWT, ошибки)
[ ] B3: Подключить entity-сервисы к реальному API
[ ] B4: Обновить product.model.ts на shared/types
```

### Этап C: Агенты + деплой
```
[ ] C1: Создать @kp-specialist, @product-specialist, @auth-specialist
[ ] C2: docs/business-rules.md
[ ] C3: docs/api.md
[ ] C4: deploy/ — nginx + systemd + deploy.sh
[ ] C5: Обновить opencode.json
```

---

## Детальные планы по шагам

| Файл | Содержание |
|------|-----------|
| `01-shared-types-and-constants.md` | Все shared/types/* + constants/* файлы с полным кодом |
| `02-backend-scaffold.md` | Express scaffold, config, database, health, app.ts |
| `03-backend-auth-module.md` | Auth модуль: JWT, bcrypt, login, register, RBAC middleware |
| `04-backend-product-counterparty-modules.md` | Product + Counterparty модули |
| `05-backend-kp-module.md` | KP модуль: модель, CRUD, статусы, расчёты |
