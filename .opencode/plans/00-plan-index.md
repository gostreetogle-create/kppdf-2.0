# KPPDF 2.0 — ПОЛНЫЙ ПЛАН РЕАЛИЗАЦИИ

> Если связь прервалась — скажи номер шага, и продолжаем.

---

## ✅ Завершено
```
[x] Шаг 0: План согласован
[x] Шаг 1: Созданы EAV-типы (attribute, bom, material, category, requirement, process)
[x] Шаг 2: Созданы все 25 агентов (включая @meta-architect, @production-planner, @compliance-validator)
[x] Шаг 3: Обновлён project-context.md — CRM → PLM+ERP+CRM платформа
[x] Шаг 4: Создан plm-spec.md — Master Plan архитектурной трансформации
```

## ❌ Очередь

### Этап A: Фундамент (backend + shared)
```
[x] A1: shared/types/     — Создать канонические TypeScript интерфейсы
[x] A2: shared/constants/ — Создать статусы, transitions, permissions
[x] A3: backend/          — Express scaffold + MongoDB + health check
[x] A4: backend/auth/     — Модуль авторизации (JWT, bcrypt, логин)
[x] A5: backend/product/  — Модуль товаров (CRUD)
[x] A6: backend/counterparty/ — Модуль контрагентов (CRUD)
[x] A7: backend/kp/       — Модуль КП (CRUD + статусы + расчёты)
[x] A8: backend/settings/ — Модуль настроек
```

### Этап B: API-слой на фронтенде
```
[x] B1: core/api/         — ApiService (универсальный HTTP-клиент)
[x] B2: core/api/         — Interceptor (JWT, ошибки)
[x] B3: Подключить entity-сервисы к реальному API
[x] B4: Обновить product.model.ts на shared/types
```

### Этап C: PLM-ядро (Digital Twin)
```
[x] C1: shared/types/     — EAV: IAttributeDef, IAttributeValue, IAttributeGroup
[x] C2: shared/types/     — BOM: IComponentNode (иерархический)
[x] C3: shared/types/     — Material: IMaterialItem, MaterialCategory
[x] C4: shared/types/     — Category: IProductCategory, IProductSpec
[x] C5: shared/types/     — Requirement: IRequirement
[x] C6: shared/types/     — Process: IProcessOp
[x] C7: shared/constants/ — PRODUCT_STATUSES, INSTALLATION_METHODS, и т.д.
[x] C8: backend/schemas/  — ProductCategory, ProductSpec (Mongoose)
[x] C9: Мигрировать существующий IProduct на новые типы
[x] C10: DynamicAttrForm — компонент динамических полей
[x] C11: BOMTreeEditor — компонент дерева состава
```

### Этап D: Backend-модули PLM
```
[x] D1: backend/src/modules/spec/         — CRUD категорий + спецификаций
[x] D2: backend/src/modules/production/   — Планирование производства
[x] D3: backend/src/modules/compliance/   — Валидация соответствия
```

### Этап E: Документация + деплой
```
[x] E1: docs/business-rules.md
[x] E2: docs/api.md
[x] E3: deploy/ — nginx + systemd + deploy.sh
[x] E4: Обновить opencode.json (агенты + инструкции) ✅
```

---

## Детальные планы по шагам

| Файл | Содержание |
|------|-----------|
| `01-shared-types-and-constants.md` | Все shared/types/* + constants/* файлы с полным кодом |
| `02-backend-scaffold.md` | Express scaffold, config, database, health, app.ts |
| `03-backend-auth-module.md` | Auth модуль: JWT, bcrypt, login, register, RBAC middleware |
| `04-backend-product-counterparty-modules.md` | Product + Counterparty модули |
| `05-backend-kp-module.md` | KP модуль: модель, CRUD, статусы, расчёты |
