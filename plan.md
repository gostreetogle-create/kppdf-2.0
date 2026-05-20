# KPPDF 2.0 — План разработки

## 0. ✅ Установка и настройка PrimeNG (тема Aura, PrimeIcons)

**Дата**: 2026-05-20 — **Выполнено**

### Что сделано:
1. `npm install primeng @primeuix/themes primeicons` — установлены все три пакета
2. **`app.config.ts`** — добавлен `providePrimeNG({ theme: { preset: Aura } })` + `provideAnimationsAsync()`
3. **`angular.json`** — подключён `primeicons/primeicons.css` (тема Aura внедряется через JS, CSS не нужен)
4. **`.roo/rules/ui-library.md`** — создана документация PrimeNG v21 с примерами
5. **Агенты обновлены**: `ui-specialist`, `reviewer`, `guardian`, `orchestrator` — все знают про PrimeNG
6. Сборка пройдена — 0 ошибок

### Дальше:
- Импортировать компоненты PrimeNG по мере использования (Button, InputText, Table, Dialog и т.д.)
- В `shared/ui/` создавать только обёртки, если PrimeNG-компонента недостаточно

---

## 1. Создание базовой структуры папок

```
src/app/
├── core/                  # Глобальные сервисы, интерцепторы, гварды
├── shared/
│   ├── ui/               # Глупые компоненты (кнопки, инпуты)
│   ├── utils/            # Чистые функции
│   └── pipes/            # Общие пайпы
├── entities/
│   └── product/
│       ├── models/       # Product interface
│       ├── ui/           # Карточка товара ProductCardComponent
│       └── data-access/  # ProductService, API-слой
├── features/
│   └── product-list/     # Фича списка товаров
└── pages/
    └── product-list/     # Page component с роутингом
```

---

## 2. Модель данных (Product)

Файл: [`src/app/entities/product/models/product.model.ts`](src/app/entities/product/models/product.model.ts)

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

## 3. 🧱 Этап 1: UI — Карточка товара (ProductCardComponent)

**Компонент**: [`src/app/entities/product/ui/product-card/product-card.component.ts`](src/app/entities/product/ui/product-card/product-card.component.ts)

### Задачи:
1. Создать `ProductCardComponent` (standalone)
2. Входные сигналы: `product = input.required<Product>()`
3. Отображение полей: название, цена, тип (ITEM/SERVICE/WORK), первое изображение
4. Пайп `price` для форматирования цены: [`src/app/shared/pipes/price.pipe.ts`](src/app/shared/pipes/price.pipe.ts)
5. Пайп `product-kind-label` для отображения русского лейбла типа: [`src/app/shared/pipes/product-kind-label.pipe.ts`](src/app/shared/pipes/product-kind-label.pipe.ts)
6. Выходной сигнал: `clicked = output<Product>()`
7. Стилизация через SCSS + BEM

**Рекомендуемый режим**: `UI Specialist`

---

## 4. 🔌 Этап 2: Data Access — ProductService

**Сервис**: [`src/app/entities/product/data-access/product.service.ts`](src/app/entities/product/data-access/product.service.ts)

### Задачи:
1. Создать `ProductService` с inject(HttpClient)
2. Метод `getAll(): Signal<Product[]>` — возвращает сигнал с массивом товаров
3. Метод `getById(id: string): Signal<Product | undefined>`
4. Использовать `toSignal` для RxJS → Signals
5. Базовый URL через environment

**Рекомендуемый режим**: `State Manager`

---

## 5. 📄 Этап 3: Фича — Список товаров (ProductListFeature)

**Feature-компонент**: [`src/app/features/product-list/product-list-feature.component.ts`](src/app/features/product-list/product-list-feature.component.ts)

### Задачи:
1. Внедрить `ProductService`
2. Загрузить список товаров через сигнал из сервиса
3. Отобразить карточки через `@for`
4. Фильтрация по `kind` (ITEM / SERVICE / WORK)
5. Обработка состояния загрузки и ошибок

**Рекомендуемый режим**: `Feature Developer`

---

## 6. 🚦 Этап 4: Page + Routing

**Page**: [`src/app/pages/product-list/product-list-page.component.ts`](src/app/pages/product-list/product-list-page.component.ts)

### Задачи:
1. Создать Page-компонент-обёртку
2. Настроить роутинг в `app.routes.ts`
3. Путь: `/products`

**Рекомендуемый режим**: `Feature Developer`

---

## Порядок выполнения

| Шаг | Задача | Режим |
|-----|--------|-------|
| 0 | ✅ Создать структуру папок и model | `Code` |
| 0.1 | ✅ Установка PrimeNG (Aura, PrimeIcons) | `UI Specialist` |
| 1 | 🧱 ProductCardComponent + пайпы | `UI Specialist` |
| 2 | 🔌 ProductService | `State Manager` |
| 3 | 📄 ProductListFeature | `Feature Developer` |
| 4 | 🚦 Page + Routing | `Feature Developer` |