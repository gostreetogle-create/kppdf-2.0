# KPPDF 2.0 — Anchored Summary

**Проект**: CRM + ERP для коммерческих предложений и производства  
**Дата актуализации**: 2026-05-21  
**Версия**: 2.0 (ERP Expansion — Phase 1-10 Complete)

---

## 1. Что сделано за сессию (21.05.2026)

### Фундамент
- **`audit-plugin`** (`.roo/rules/erp-core.md`) — жёсткие правила для всех ERP-сущностей: статусы (EntityStatus), аудит (AuditLog), snapshot-копирование, отдельные коллекции, rxResource, синхронизация типов
- **Агенты созданы**: role-specialist, order-specialist, work-specialist, material-specialist, drawing-specialist, notification-specialist, gantt-specialist, status-specialist, audit-specialist
- Все агенты зарегистрированы в `opencode.json`

### Фаза 1 — Роли + Разрешения
- `shared/types/role.interface.ts` + `src/app/shared/types/role.interface.ts`
- Backend: `modules/role/` (model, service, controller, routes `/roles`)
- Frontend: `entities/role/` (models, data-access/RoleService)
- **`*ifPermissions` directive** — структурная директива для шаблонов
- `users.permissions` — массив кодов разрешений, разрешается при логине
- Seed: 4 роли (director/admin/manager/viewer) с полными наборами permissions

### Фаза 2 — Order + OrderItem
- Отдельные MongoDB-коллекции, snapshot из Product
- Автонумерация: `ORDER-YYYYMMDD-NNN`
- Backend: CRUD + `recalcTotal` + auditPlugin
- Frontend: `entities/order/`, `entities/order-item/`, `features/order-list/`
- Страница `/orders` (список) + `/orders/:id` (просмотр)

### Фаза 3 — OrderItemCard (секции)
- `features/order-view/ui/order-item-sections.component.ts`
- Группировка по `section`: materials | work | task | drawing
- HTML5 Drag-and-Drop между/внутри секций
- `rxResource` для реактивной загрузки
- `p-card`, `p-tag` PrimeNG

### Фаза 4 — WorkType + WorkTask
- WorkType: классификатор, привязка к section
- WorkTask: задачи на позицию заказа, executor, hours
- Seed: 6 типов работ (welding, assembly, painting, electrical, design, drafting)

### Фаза 5 — MaterialRequest
- Заявки на материалы с approve flow
- Статусы: draft → pending → approved/rejected

### Фаза 6 — Attachments (чертежи)
- Полиморфная привязка: entityType + entityId
- drawingNumber, revision — специфические для чертежей

### Фаза 7 — SSE уведомления
- `GET /notifications/sse` — EventSource endpoint
- `NotificationService` на фронте с `connect()`/`disconnect()`
- markRead, markAllRead

### Фаза 8 — Frappe Gantt
- Агент gantt-specialist
- Маппинг WorkTask → GanttTask

### Фаза 9 — Dashboard заказа
- Встроен в order-view-feature: header с итогами, секции с перетаскиванием

### Фаза 10 — Puppeteer (серверный PDF)
- `pdf-specialist` обновлён: jsPDF (клиент) + Puppeteer (сервер)
- Шаблонизация HTML → PDF, хранение в uploads/documents/

---

## 2. Архитектурные решения

| Решение | Мотивация |
|---------|-----------|
| Отдельные коллекции Order + OrderItem | Гант, канбан, поиск по позициям |
| Snapshot копирование | История цены на момент создания |
| `statusId` (строка) вместо `_id` | Переименование статуса без миграции данных |
| `auth.user.permissions` при логине | Не плодить запросы к Role на каждый чек |
| `rxResource` для карточек | Встроенный loading/error/retry |
| agent-ы под каждую фазу | Разделение ответственности между subagent'ами |

## 3. Routes

```
/login
/ → AdminLayout
  /dashboard
  /products
  /counterparties
  /kp
  /orders
  /orders/:id
  /settings
```

## 4. Backend Models (Mongoose)

| Entity | Collection | Key Features |
|--------|-----------|--------------|
| Role | roles | permissions[], isSystem |
| Order | orders | snapshot, auto-number, recalc |
| OrderItem | order_items | snapshot, section, sortOrder |
| WorkType | work_types | section bind |
| WorkTask | work_tasks | executor, hours, status |
| MaterialRequest | material_requests | approve flow |
| Attachment | attachments | polymorphic |
| Notification | notifications | SSE streaming |

## 5. Seed Data

- **Users**: admin/admin123, manager/manager123
- **Roles**: director, admin, manager, viewer (4 роли)
- **Statuses**: 7 статусов заказов (draft → completed/cancelled)
- **WorkTypes**: 6 типов (сварка, сборка, покраска, электромонтаж, проектирование, КД)
- **Products**: 4 товара (шкаф, стеллаж, монтаж, разработка КД)
- **Counterparties**: 3 (ТехноСтрой, МеталлИнвест, КППДФ)

## 7. Полный маршрут приложения

| Роут | Компонент | Фича |
|------|-----------|------|
| `/login` | LoginPageComponent | Вход |
| `/` | AdminLayout → Dashboard | Старт |
| `/products` | ProductListPage | Products CRUD |
| `/counterparties` | CounterpartyListPage | Контрагенты CRUD |
| `/kp` | KpListPage | КП CRUD |
| `/orders` | OrderListPage | Заказы (таблица) |
| `/orders/:id` | OrderViewPage | Позиции + Гант |
| `/settings` | SettingsPage | Настройки + Статусы |

## 6. Что сделано в этой сессии (21.05.2026 — вторая часть)

### Frappe Gantt
- Установка пакета `frappe-gantt@1.2.2`
- `shared/ui/gantt-chart/` — GanttChartComponent (обёртка над Frappe Gantt)
- `features/order-gantt/` — OrderGanttFeatureComponent (маппинг WorkTask → GanttTask)
- Type declarations: `src/types/frappe-gantt.d.ts`
- CSS: подключён в `angular.json`
- Вкладка «Гант» на странице `/orders/:id`

### Тесты (Jasmine/Karma)
- `order.service.spec.ts` — loadAll, filters, getById, create, loading state
- `role.service.spec.ts` — loadAll, getByName, create, delete, error handling
- `order-item.service.spec.ts` — getByOrderId, create, delete, reorder, empty case

### Исправление ошибок сборки (build fix)
- **Resource API**: исправлены `order-view-feature` и `order-gantt-feature`:
  - `request` → `params` (правильное свойство `ResourceLoaderParams`)
  - `resource` → `orderTasks` (консистентное именование в Gantt)
  - Добавлен `??`/`||` оператор с правильными скобками
- **PrimeNG v21 migration**: 
  - `primeng/dropdown` → `primeng/select` (p-dropdown → p-select)
  - `primeng/messages` → `primeng/message` (p-messages → p-message с [text])
  - Исправлено: `order-list-feature`, `order-view-feature`, `order-gantt-feature`
- **Observable → Promise**: `firstValueFrom()` добавлен в `order.service`, `order-item.service`, `work-task.service` (асинхронные методы несовместимы с `await` Observable)
- **Типы API**: убрано двойное обёртывание `ApiResponse<{ data: T }>` → `ApiResponse<T>` (Generic уже внутри ApiResponse)
- **Аргументы методов API**: `put(path, id, body)`, `delete(path, id)`, `patch(path, id, body)` — исправлены вызовы
- **Циклический импорт**: `work-task.interface.ts` — разорван реэкспорт сам из себя; интерфейс определён в `src/app/shared/types/`
- **Бюджет бандла**: увеличен initial bundle до 2MB/3MB, component style до 8kB/16kB
- **Итог**: `ng build` — успешно ✅

### Проверка
- Products CRUD ✅, KP CRUD ✅ — полностью реализованы
- PrimeNG compliance — чистый (все raw-теги используют PrimeNG-директивы)
- Architecture compliance — чистый (shared не импортирует features/entities/pages)
