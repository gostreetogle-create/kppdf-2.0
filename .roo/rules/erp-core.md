# ERP Core — Правила для производственных сущностей

Данный файл устанавливает жёсткие правила для всех ERP-сущностей (Order, OrderItem, WorkTask, MaterialRequest, Attachment и т.д.).

## 1. Статусы (EntityStatus)

- **Все статусы — из коллекции `EntityStatus`**. Никаких хардкод-строк в коде вида `if (status === 'new')`.
- В коде используем **`statusId`** (строка: `'in_progress'`, `'completed'`), а не MongoDB `_id`. Это позволяет переименовывать label без смены логики.
- При создании сущности: `EntityStatus.findOne({ entityType, isInitial: true })`.
- Запрещено удалять статус, если есть документы с этим `statusId`.

## 2. Аудит (AuditLog)

- **Все модели, критичные для бизнеса, должны подключать `auditPlugin`**.
- Критичные модели: Order, OrderItem, WorkTask, MaterialRequest, Product (изменение цены).
- `userId` передаётся через `doc.$locals.userId = req.user.sub` перед `doc.save()`.
- Плагин не блокирует операцию при ошибке записи лога.

## 3. Snapshot-копирование

- При создании OrderItem из Product — копировать `name`, `price`, `unit`, `sku` в документ позиции.
- `productId` хранить как ссылку для истории, но не подтягивать цены из Product при чтении.
- При создании Order из KP — копировать номер, реквизиты клиента, условия.

## 4. OrderItem — отдельная коллекция

- `OrderItem` хранится **в отдельной MongoDB-коллекции** со ссылкой `orderId`.
- Не хранить items как подмассив в Order.
- Это позволяет делать канбан, Гант и поиск по позициям без разворачивания всего заказа.

## 5. Синхронизация типов

- Интерфейсы для сущностей создаются **сначала в `shared/types/`** (для бэкенда).
- Затем копируются в **`src/app/shared/types/`** (для фронтенда).
- Типы должны быть идентичны. Расхождение недопустимо.
- PLM-типы (`attribute.types.ts`, `bom.types.ts`, `material.types.ts`) — основа для Цифрового Двойника.

## 6. Signals + rxResource

- Для карточек сущностей (Order, OrderItem) использовать `rxResource` из `@angular/core/rxjs-interop`.
- Это даёт автоматическую перезагрузку при смене ID и встроенную поддержку loading/error.
- Состояние не размазывать по компонентам — один Stateful Service на сущность.

## 7. Роли (Phase 1)

- Каждая фича добавляет свои permission-флаги в `Role.permissions`.
- На фронте: `*ifPermissions="['order.edit']"`.
- На бэке: `authorize('admin', 'manager')` + проверка конкретного permission'а.
