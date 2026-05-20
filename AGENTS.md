# KPPDF 2.0

CRM для управления коммерческими предложениями с генерацией PDF.

**Стек**: Angular 21+, Standalone Components, Signals, SCSS + BEM, PrimeNG + Aura + PrimeIcons, RxJS (только HTTP).

**Архитектура**: `core/` → `shared/` → `entities/` → `features/` → `pages/`

## Правила (загружены из `.roo/rules/`)

- `.roo/rules/rules.md` — общие принципы
- `.roo/rules/project-context.md` — предметная область
- `.roo/rules/architecture-layers.md` — структура папок и правила импортов
- `.roo/rules/angular-signals.md` — Signals, типизация, DI
- `.roo/rules/ui-standards.md` — SCSS + BEM, Dumb/Smart, OnPush

## Subagent'ы (`.opencode/agents/`)

Используй `@guardian`, `@reviewer`, `@ui-specialist`, `@tester`, `@pdf-specialist`:

- **`@guardian`** — проверяет импорты, слои, циклические зависимости
- **`@reviewer`** — code review: any, DI, NgModule, inline-стили
- **`@ui-specialist`** — PrimeNG-компоненты, BEM (только layout), SCSS, OnPush, Dumb/Smart
- **`@tester`** — генерирует Jasmine/Karma тесты
- **`@pdf-specialist`** — PDF-генерация (jsPDF, Worker, шаблоны)

## Оркестратор

**`orchestrator`** — primary-агент (переключение по Tab). Автоматически распределяет задачи между subagent'ами.

Как работает:
1. Ты даёшь задачу (например, "проверь новый компонент")
2. Orchestrator сам вызывает нужных subagent'ов по цепочке
3. Собирает результаты в единый ответ

Защита от циклов: subagent'ы не имеют доступа к Task tool, orchestrator не вызывает сам себя.

## Технические требования

- **ESLint**: `ng lint` — 0 ошибок
- **TypeScript**: strict mode, `any` запрещён
- **Тесты**: `ng test` перед коммитом
- **Формат**: `npx prettier --write .`
- **Pre-commit**: `.githooks/pre-commit` (lint + typecheck)

## Ключевые сценарии

1. Создание КП (клиент + товары + расчёт)
2. Предпросмотр и экспорт в PDF
3. Отправка клиенту
4. Управление шаблонами PDF
5. История версий документов

## Запрещено

- NGRX и другие библиотеки состояния (только Signals)
- constructor DI (только `inject()`)
- `NgModule` (только Standalone)
- Inline-стили (только SCSS + BEM)
- Циклические импорты
- Raw `<button>`/`<input>`/`<table>` (только PrimeNG)
- `shared/` не может импортировать `entities/`, `features/`, `pages/`, `core/`
