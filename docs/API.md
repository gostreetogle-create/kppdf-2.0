# KPPDF 2.0 — API Reference

Base URL: `/api/v1`

## Аутентификация

### POST /auth/register
Создать пользователя.

```json
// Request
{ "username": "ivan", "email": "i@ex.ru", "password": "secret123", "displayName": "Иван" }
// Response 201
{ "data": { "user": { ... }, "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 604800 } } }
```

### POST /auth/login
Войти.

```json
// Request
{ "username": "admin", "password": "admin123" }
// Response 200
{ "data": { "user": { ... }, "tokens": { ... } } }
```

### GET /auth/me
Текущий пользователь. Требует Bearer token.

```json
// Response 200
{ "data": { "user": { "_id": "...", "username": "admin", "role": "owner", ... } } }
```

### POST /auth/refresh
Обновить accessToken по refreshToken.

```json
// Request
{ "refreshToken": "..." }
// Response 200
{ "data": { "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 604800 } } }
```

---

## Продукты (Products)

Все руты требуют `Bearer token`.

### GET /products
Список продуктов.

**Query:** `?kind=ITEM&isActive=true&search=шкаф`

```json
// Response 200
{ "data": [ { "_id": "...", "name": "Шкаф", "price": 45000, "kind": "ITEM", ... } ], "total": 1 }
```

### GET /products/:id
Один продукт.

```json
// Response 200
{ "data": { ... } }
```

### POST /products
Создать. Роли: owner, admin, manager.

```json
// Request
{ "name": "Стул", "price": 5000, "unit": "шт", "kind": "ITEM", "description": "..." }
```

### PUT /products/:id
Обновить. Роли: owner, admin, manager.

### DELETE /products/:id
Удалить. Роли: owner, admin.

---

## Контрагенты (Counterparties)

Все руты требуют `Bearer token`.

### GET /counterparties
Список.

**Query:** `?role=client&isOurCompany=true&search=ООО`

### GET /counterparties/our-companies
Наши компании (isOurCompany === true).

### GET /counterparties/default-initiator
Компания-инициатор по умолчанию.

### GET /counterparties/:id
### POST /counterparties
### PUT /counterparties/:id
### DELETE /counterparties/:id

---

## Коммерческие предложения (KP)

### GET /kp
Список КП.

**Query:** `?status=draft&counterpartyId=...&search=КП-2026&limit=20&offset=0`

```json
// Response 200
{ "data": [ { ... } ], "total": 42 }
```

### GET /kp/:id
Одно КП.

### POST /kp
Создать КП. Статус: `draft`. Номер генерируется автоматически.

```json
{
  "title": "КП на поставку",
  "kpType": "standard",
  "recipient": { "name": "ООО Клиент", ... },
  "companySnapshot": { "companyId": "...", "templateKey": "default", ... },
  "items": [
    { "productId": "...", "name": "Шкаф", "price": 45000, "qty": 2, "unit": "шт" }
  ],
  "conditions": ["Оплата: 50% предоплата"],
  "vatPercent": 20
}
```

### PUT /kp/:id
Обновить КП (только draft).

### PATCH /kp/:id/status
Смена статуса.

```json
// Request
{ "status": "sent" }
// Response 200
{ "data": { ... "status": "sent", "versions": [...] } }
//
// 409 Conflict — статус уже изменён другим пользователем
```

### GET /kp/:id/calculate
Пересчёт сумм (без сохранения).

### DELETE /kp/:id
Удалить. Роли: owner, admin.

---

## Настройки (Settings)

### GET /settings
Все настройки.

### GET /settings/map
Плоский map `{ key: value }`.

### GET /settings/group/:group
По группе (`kp`, `passport`, `general`).

### GET /settings/:key
По ключу.

### POST /settings
Upsert. Роли: owner, admin.

### PUT /settings/:key
Upsert по ключу.

### DELETE /settings/:key

---

## Health

### GET /health

```json
{ "status": "ok", "timestamp": "...", "uptime": 123, "mongodb": "connected" }
```

---

## Ошибки

```json
// 400 — Validation
{ "error": { "message": "name and legalForm are required", "code": "VALIDATION_ERROR" } }

// 401 — Unauthorized
{ "error": { "message": "Missing or malformed token", "code": "UNAUTHORIZED" } }

// 403 — Forbidden
{ "error": { "message": "Requires one of roles: owner, admin", "code": "FORBIDDEN" } }

// 404 — Not Found
{ "error": { "message": "Product with id 'xxx' not found", "code": "NOT_FOUND" } }

// 409 — Conflict
{ "error": { "message": "Status was changed by another user. Refresh and retry.", "code": "CONFLICT" } }
```
