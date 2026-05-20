# Правила проекта KPPDF 2.0

Данный файл — точка входа во все правила микро-архитектуры. Каждый аспект разработки описан в отдельном файле.

## Быстрая навигация

| Файл | О чём |
|------|-------|
| [`angular-signals.md`](angular-signals.md) | Angular 21 Signals, строгая типизация, DI через inject(), запрет any |
| [`architecture-layers.md`](architecture-layers.md) | Структура папок (core, shared, entities, features, pages), правила импортов |
| [`ui-standards.md`](ui-standards.md) | Standalone, OnPush, SCSS + BEM, Dumb/Smart-компоненты |
| [`ui-library.md`](ui-library.md) | PrimeNG + Aura + PrimeIcons: установка, импорт, примеры |
| [`project-context.md`](project-context.md) | Описание проекта KPPDF 2.0, предметная область, ключевые сценарии |

## Основные принципы

1. **Микро-архитектура**: `core/` → `shared/` → `entities/` → `features/` → `pages/`.
2. **Angular 21+**: Standalone components, Signals, inject() — без NgModules, без constructor DI.
3. **Строгая типизация**: `any` запрещён, все модели — интерфейсы с чёткими полями.
4. **SCSS + BEM**: Никакого inline-styling. Только SCSS в отдельных файлах, BEM-именование.
5. **Состояние**: Только Signals. NGRX не используется.

> Все новые файлы и компоненты должны строго следовать этим правилам. Нарушения запрещены.