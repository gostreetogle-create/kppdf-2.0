# Agent Delegation Plan — Phase Zero Implementation
> На основе Business Rules Specification (docs/business-rules.md)
> и Conflict Resolution Map (docs/conflict-resolution-map.md)

---

## 1. @meta-architect — PLM Ядро (EAV + BOM + Categories)

### Теоретическая база
- **PLM Domain (раздел 1)** — наследование атрибутов, EAV 4 состояния, BOM иерархия
- **Конфликт #1** — Reparenting при удалении BOM-узла
- **Конфликт #2** — Version Bump при изменении категории
- **Конфликт #3** — Парсинг dimension

### Задачи

#### 1.1. Реализовать `advanceLifecycle()` в spec-модуле
- Проверка PLM-2 (isRequired не-null)
- Проверка PLM-5 (все предыдущие состояния не-null)
- Запуск CRM-1 (compliance двухфазная сверка)
- Инкремент `spec.version`
- Файлы: `backend/src/modules/spec/spec.service.ts`

#### 1.2. Реализовать `removeBomNode()` с Reparenting
- Имплементировать алгоритм из Conflict Map #1
- Запретить удаление корневого узла
- Проверка PLM-7 (макс. 10 уровней)
- Проверка PLM-8 (уникальность marking)
- Файлы: `backend/src/modules/spec/spec.service.ts`

#### 1.3. Реализовать `resyncFromCategory(specId)`
- Добавление новых атрибутов (из категории, отсутствующих в spec)
- Пометка orphan для удалённых
- Обновление `isRequired`/`unit`/`allowedValues`
- Инкремент `categoryVersion`
- Файлы: `backend/src/modules/spec/spec.service.ts`

#### 1.4. Реализовать парсинг dimension (TYPE-1—3)
- Валидация формата (2-4 числовых части)
- Расчёт площади/объёма
- Интеграция с плотностью материалов для расчёта веса
- Файлы: `backend/schemas/product-spec.schema.ts` (pre-save hook)

#### 1.5. Добавить `orphan: true` в IProductSpec
- Модель спецификации должна поддерживать orphan-флаг на уровне атрибута
- Файлы: `shared/types/product.interface.ts`

### Запрещено
- Менять модель `IAttributeDef` без синхронизации с @compliance-validator
- CASCADE DELETE при удалении BOM-узла (только reparenting)
- Удалять данные orphan-атрибутов при resync

---

## 2. @production-planner — ERP Ядро (Cost + Materials + WorkTasks)

### Теоретическая база
- **ERP Domain (раздел 2)** — Roll-up Costing, Process Triggers
- **Конфликт #3** — Dimension → ERP материалы

### Задачи

#### 2.1. Реализовать `costRollup(bom)` (ERP-1—2)
- Рекурсивный расчёт `node.cost = node.costPerUnit * node.qty + Σ(child.cost)`
- Для `purchased` — подтянуть цену из `IMaterialItem`
- Для `part`/`process` — labourCost + machineCost
- Сохранение снэпшота в `specification.version`
- Файлы: `backend/src/modules/production/production.service.ts`

#### 2.2. Реализовать `leadTime(bom)` (ERP-3)
- max(child.leadTimeDays) + Σ(node.processOps.durationDays)
- Определение критического пути
- Файлы: `backend/src/modules/production/production.service.ts`

#### 2.3. Реализовать триггеры создания WorkTask (ERP-4)
- При `advance → as_designed`:
  - Для каждого BOM-узла с `processOps` → создать WorkTask
  - Связать через `orderItemId`
- Файлы: `backend/src/modules/spec/spec.service.ts` (вызов production service)

#### 2.4. Реализовать триггеры создания MaterialRequest (ERP-5—6)
- При `advance → as_designed`:
  - Для каждого BOM-узла типа `purchased` → создать MaterialRequest
  - Количество = рекурсивное умножение `node.qty * parent.qty`
  - Если есть `dimension` → конвертировать в объём (TYPE-3)
- Файлы: `backend/src/modules/production/production.service.ts`

#### 2.5. Добавить эндпоинт `POST /api/v1/production/cost-rollup`
- Вызов `costRollup` с возвратом результата
- Файлы: `backend/src/modules/production/production.routes.ts`

### Запрещено
- Автоматический пересчёт себестоимости без явного вызова пользователя (ERP-2)
- Создание WorkTask/MaterialRequest на стадиях, отличных от `as_designed`

---

## 3. @compliance-validator — CRM Ядро (Compliance Engine)

### Теоретическая база
- **CRM Domain (раздел 3)** — Compliance Engine, блокировки
- **Конфликт #4** — Compliance при null-значениях
- **Все операторы из CRM-1**

### Задачи

#### 3.1. Реализовать `checkCompliance(source, target, rules)` (CRM-1—2)
- Двухфазная проверка:
  - Фаза 1: проверка каждого атрибута по оператору
  - Фаза 2: поиск MISSING_ATTRIBUTE
- Поддержка всех 8 операторов (CRM-1 таблица)
- Поддержка `tolerance` для оператора `±`
- Возврат: `{ compliant: boolean, violations: ComplianceViolation[] }`
- Файлы: `backend/src/modules/compliance/compliance.service.ts`

```typescript
interface ComplianceViolation {
  attributeCode: string;
  attributeName: string;
  operator: ComparisonOperator;
  expected: unknown;
  actual: unknown;
  tolerance?: number;
  severity: 'warning' | 'block';
  message: string;
}
```

#### 3.2. Реализовать `checkPassportFinalization(specId)` (CRM-3—4)
- Проверка 4 условий блокировки:
  1. Обязательные атрибуты с `compliant = false` → block
  2. Наличие `MISSING_ATTRIBUTE` → block
  3. BOM-узлы с `status !== 'approved'` → block
  4. MaterialRequest не `received` → block
- Soft warning vs Hard block (CRM-4)
- Файлы: `backend/src/modules/compliance/compliance.service.ts`

#### 3.3. Интеграция с `advanceLifecycle()` (вызов compliance при advance)
- При `advance` на новую стадию — вызов `checkCompliance` между предыдущей и новой стадией
- Сохранение `compliant` флага в каждом атрибуте (PLM-6)
- Файлы: `backend/src/modules/spec/spec.service.ts` (вызов compliance service)

#### 3.4. Добавить эндпоинт `POST /api/v1/compliance/check`
- Публичный API для ручной проверки compliance
- Файлы: `backend/src/modules/compliance/compliance.routes.ts`

### Запрещено
- Блокировать `advance` при soft warning (только при hard block)
- Выполнять compliance-проверку, если одно из сравниваемых значений null (CRM-5)
- Изменять compliance-флаг атрибута без повторной проверки

---

## 4. Межагентные интерфейсы (Contract)

### @meta-architect → @production-planner

```typescript
// spec.service.ts вызывает production.service.ts при advance
interface AdvanceToDesignResult {
  workTasks: { processOpId: string; orderItemId: string }[];
  materialRequests: { sku: string; qty: number; fromBomNode: string }[];
}
```

### @meta-architect → @compliance-validator

```typescript
// spec.service.ts вызывает compliance.service.ts при advance
interface ComplianceCheckRequest {
  sourceStage: 'ordered' | 'designed' | 'built' | 'maintained';
  targetStage: 'designed' | 'built' | 'maintained';
  attributes: { def: IAttributeDef; sourceValue: unknown; targetValue: unknown }[];
}
```

### @production-planner → @compliance-validator

```typescript
// production.service.ts вызывает compliance.service.ts для проверки паспорта
interface PassportCheckRequest {
  specId: string;
  orderId: string;
}
```

---

## 5. Приоритеты реализации

| Приоритет | Агент | Задача | Зависимости |
|-----------|-------|--------|-------------|
| P0 | @meta-architect | advanceLifecycle + парсинг dimension | Нет |
| P0 | @compliance-validator | compliance engine (все операторы) | Нет |
| P1 | @meta-architect | removeBomNode с reparenting | P0 advance + парсинг |
| P1 | @production-planner | costRollup + leadTime | P0 advance |
| P2 | @production-planner | триггеры WorkTask / MaterialRequest | P0 advance, P1 costRollup |
| P2 | @meta-architect | resyncFromCategory | P0 advance |
| P3 | @compliance-validator | passportFinalization check | P0 compliance, P1 costRollup |
