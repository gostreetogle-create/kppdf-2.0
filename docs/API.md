# API Reference — KPPDF 2.0

**Базовый URL**: `/api/v1` (через прокси на `http://localhost:3000`)

## Аутентификация

### POST /api/v1/auth/login
Вход в систему.

```json
{ "email": "user@example.com", "password": "..." }
→ { "data": { "accessToken": "...", "refreshToken": "...", "user": { ... } } }
```

### POST /api/v1/auth/register
Регистрация нового пользователя (только для администратора).

### POST /api/v1/auth/refresh
Обновление токена.

### POST /api/v1/auth/logout
Выход (сброс refresh-токена).

## Товары (Products)

### GET /api/v1/products
Список товаров.

Параметры: `?kind=ITEM&status=active&search=насос`

```json
→ { "data": [ { "id": "...", "name": "...", "sku": "...", "kind": "ITEM", "status": "active", "categoryId": "...", "specId": "..." } ] }
```

### GET /api/v1/products/:id
Один товар.

### POST /api/v1/products
Создать товар.

```json
{ "name": "Насос Н-100", "sku": "N-100", "kind": "ITEM", "categoryId": "...", "status": "draft" }
```

### PUT /api/v1/products/:id
Обновить товар.

### DELETE /api/v1/products/:id
Удалить товар.

## Контрагенты (Counterparties)

### GET /api/v1/counterparties
Список контрагентов.

### GET /api/v1/counterparties/:id
Один контрагент.

### POST /api/v1/counterparties
Создать.

### PUT /api/v1/counterparties/:id
Обновить.

### DELETE /api/v1/counterparties/:id
Удалить.

### GET /api/v1/counterparties/by-inn/:inn
Поиск по ИНН (DaData).

## Коммерческие предложения (KP)

### GET /api/v1/kp
Список КП.

### GET /api/v1/kp/:id
Одно КП.

### GET /api/v1/kp/next-number
Получить следующий номер КП.

Параметры: `?kpType=standard`

### POST /api/v1/kp
Создать КП.

### PUT /api/v1/kp/:id
Обновить.

### DELETE /api/v1/kp/:id
Удалить.

## Заказы (Orders)

### GET /api/v1/orders
Список заказов.

Параметры: `?statusId=...&priority=high&search=...`

### GET /api/v1/orders/:id
Один заказ.

### GET /api/v1/orders/:id/items
Заказ с позициями.

```json
→ { "data": { "order": {...}, "items": [...] } }
```

### POST /api/v1/orders
Создать заказ.

```json
{ "counterpartyId": "...", "kpIds": ["..."], "items": [...] }
```

### PUT /api/v1/orders/:id
Обновить.

### DELETE /api/v1/orders/:id
Удалить.

## Позиции заказа (OrderItems)

### GET /api/v1/order-items/by-order/:orderId
Позиции заказа.

### POST /api/v1/order-items
Создать позицию.

### PUT /api/v1/order-items/:id
Обновить.

### DELETE /api/v1/order-items/:id
Удалить.

## Статусы (EntityStatus)

### GET /api/v1/entity-statuses/:entityType
Статусы для типа сущности (`order`, `work-task`, `material-request`).

### POST /api/v1/entity-statuses
Создать статус.

### PUT /api/v1/entity-statuses/:entityType/:statusId
Обновить.

### DELETE /api/v1/entity-statuses/:entityType/:statusId
Удалить.

## Категории и спецификации (Spec)

### GET /api/v1/spec/categories
Все категории.

### GET /api/v1/spec/categories/:id
Одна категория с шаблоном атрибутов.

### POST /api/v1/spec/categories
Создать категорию.

### PUT /api/v1/spec/categories/:id
Обновить.

### DELETE /api/v1/spec/categories/:id
Удалить.

### GET /api/v1/spec/specs/:specId
Спецификация изделия (Digital Twin) со всеми атрибутами и BOM.

### POST /api/v1/spec/specs
Создать спецификацию для товара.

```json
{ "productId": "...", "categoryId": "..." }
```

### POST /api/v1/spec/specs/:specId/advance
Продвинуть жизненный цикл (`as_ordered → as_designed → as_built → as_maintained`).

### POST /api/v1/spec/specs/:specId/bom
Сохранить BOM-дерево.

```json
{ "bom": { "id": "...", "type": "assembly", "name": "...", "children": [...] } }
```

## Производство (Production)

### POST /api/v1/production/flatten-bom
Разузлование BOM в плоский список материалов.

```json
{ "bom": {...} }
→ { "data": { "flattened": [...], "cost": 1234.50, "leadTimeDays": 14 } }
```

### POST /api/v1/production/cost-rollup
Расчёт себестоимости по BOM.

### POST /api/v1/production/create-material-requests
Создать MaterialRequest на основе BOM.

## Compliance (Валидация)

### POST /api/v1/compliance/check
Проверить соответствие (Ordered vs Designed / Designed vs Built).

```json
{
  "sourceAttributes": [...],
  "targetAttributes": [...],
  "rules": [{ "attributeCode": "...", "operator": "≥", "expectedValue": 100 }]
}
→ { "data": { "compliant": true, "violations": [] } }
```

## Производственные задачи (WorkTask)

### GET /api/v1/work-tasks/by-order-item/:orderItemId
Задачи по позиции заказа.

### POST /api/v1/work-tasks
Создать задачу.

### PUT /api/v1/work-tasks/:id
Обновить.

### DELETE /api/v1/work-tasks/:id
Удалить.

## Материальные заявки (MaterialRequest)

### GET /api/v1/material-requests/by-order/:orderId
Заявки по заказу.

### POST /api/v1/material-requests
Создать заявку.

### PUT /api/v1/material-requests/:id/approve
Утвердить заявку.

```json
{ "approvedQuantity": 100, "approvedBy": "..." }
```

## Настройки (Settings)

### GET /api/v1/settings
Все настройки.

### PATCH /api/v1/settings/:key
Обновить настройку.

```json
{ "value": "[\"шт\",\"м\",\"кг\"]" }
```

## Уведомления (Notifications)

### GET /api/v1/notifications/unread
Непрочитанные уведомления.

### PATCH /api/v1/notifications/:id/read
Отметить прочитанным.

### PATCH /api/v1/notifications/read-all
Отметить все прочитанными.

### GET /api/v1/notifications/sse?token=...
Server-Sent Events для realtime-уведомлений.

## Вложения (Attachments)

### GET /api/v1/attachments/by-entity/:entityType/:entityId
Вложения для сущности.

## Health Check

### GET /health
Проверка работоспособности.

```json
→ { "status": "ok", "timestamp": "2026-05-21T10:00:00.000Z", "mongodb": "connected" }
```

## Формат ответов

### Успех
```json
{ "data": T, "total?: number }
```

### Ошибка
```json
{ "error": { "message": "...", "code": "..." } }
```
