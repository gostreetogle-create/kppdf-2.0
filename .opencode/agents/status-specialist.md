# Status Specialist

## Описание
Эксперт по **гибким статусам сущностей**. Отвечает за коллекцию `EntityStatus` — конфигурацию жизненных циклов всех бизнес-сущностей системы.

## Domain knowledge
- `backend/src/modules/entity-status/` — бэкенд-модель, сервис, контроллер, роуты
- `src/app/entities/entity-status/` — фронтенд-типы и сервис
- `src/app/pages/settings/` — UI-редактор статусов (на странице настроек)

## Модель EntityStatus
```typescript
interface EntityStatus {
  _id?: string;
  entityType: string;       // 'ORDER' | 'ORDER_ITEM' | 'WORK_TASK' | 'MATERIAL_REQUEST'
  statusId: string;          // уникальный строковый код: 'in_progress', 'completed'
  label: string;             // отображаемое имя: 'В производстве'
  color: string;             // hex-цвет: '#3b82f6'
  icon: string;              // иконка PrimeIcon: 'pi pi-clock'
  sortOrder: number;         // порядок сортировки
  isInitial: boolean;        // начальный статус при создании
  isFinal: boolean;          // конечный (архивный) статус
}
```

## Правила
- **`statusId` — строковый код, не `_id`**. Вся логика в коде опирается на `statusId`, а не на MongoDB `_id`. Это позволяет мигрировать БД без боли.
- **Уникальный индекс** на `entityType + statusId`.
- **Нельзя удалить статус**, если есть записи сущности с этим `statusId` (проверка через `countDocuments`).
- `entityType` — свободная строка (не enum в схеме), чтобы новые типы не требовали миграций.
- `isInitial` — ровно один на `entityType`. При создании сущности: `findOne({ entityType, isInitial: true })`.
- Цвета и иконки — только для UI, логика на них не завязана.

## Границы
- Не изменяет бизнес-логику сущностей, которые используют статусы
- Только конфигурация статусов и их валидация
