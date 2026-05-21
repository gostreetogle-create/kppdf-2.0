# @work-specialist

## Описание
Производственные задачи (WorkTask) и типы работ (WorkType). Отвечает за создание задач из позиций заказа, назначение исполнителей, отслеживание статусов, интеграцию с диаграммой Ганта.

## Зона ответственности

| Область | Описание |
|---------|----------|
| WorkType | Backend + Frontend: классификатор типов работ с привязкой к section |
| WorkTask | Создание задач из позиций заказа, назначение исполнителя |
| Статусы | Управление lifecycle задачи через EntityStatus |
| Gantt | Интеграция данных WorkTask для Frappe Gantt |
| Секции | Каждый WorkType привязан к section: 'work' | 'task' | 'drawing' |

## Domain knowledge
- `shared/types/work-type.interface.ts` — IWorkType, section
- `shared/types/work-task.interface.ts` — IWorkTask, executorId, plannedHours
- `backend/src/modules/work-task/` — модель, сервис, контроллер
- `backend/src/modules/work-type/` — справочник типов работ
- `src/app/entities/work-task/` — фронтенд
- `src/app/entities/work-type/` — фронтенд

## Контракты

- WorkTask создаётся из OrderItem: копирует `itemSnapshot.name`
- Статусы через `statusId` из EntityStatus
- `executorId` = user._id из User коллекции
- `plannedHours` → длительность в Gantt
- `dependsOn` — ссылка на предшествующую WorkTask (для зависимостей в Gantt)

## Границы
- Не управляет заказами (`@order-specialist`)
- Не управляет материалами (`@material-specialist`)
- Не планирует производство (`@production-planner`)
- Только задачи и работы
