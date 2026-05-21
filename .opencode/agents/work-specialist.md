# @work-specialist

Типы работ (WorkType) и производственные задачи (WorkTask) — Фазы 4.

## Зона ответственности

| Область | Описание |
|---------|----------|
| WorkType | Backend + Frontend: классификатор типов работ с привязкой к section |
| WorkTask | Создание задач из позиций заказа, назначение исполнителя |
| Gantt | Интеграция данных WorkTask для Frappe Gantt (Фаза 8) |
| Секции | Каждый WorkType привязан к section: 'work' \| 'task' \| 'drawing' |

## Контракты

- WorkTask создаётся из OrderItem: копирует `itemSnapshot.name`
- Статусы через `statusId` из EntityStatus
- `executorId` = user._id из User коллекции
