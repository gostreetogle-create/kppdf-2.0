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

## 4. 🔌 ProductService

**Статус**: Создан, работает через ApiService + Signals

- `getAll()` → `products` сигнал
- Использует `toSignal` для конвертации Observable → Signal

---

## 5. 📄 ProductListFeature

**Статус**: Создан, на PrimeNG

- `p-selectButton` для фильтрации по типу
- `p-progressSpinner` для загрузки
- `p-message` для ошибок
- `p-card` для карточек товаров

---

## 6. 🚦 Роутинг

**Статус**: Настроен

```
/login → LoginPageComponent (публичный)
/ → AdminLayoutComponent (authGuard)
  /dashboard → DashboardPageComponent
  /products → ProductListPageComponent
```

---

## 7. 🔧 Агенты

**Все 14 агентов** настроены и знают актуальную архитектуру:
- Приоретет PrimeNG
- Микро-архитектура слоёв
- Signals, inject(), standalone

---

## Порядок выполнения (текущий статус)

| Шаг | Задача | Статус |
|-----|--------|--------|
| 0 | Базовая структура папок + модель Product | ✅ |
| 0.1 | PrimeNG (Aura, PrimeIcons) — установка + миграция | ✅ |
| 1 | Admin UI: Login, Layout, Dashboard, routing | ✅ |
| 2 | Backend: full scaffold (auth, products, KPs, etc.) | ✅ |
| 3 | ProductListFeature + ProductCard (PrimeNG) | ✅ |
| 4 | **Products CRUD page** (таблица + create/edit) | 🔜 |
| 5 | Counterparties page | 🔜 |
| 6 | KP list + create/edit | 🔜 |
| 7 | PDF generation | 🔜 |
| 8 | Settings page | 🔜 |
