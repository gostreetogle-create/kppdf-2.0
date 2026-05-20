# Архитектура проекта: Micro-architecture

## Разделение на слои

```
src/
├── app/
│   ├── core/          # Глобальное: сервисы (API, Auth), интерцепторы, гварды
│   ├── shared/        # Переиспользуемое: UI-компоненты, утилиты, пайпы
│   │   ├── ui/        #   Глупые компоненты (кнопки, инпуты, модалки)
│   │   ├── utils/     #   Чистые функции-хелперы
│   │   └── pipes/     #   Angular-пайпы
│   ├── entities/      # Бизнес-сущности (product, user, order, deal)
│   │   └── {entity}/
│   │       ├── models/       #   Интерфейсы и типы
│   │       ├── data-access/  #   Сервисы для работы с сущностью
│   │       └── ui/           #   Карточки, визуализация сущности
│   ├── features/      # Сценарии пользователя (add-to-cart, create-deal)
│   │   └── {feature}/
│   │       ├── ui/           #   Компоненты фичи
│   │       └── data-access/  #   Сервисы фичи (если нужны)
│   └── pages/         # Экранные компоненты (роутинг)
│       └── {page}/
│           ├── ui/           #   Компонент страницы
│           └── data-access/  #   Только если логика не делегируется ниже
```

## Правила импортов (кто кого может импортировать)

| Слой | Может импортировать |
|------|-------------------|
| `core/` | Только внешние библиотеки, `shared/` |
| `shared/` | Только внешние библиотеки. **Никогда** `core/`, `entities/`, `features/`, `pages/` |
| `entities/` | `shared/`, `core/`, другие `entities/` (только модели) |
| `features/` | `shared/`, `core/`, `entities/`, другие `features/` |
| `pages/` | `shared/`, `core/`, `entities/`, `features/` |

### Запрещено

- `shared/` **НЕ может** импортировать из `features/`, `pages/`, `entities/` или `core/`.
- `core/` **НЕ может** импортировать из `entities/`, `features/`, `pages/`.
- Циклические импорты запрещены категорически.
- Импорт из соседнего entity-модуля — только через `models/` (типы). Не импортируй сервисы одного entity в сервисы другого — выноси общую логику в `core/`.

## Структура feature-модуля

Каждый feature — это папка внутри `features/`. Feature представляет один пользовательский сценарий.

Пример feature `create-deal`:

```
features/create-deal/
├── ui/
│   ├── create-deal-form.component.ts
│   └── create-deal-form.component.scss
└── data-access/
    └── create-deal.service.ts
```

Если логика фичи минимальна — `data-access/` может отсутствовать, и сервис лежит в `ui/` как inject-поле.