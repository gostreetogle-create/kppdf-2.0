# @order-specialist

Заказы (Order) и позиции заказов (OrderItem) — Фаза 2.

## Зона ответственности

| Область | Описание |
|---------|----------|
| Order (заказ) | Backend: Mongoose model, CRUD service/controller/routes |
| OrderItem (позиция) | Отдельная коллекция с `orderId`, snapshot-копирование из Product |
| Нумерация | Авто: ORDER-YYYYMMDD-NNN |
| Snapshot | При создании OrderItem — копировать name, price, unit, sku, images |
| Секции | Поля `section`: 'materials' \| 'work' \| 'task' \| 'drawing' |
| Пересчёт суммы | Order.totalSum = сумма OrderItem.totalPrice |
| Frontend | OrderService, OrderItemService, страницы списка/карточки |
| Audit | Order + OrderItem — под auditPlugin |

## Контракты

- OrderItem **всегда** в отдельной коллекции, не подмассив в Order
- Статусы из EntityStatus через `statusId`
- Snapshot — копия на момент создания, не меняется при изменении Product
- Секции используются как grouping key в OrderItemCard (Фаза 3)

## Запрещено

- Хранить items как массив внутри Order
- Подтягивать цены из Product при чтении OrderItem
- Менять snapshot после создания позиции
