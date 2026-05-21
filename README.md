# KPPDF 2.0 — PLM + ERP + CRM платформа для малого производства

**KPPDF 2.0** — эволюция от простого генератора PDF к полноценной системе управления жизненным циклом изделия (Digital Twin). Проект объединяет CRM-слой (заказы и требования), PLM-ядро (EAV-атрибуты, BOM-дерево, категории) и ERP-функции (себестоимость, материалы, производственные задачи).

## Архитектура

```
core/ → shared/ → entities/ → features/ → pages/
```

- **`core/`** — глобальные сервисы (HTTP-клиент, Auth, JWT-перехватчик)
- **`shared/`** — переиспользуемое: UI-компоненты, типы, константы, парсеры (`DimensionParser`)
- **`entities/`** — бизнес-сущности (Product, Order, Counterparty, WorkTask, MaterialRequest)
- **`features/`** — пользовательские сценарии (spec, dynamic-attr-form, bom-tree-editor)
- **`pages/`** — экранные компоненты (маршруты)

## Ключевая концепция: Цифровой Двойник (Digital Twin)

Изделие проходит 4 стадии жизненного цикла:

```
as_ordered → as_designed → as_built → as_maintained
```

Каждый атрибут изделия имеет 4 независимых значения (по одному на стадию). Compliance Engine автоматически сверяет соответствие между стадиями.

## Технологический стек

| Компонент | Технология |
|-----------|-----------|
| Frontend | Angular 21+, Standalone Components, Signals, OnPush |
| UI-kit | PrimeNG 21+ (Aura) + PrimeIcons |
| Стили | SCSS + BEM (только для layout) |
| Состояние | Signals (NO NGRX) |
| Backend | Express.js + Mongoose (MongoDB) |
| Аутентификация | JWT + bcrypt + RBAC |
| Парсинг размеров | Встроенный `DimensionParser` ("80x80x3" → площадь/объём/вес) |

## Быстрый старт

```bash
# 1. Клонировать
git clone https://github.com/your-org/kppdf-2.0.git
cd kppdf-2.0

# 2. Фронтенд
npm install
ng serve  # → http://localhost:4200

# 3. Бэкенд (в отдельном терминале)
cd backend
cp .env.example .env   # настроить MONGO_URI, JWT_SECRET
npm install
npm run dev            # → http://localhost:3000
```

## Ключевые модули

### Shared Logic (`shared/logic/`)
- **`DimensionParser`** — парсинг размеров "80x80x3" в структуру с площадью, объёмом, весом

### Backend Modules (`backend/src/modules/`)
- **`auth/`** — JWT-авторизация, регистрация, RBAC
- **`product/`** — CRUD товаров (PLM-модель: id, name, sku, categoryId, specId)
- **`counterparty/`** — контрагенты (юрлица, ИП, физлица)
- **`kp/`** — коммерческие предложения (статусы, расчёты, снапшоты)
- **`order/`** + **`order-item/`** — заказы (OrderItem — отдельная коллекция)
- **`spec/`** — **Сердце PLM**: категории, спецификации, `advanceLifecycle()`, BOM-дерево
- **`production/`** — ERP: планирование, cost roll-up, MaterialRequest-триггеры
- **`compliance/`** — CRM: проверка соответствия (8 операторов: =, ≠, >, <, ≥, ≤, ±, range)
- **`work-task/`** — производственные задачи
- **`material-request/`** — заявки на материалы
- **`entity-status/`** — гибкие статусы сущностей
- **`settings/`** — настройки системы (key-value)
- **`notification/`** — уведомления (SSE)
- **`attachment/`** — вложения

### Frontend Features (`src/app/features/`)
- **`spec/dynamic-attr-form/`** — динамическая форма атрибутов (рендеринг по valueType)
- **`spec/bom-tree-editor/`** — редактор BOM-дерева (PrimeNG Tree + свойства узла)

## Правила архитектуры

- **Все UI-компоненты — PrimeNG.** Никаких raw `<button>`, `<input>`, `<table>`, `<dialog>`.
- **Только `inject()`.** constructor DI запрещён.
- **Только Standalone.** NgModules запрещены.
- **Только SCSS + BEM.** Inline-стили запрещены.
- **`any` запрещён.** Все модели — строго типизированные интерфейсы.

Подробнее: `.roo/rules/`, `docs/business-rules.md`, `docs/conflict-resolution-map.md`.

## План реализации

Проект выполнен на 100% по плану `00-plan-index.md`:

```
✅ A: Фундамент (backend + shared)    8/8
✅ B: API-слой (frontend)             4/4
✅ C: PLM-ядро (Digital Twin)        11/11
✅ D: Backend-модули PLM              3/3
✅ E: Документация + деплой           4/4
```

## Документация

| Документ | Содержание |
|----------|-----------|
| `docs/business-rules.md` | 11 PLM-правил, 6 ERP-правил, 5 CRM-правил, словарь терминов |
| `docs/conflict-resolution-map.md` | 5 архитектурных конфликтов и их решения |
| `docs/agent-delegation-plan.md` | 14 задач для 3 ключевых агентов (meta-architect, production-planner, compliance-validator) |
| `docs/api.md` | Полный API Reference (30+ endpoint'ов) |

## Деплой

```bash
# Production сборка
bash deploy/deploy.sh

# systemd
sudo cp deploy/kppdf.service /etc/systemd/system/
sudo systemctl enable --now kppdf

# Nginx
sudo ln -sf $(pwd)/deploy/nginx.conf /etc/nginx/sites-available/kppdf
sudo ln -sf /etc/nginx/sites-available/kppdf /etc/nginx/sites-enabled/
```

## Лицензия

MIT
