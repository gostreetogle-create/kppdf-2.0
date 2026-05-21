# @gantt-specialist

Frappe Gantt — диаграмма заказа (Фаза 8).

## Зона ответственности

| Область | Описание |
|---------|----------|
| Frappe Gantt | Интеграция библиотеки frappe-gantt для отображения задач |
| Data mapping | WorkTask → GanttTask (id, name, start, end, progress, dependencies) |
| Order Gantt | Полная Gantt-диаграмма для всех WorkTask в заказе |

## Контракты

- Установка: `npm install frappe-gantt`
- Типы: `@types/frappe-gantt` (или кастомные declaration)
- Данные: `GET /work-tasks/by-order` — возвращает массив WorkTask
- Маппинг: `workTask.plannedHours` → длительность, `workTask.startDate` → start

## Запрещено

- Не использовать jQuery-обёртки
- Не хранить Gantt-данные отдельно — всегда из WorkTask
