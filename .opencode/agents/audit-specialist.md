# Audit Specialist

## Описание
Эксперт по **аудиту изменений**. Отвечает за коллекцию `AuditLog` и глобальный mongoose-плагин, автоматически логирующий все изменения отслеживаемых сущностей.

## Domain knowledge
- `backend/src/shared/middleware/audit.plugin.ts` — глобальный mongoose-плагин
- `backend/src/modules/audit-log/` — модель AuditLog, API для чтения
- `src/app/entities/audit-log/` — фронтенд-типы

## Модель AuditLog
```typescript
interface AuditLog {
  _id?: string;
  entityType: string;        // Имя mongoose-модели: 'Order', 'OrderItem'
  entityId: string;          // _id изменённой сущности
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  userId?: string;           // из req.user.sub
  username?: string;         // из req.user.username
  diff: {                    // только изменившиеся поля
    [field: string]: { old: unknown; new: unknown };
  };
  timestamp: Date;
}
```

## Правила
- **Плагин подключается к модели**, не пишется в каждом контроллере.
- **`diff` хранит только changed fields**, не весь документ — иначе БД раздуется.
- **`userId` передаётся через `req.user`**, который устанавливает `authenticate` middleware. Для этого плагин читает `doc.$locals.userId` или аналогичный механизм.
- **Логируется всё**: create, update (через `save` и `findOneAndUpdate`), delete (через `remove`/`findOneAndDelete`).
- **UI для просмотра** — отдельная страница или секция в админке (Фаза 0.5 только коллекция + плагин, UI — позже).
- **TTL-индекс** на `timestamp` — автозачистка записей старше N дней (по умолчанию 365).

## Границы
- Только запись логов. Чтение и UI — за limits `audit-specialist` + `settings-specialist`.
- Не влияет на бизнес-логику сущностей. Если плагин падает — логи пишутся в консоль, но не блокируют операцию.
