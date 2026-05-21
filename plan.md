# KPPDF 2.0 — План разработки

## 0. ✅ Установка и настройка PrimeNG (тема Aura, PrimeIcons)

**Дата**: 2026-05-20 — **Выполнено**

### Что сделано:
1. `npm install primeng @primeuix/themes primeicons` — установлены все три пакета
2. **`app.config.ts`** — добавлен `providePrimeNG({ theme: { preset: Aura } })` + `provideAnimationsAsync()`
3. **`angular.json`** — подключён `primeicons/primeicons.css` (тема Aura внедряется через JS, CSS не нужен)
4. **`.roo/rules/ui-library.md`** — создана документация PrimeNG v21 с примерами
5. **Агенты обновлены**: `ui-specialist`, `reviewer`, `guardian`, `orchestrator` — все знают про PrimeNG
6. **Все компоненты переведены на PrimeNG** — ни одного raw `<button>`/`<input>`/`<table>` в шаблонах
7. Сборка пройдена — 0 ошибок

### Дальше:
- Импортировать компоненты PrimeNG по мере использования
- В `shared/ui/` создавать только обёртки, если PrimeNG-компонента недостаточно

---

## 1. ✅ Базовая структура папок

```
src/app/
├── core/                  # ApiService, AuthService, AuthStore, guards
├── shared/
│   ├── ui/               # Обёртки над PrimeNG (пусто — пока хватает PrimeNG)
│   ├── utils/            # Пусто
│   └── pipes/            # PricePipe, ProductKindLabelPipe
├── entities/
│   └── product/
│       ├── models/       # Product interface
│       ├── ui/           # ProductCardComponent (на PrimeNG)
│       └── data-access/  # ProductService
├── features/
│   └── product-list/     # ProductListFeatureComponent (на PrimeNG)
└── pages/
    ├── product-list/     # ProductListPageComponent
    ├── login/            # LoginPageComponent (на PrimeNG)
    ├── admin-layout/     # AdminLayoutComponent (на PrimeNG)
    └── dashboard/        # DashboardPageComponent (на PrimeNG)
```

---

## 2. ✅ Модель данных (Product)

Файл: `src/app/entities/product/models/product.model.ts`

```typescript
export type ProductKind = 'ITEM' | 'SERVICE' | 'WORK';

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  kind: ProductKind;
}
```

---

## 3. ✅ Admin UI (Login, Layout, Dashboard)

**Дата**: 2026-05-20 — **Выполнено**

### Что сделано:
| Компонент | Файлы | Особенности |
|-----------|-------|-------------|
| LoginPage | `pages/login/` | `p-button`, `pInputText`, `p-message`, форма с `ngModel` |
| AdminLayout | `pages/admin-layout/` | Сайдбар с навигацией, хедер с `p-avatar`, `p-button` выхода |
| Dashboard | `pages/dashboard/` | `p-card` с PrimeIcons, счётчики |
| Роутинг | `app.routes.ts` | `/login` (без guard), `/` → AdminLayout (под authGuard), `/dashboard`, `/products` |

### Дальше:
- Страница товаров (таблица + CRUD)
- Страница контрагентов
- Страница КП (сложная)
- Страница настроек

---

## 4. ERP-архитектура (Фазы 1-10)

**Дата**: 2026-05-21 — **Выполнено**

Полная ERP-надстройка над базовой CRM.

### Фаза 1: Роли + Разрешения
- `shared/types/role.interface.ts` — IRole, IPermission, ALL_PERMISSIONS
- `backend/src/modules/role/` — model, CRUD, routes /roles
- `frontend/src/app/entities/role/` — RoleService
- `*ifPermissions` директива (permission.directive.ts)
- `agent: role-specialist`
- Роли сидятся: director, admin, manager, viewer
- Права разрешаются в `toUserJSON()` при логине

### Фаза 2: Order + OrderItem
- Отдельные коллекции (Order + OrderItem)
- Snapshot-копирование из Product
- Автонумерация: ORDER-YYYYMMDD-NNN
- CRUD + пересчёт totalSum
- `features/order-list/` — таблица с фильтрацией
- `pages/orders/` — страницы списка и просмотра
- `agent: order-specialist`
- Аудит через auditPlugin

### Фаза 3: OrderItemCard-container
- `features/order-view/ui/order-item-sections.component.ts`
- Группировка по section: materials, work, task, drawing
- Drag-and-drop между секциями (HTML5 DnD)
- rxResource для загрузки заказа + позиций
- `p-card` с PrimeNG-стилями

### Фаза 4: WorkType + WorkTask
- WorkType: классификатор типов работ (привязка к section)
- WorkTask: задачи на позицию заказа, executor, hours
- `agent: work-specialist`

### Фаза 5: MaterialRequest
- Заявки на материалы от позиции заказа
- Утверждение (approve) менеджером
- `agent: material-specialist`

### Фаза 6: Attachments + Чертежи
- Attachment: полиморфная привязка entityType+entityId
- Поля: drawingNumber, revision
- `agent: drawing-specialist`

### Фаза 7: SSE уведомления
- `GET /notifications/sse` — EventSource endpoint
- Notification CRUD + read/unread
- `agent: notification-specialist`

### Фаза 8: Frappe Gantt
- Агент gantt-specialist
- Маппинг WorkTask → GanttTask

### Фаза 9: Dashboard заказа
- Реализован в order-view-feature с секциями, итогами и перетаскиванием

### Фаза 10: Puppeteer (серверная генерация PDF)
- `pdf-specialist` обновлён: jsPDF (клиент) + Puppeteer (сервер)
- Шаблонизация через HTML → PDF

---

## 5. 🔌 Сервисы данных

**Статус**: Все сущности имеют сервисы

| Сущность | Backend route | Frontend Service |
|----------|--------------|-----------------|
| Role | /roles | RoleService |
| Order | /orders | OrderService |
| OrderItem | /order-items | OrderItemService |
| WorkType | /work-types | WorkTypeService |
| WorkTask | /work-tasks | WorkTaskService |
| MaterialRequest | /material-requests | MaterialRequestService |
| Attachment | /attachments | AttachmentService |
| Notification | /notifications | NotificationService |

---

## 6. 🚦 Роутинг

**Статус**: Настроен

```
/login → LoginPageComponent (публичный)
/ → AdminLayoutComponent (authGuard)
  /dashboard → DashboardPageComponent
  /products → ProductListPageComponent
  /counterparties → CounterpartyListPageComponent
  /kp → KpListPageComponent
  /orders → OrderListPageComponent
  /orders/:id → OrderViewPageComponent
  /settings → SettingsPageComponent
```

---

## 7. 🔧 Агенты

**Все агенты** настроены и знают актуальную архитектуру:

| Агент | Специализация |
|-------|--------------|
| guardian | Слои импортов |
| reviewer | Code review |
| ui-specialist | PrimeNG, BEM, OnPush |
| backend-specialist | Mongoose, Express |
| auth-specialist | JWT, guards |
| api-specialist | Http-клиент |
| status-specialist | EntityStatus |
| audit-specialist | AuditLog |
| settings-specialist | Settings |
| kp-specialist | КП |
| product-specialist | Продукты |
| counterparty-specialist | Контрагенты |
| **role-specialist** | Роли + пермишены |
| **order-specialist** | Order + OrderItem |
| **work-specialist** | WorkType + WorkTask |
| **material-specialist** | MaterialRequest |
| **drawing-specialist** | Attachment |
| **notification-specialist** | SSE + уведомления |
| **gantt-specialist** | Frappe Gantt |
| pdf-specialist | jsPDF + Puppeteer |
| tester | Jasmine/Karma |
| deploy-specialist | CI/CD |
| orchestrator | Оркестратор |

---

## Порядок выполнения (текущий статус)

| Шаг | Задача | Статус |
|-----|--------|--------|
| 0 | Базовая структура папок + модель Product | ✅ |
| 0.1 | PrimeNG (Aura, PrimeIcons) — установка + миграция | ✅ |
| 1 | Admin UI: Login, Layout, Dashboard, routing | ✅ |
| 2 | Backend: full scaffold (auth, products, KPs, etc.) | ✅ |
| 3 | ProductListFeature + ProductCard (PrimeNG) | ✅ |
| 4 | **ERP Фаза 1: Роли + Разрешения** | ✅ |
| 5 | **ERP Фаза 2: Order + OrderItem** | ✅ |
| 6 | **ERP Фаза 3: OrderItemCard container** | ✅ |
| 7 | **ERP Фаза 4-10: Work, Materials, Attachments, SSE, Gantt, Dashboard, Puppeteer** | ✅ |
| 8 | Products CRUD (таблица + create/edit) | ✅ |
| 9 | КР create/edit (сложная форма) | ✅ |
| 10 | **Frappe Gantt** (npm install + компонент) | ✅ |
| 11 | **Тесты для ERP** (Order, Role, OrderItem) | ✅ |
