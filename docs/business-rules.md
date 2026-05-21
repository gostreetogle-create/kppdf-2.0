# KPPDF 2.0 — Business Rules Specification (Phase Zero)
> Версия: 1.0 | Статус: Утверждена | Дата: 2026-05-21
> Данный документ является «Библией» проекта. Любое архитектурное решение должно проходить проверку на соответствие этим правилам.

---

## 1. PLM Domain — Data Integrity

### 1.1. Наследование атрибутов: Категория → Спецификация

**Правило PLM-1 (Слепок шаблона).** При создании `IProductSpec` из `IProductCategory` система ОБЯЗАНА создать глубокую копию `IAttributeDefGroup[]`. Дальнейшие изменения шаблона категории НЕ влияют на уже созданные спецификации.

```typescript
// При создании спецификации:
spec.attributeValues = category.attributeGroups
  .flatMap(g => g.attributes)
  .map(def => ({
    attributeDefId: def.code,           // ссылка на определение для tracability
    name: def.name,
    valueType: def.valueType,
    unit: def.unit ?? null,
    isRequired: def.isRequired,

    // 4 состояния жизненного цикла — NULL пока не достигнута стадия
    orderedValue: null,     // заполняется при as_ordered
    designValue: null,      // заполняется при as_designed
    builtValue: null,       // заполняется при as_built
    maintainedValue: null,  // заполняется при as_maintained

    // Флаг compliance проставляется автоматически при advance
    compliant: null,
  }));
```

**Правило PLM-2 (Валидация обязательных).** При `advanceLifecycle()` на следующую стадию система проверяет `isRequired` для всех атрибутов, значение которых должно быть заполнено на текущей стадии. Если хоть один обязательный атрибут `=== null` — `advance` отклоняется с сообщением о конкретном атрибуте.

**Правило PLM-3 (Soft-ссылка).** `attributeDefId` хранит `code` из `IAttributeDef`, а не ObjectId MongoDB. Это позволяет переименовывать метку атрибута без потери данных. Если `code` удалён из категории — данные в спецификации сохраняются, но атрибут помечается как `orphan: true`.

### 1.2. EAV: Обработка 4 состояний значения

**Правило PLM-4 (Независимость состояний).** Каждое из 4 состояний (`orderedValue`, `designValue`, `builtValue`, `maintainedValue`) хранится и изменяется независимо. Изменение `designValue` НЕ влияет на `orderedValue`.

**Правило PLM-5 (Заполнение по цепочке).** При `advance` на стадию N все состояния < N должны быть не-null. Если это не так — advance НЕВОЗМОЖЕН.

```
Пример:
  as_ordered: orderedValue = "100"
  → advance to as_designed: designValue = "105" (инженер изменил)
  → advance to as_built: builtValue = "103" (производство дало факт)
  → advance to as_maintained: maintainedValue = "102" (после эксплуатации)
```

**Правило PLM-6 (Compliance-флаг).** При каждом `advance` система запускает сверку «текущая стадия vs предыдущая»:
- `as_ordered → as_designed`: сверка orderedValue vs designValue
- `as_designed → as_built`: сверка designValue vs builtValue
- `as_built → as_maintained`: сверка builtValue vs maintainedValue

Результат (`true`/`false`) сохраняется в `compliant`. Если `false` — система записывает violation с указанием оператора, ожидаемого и фактического значения.

### 1.3. BOM-иерархия: ограничения и целостность

**Правило PLM-7 (Максимальная вложенность).** BOM-дерево НЕ может превышать 10 уровней вложенности. Глубина проверяется рекурсивно при сохранении. Превышение — `ValidationError` с указанием самого глубокого узла.

**Правило PLM-8 (Уникальность маркировки).** Все `marking` (артикулы) в пределах ОДНОГО BOM-дерева должны быть уникальны. Проверка рекурсивная по всему дереву. Пустые `marking` не проверяются.

**Правило PLM-9 (Корректность parentId).** Каждый дочерний узел должен иметь `parentId`, указывающий на существующий узел в том же дереве. Корневой узел может иметь `parentId = null`.

**Правило PLM-10 (Типы узлов).** Иерархия типов:
| Тип узла | Может содержать детей | Может быть листом |
|----------|----------------------|-------------------|
| `assembly` | ✅ Да | ✅ Да (пустая сборка) |
| `part` | ❌ Нет | ✅ Да |
| `purchased` | ❌ Нет | ✅ Да |
| `process` | ❌ Нет (операция над родителем) | ✅ Да |

**Правило PLM-11 (Удаление узла).** Если удаляется `assembly` — его дети ПЕРЕМЕЩАЮТСЯ к родителю удалённого узла (на уровень вверх). Если удаляется `part`/`purchased`/`process` — удаляется только он. `CASCADE DELETE` запрещён (чтобы не потерять дерево при случайном удалении).

---

## 2. ERP Domain — Manufacturing & Cost

### 2.1. Алгоритм Roll-up Costing

**Правило ERP-1 (Рекурсивное суммирование).** Себестоимость узла вычисляется по формуле:

```
node.cost = node.costPerUnit * node.qty + Σ(child.cost)
```

где `costPerUnit` может быть:
- Для `purchased`: цена закупки из `MaterialItem.price` (на момент расчёта)
- Для `part`/`process`: labourCost + machineCost из справочника операций
- Для `assembly`: 0 (сборка не имеет собственной стоимости)

**Правило ERP-2 (Точка фиксации).** Cost roll-up НЕ пересчитывается автоматически при изменении цен материалов. Чтобы получить актуальную себестоимость, пользователь ДОЛЖЕН явно запустить `POST /api/v1/production/cost-rollup`. Результат сохраняется в снэпшот `specification.version`.

**Правило ERP-3 (Lead Time).** Время производства узла:

```
node.leadTimeDays = max(child.leadTimeDays) + Σ(node.processOps.durationDays)
```

Критический путь — это максимальная сумма длительностей от корня до листа. Если `processOps` у узла нет — `leadTimeDays = 0`.

### 2.2. Связь атрибутов с техпроцессами (Process Triggers)

**Правило ERP-4 (Автоматическое создание WorkTask).** Если в BOM-узле типа `part` или `assembly` есть `processOps` — при переходе спецификации в `as_designed` система АВТОМАТИЧЕСКИ создаёт:
- Один `WorkTask` на каждую `IProcessOp`
- Связь: `WorkTask.orderItemId` → продукт из OrderItem
- Статус: `pending`
- Дедлайн: `now + product.leadTimeDays`

**Правило ERP-5 (Триггер MaterialRequest).** Если в BOM-узле типа `purchased` указан `sku` (артикул) — при `advance` в `as_designed` система создаёт:
- `MaterialRequest` на каждый уникальный `purchased`-узел
- Количество = `node.qty * parent.qty` (рекурсивно вверх до корня)
- Статус: `requested`

**Правило ERP-6 (Типы атрибутов как триггеры).** Определённые `valueType` автоматически создают задачи:
| valueType в IAttributeDef | Действие при as_designed |
|--------------------------|------------------------|
| `dimension` | Создать WorkTask "Раскрой/Обработка" |
| `material` (enum с allowedValues) | Создать MaterialRequest |
| `boolean` с isRequired=true | Создать WorkTask "Проверка/Тестирование" |

---

## 3. CRM Domain — Compliance

### 3.1. Compliance Engine: алгоритм сверки

**Правило CRM-1 (Двухфазная сверка).** Compliance проверка выполняется в два прохода:

**Фаза 1 — Количественная:** Для каждого атрибута, у которого заполнены оба сравниваемых значения, применяется оператор из `IAttributeDef.comparisonOperator`.

| Оператор | Логика | Пример |
|----------|--------|--------|
| `=` | `target === expected` (строго) | 100 = 100 ✅ |
| `≠` | `target !== expected` | 100 ≠ 105 ✅ |
| `>` | `target > expected` | 105 > 100 ✅ |
| `<` | `target < expected` | 95 < 100 ✅ |
| `≥` | `target >= expected` | 105 ≥ 100 ✅ |
| `≤` | `target <= expected` | 95 ≤ 100 ✅ |
| `±` | `Math.abs(target - expected) <= tolerance` | 103 ± 5 ✅ (допуск 5) |
| `range` | `target >= range[0] && target <= range[1]` | 103 ∈ [100, 110] ✅ |

**Фаза 2 — Качественная:** Проверка, что нет «осиротевших» требований. Если в `IRequirement` есть атрибут, которого нет в `IAttributeDef[]` спецификации — violation с кодом `MISSING_ATTRIBUTE`.

**Правило CRM-2 (Tolerance для ±).** Если оператор `±`, система ищет поле `tolerance` в `IAttributeDef.metadata.tolerance`. Если не найдено — tolerance = 0 (строгое равенство).

```typescript
interface ComparisonContext {
  attributeCode: string;
  attributeName: string;
  actual: number | string | boolean;
  expected: number | string | boolean;
  operator: ComparisonOperator;
  tolerance?: number;
}
```

### 3.2. Критические блокировки (Passport Finalization)

**Правило CRM-3 (Блокировка паспорта при non-compliance).** Финальная стадия `as_maintained` (подписание паспорта изделия) НЕВОЗМОЖНА, если:
1. Хотя бы один обязательный атрибут имеет `compliant = false`
2. Есть violation с кодом `MISSING_ATTRIBUTE`
3. BOM-дерево содержит узлы с `status !== 'approved'`
4. Не все `MaterialRequest` имеют `status = 'received'`

**Правило CRM-4 (Soft Warning vs Hard Block).** Разделение на два уровня:
| Уровень | Условие | Действие |
|---------|---------|----------|
| `warning` | non-compliant атрибут, но не обязательный | Жёлтый флаг, паспорт не блокируется |
| `block` | Любое из правил CRM-3 | Красный флаг, `advance` отклонён |

**Правило CRM-5 (Compliance по умолчанию).** Если оператор не задан, используется `=` (строгое равенство). Если атрибут не обязательный и значения нет ни на одной стадии — compliance считается `null` (не проверяется).

---

## 4. Конфликт-анализ (Logic Stress-Test)

### 4.1. Конфликт удаления: что происходит с BOM-деревом при удалении родителя?

**Проблема:** Пользователь удаляет сборочный узел. Если сделать `CASCADE DELETE`, можно потерять всё дерево. Если запретить удаление — UX страдает.

**Решение (Правило PLM-11):** Reparenting (перемещение на уровень вверх).

```typescript
function removeBomNode(root: IComponentNode, nodeId: string): IComponentNode {
  const parent = findParent(root, nodeId);
  const node = findNode(root, nodeId);
  if (!parent || !node) throw new NotFoundError('BOM node');

  const idx = parent.children.findIndex(c => c.id === nodeId);
  parent.children.splice(idx, 1);

  if (node.type === 'assembly' && node.children?.length) {
    // Reparent: дети assembly становятся детьми родителя
    parent.children.push(...node.children.map(child => ({
      ...child,
      parentId: parent.id,
    })));
  }
  // part/purchased/process — просто удаляются
  return root;
}
```

### 4.2. Конфликт версий: что происходит с активным Order, если инженер изменил шаблон Категории?

**Проблема:** Заказ (Order) ссылается на спецификацию (ProductSpec), которая была создана на основе старой версии категории. Инженер обновил категорию (добавил/удалил атрибуты).

**Решение (Snapshot Isolation):**

**Правило VERSION-1.** ProductSpec хранит **полный снэпшот** шаблона атрибутов (см. Правило PLM-1). Изменение категории НЕ ВЛИЯЕТ на уже созданные спецификации.

**Правило VERSION-2 (Version bump).** При изменении категории её `version` инкрементируется. ProductSpec хранит `categoryVersion` — версию, на основе которой создана спецификация. Если `categoryVersion < category.version` — система показывает бейдж `[Есть обновление шаблона]`.

**Правило VERSION-3 (Ресинхронизация).** Пользователь может явно запустить `resyncFromCategory(specId)`:
1. Новые атрибуты (есть в категории, нет в спецификации) — добавляются со значениями по умолчанию
2. Удалённые атрибуты (нет в категории, есть в спецификации) — помечаются `orphan: true` (данные НЕ удаляются)
3. Изменённые `isRequired`/`unit`/`allowedValues` — обновляются
4. `categoryVersion` в спецификации становится равной `category.version`

### 4.3. Конфликт типов: как валидировать `dimension (80x80x3)` для ERP?

**Проблема:** Поле `dimension` — строка вида `80x80x3` (ширина x высота x толщина). ERP должен уметь рассчитывать площадь поверхности, объём, вес.

**Решение (Структурированное измерение):**

**Правило TYPE-1 (Формат dimension).** Значение `dimension` хранится как строка, НО дополнительно парсится в структуру при сохранении:

```typescript
interface DimensionValue {
  raw: string;                    // "80x80x3"
  parts: number[];                // [80, 80, 3]
  normalized: {
    width: number;                // 80
    height: number;               // 80
    thickness: number;            // 3
    length?: number;              // если dimension двумерное
  };
  computed: {
    surfaceArea: number;          // 2*(80*80 + 80*3 + 80*3) = 13760 мм²
    volume: number;               // 80*80*3 = 19200 мм³
    weight?: number;              // если известна плотность материала
  };
}
```

**Правило TYPE-2 (Парсинг dimension).** При сохранении `designValue` с типом `dimension`:

```typescript
function parseDimension(raw: string): DimensionValue {
  // 1. Разделить по 'x', '×', 'х' (латинская/русская/типографская)
  const parts = raw.split(/[x×х]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

  if (parts.length < 2 || parts.length > 4) {
    throw new ValidationError('Dimension must have 2-4 parts (e.g. 80x80x3)');
  }

  // 2. Определить семантику по количеству частей:
  //    2 части: ширина x высота (плоское, лист)
  //    3 части: ширина x высота x толщина
  //    4 части: ширина x высота x толщина x длина (профиль)
  // 3. Рассчитать площадь и объём
  const [a, b, c, d] = parts;
  let surfaceArea = 0;
  let volume = 0;

  if (parts.length === 2) {
    surfaceArea = a * b;           // листовой материал
    volume = a * b * 1;            // толщина условно 1 мм
  } else if (parts.length === 3) {
    surfaceArea = 2 * (a*b + a*c + b*c);  // полная площадь поверхности
    volume = a * b * c;
  } else {
    // профиль: площадь сечения * длина
    surfaceArea = 2 * (a*b + a*c); // площадь сечения * 2 (если открытый)
    volume = a * b * d;            // объём металла в профиле
  }

  return { raw, parts, normalized: { width: a, height: b, thickness: c ?? 1, length: d }, computed: { surfaceArea, volume } };
}
```

**Правило TYPE-3 (Dimension → ERP материалы).** При создании `MaterialRequest` из BOM-узла с `dimension`:
1. Если узел имеет `material` (текстовое описание) — система ищет `IMaterialItem` по совпадению с `sku` или `name`
2. Если найден — материал добавляется в заявку с `quantity = computed.volume * node.qty`
3. Единица измерения — `мм³` или перевод в `м³`

---

## 5. EntityStatus: Правила жизненного цикла

**Правило ES-1.** Все ключевые сущности (Product, ProductSpec, Order, OrderItem, WorkTask, MaterialRequest) ОБЯЗАНЫ иметь `statusId`.

**Правило ES-2.** Переход между статусами возможен ТОЛЬКО по разрешённым `transitions`. Hard-код статусов в виде `if (status === 'new')` ЗАПРЕЩЁН.

**Правило ES-3.** Статус с `isFinal: true` блокирует все изменения сущности (read-only), кроме комментариев и вложений.

---

## 6. Аудит: кто, когда, что

**Правило AUDIT-1.** Модели с `auditPlugin`:
- Order, OrderItem — любые изменения
- Product — изменение `sku`, `kind`, `status`
- ProductSpec — любое изменение attributeValues
- WorkTask — статус, назначенный исполнитель
- MaterialRequest — статус, утверждённое количество

**Правило AUDIT-2 (Разделение diff).** Audit-запись содержит два снэпшота: `before` и `after`. Сравнение делается на уровне бизнес-логики (не MongoDB ObjectId).

---

## 7. Словарь терминов

| Термин | Определение |
|--------|------------|
| **Digital Twin** | Цифровая копия изделия, содержащая все 4 состояния атрибутов |
| **EAV** | Entity-Attribute-Value: модель хранения атрибутов с переменной структурой |
| **BOM** | Bill of Materials: иерархический состав изделия |
| **Compliance** | Проверка соответствия между стадиями жизненного цикла |
| **Snapshots** | Копии данных на момент создания (OrderItem из Product, Spec из Category) |
| **Roll-up** | Агрегация себестоимости снизу вверх по BOM-дереву |
| **Reparenting** | Перемещение детей удалённого узла к его родителю |
| **Orphan Attribute** | Атрибут, чей `attributeDefId` отсутствует в текущей версии категории |
