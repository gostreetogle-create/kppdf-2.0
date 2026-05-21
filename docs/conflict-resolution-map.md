# Conflict Resolution Map — KPPDF 2.0
> Версия: 1.0 | Статус: Утверждена
> Карта решённых логических противоречий архитектуры.

---

## Конфликт #1: Удаление родительского узла BOM

### Ситуация
Пользователь удаляет сборочный узел (`assembly`), у которого есть дочерние узлы. Если сделать `CASCADE DELETE` — можно потерять всё поддерево. Если запретить — UX страдает.

### Решение: Reparenting (Правило PLM-11)

```
ДО:
  🔧 Изделие (assembly)
    ├── 🔩 Вал (part)
    └── 🔧 Корпус (assembly)  ← удаляем этот узел
         ├── 🔩 Фланец (part)
         └── 🔩 Прокладка (part)

ПОСЛЕ:
  🔧 Изделие (assembly)
    ├── 🔩 Вал (part)
    ├── 🔩 Фланец (part)       ← перемещён на уровень вверх
    └── 🔩 Прокладка (part)    ← перемещён на уровень вверх
```

### Код реализации
```typescript
function removeBomNode(root: IComponentNode, nodeId: string): IComponentNode {
  const ctx = { target: root, nodeId, found: false };
  removeRecursive(ctx);
  return ctx.target;

  function removeRecursive(ctx: { target: IComponentNode; nodeId: string; found: boolean }): void {
    if (!ctx.target.children) return;
    const idx = ctx.target.children.findIndex(c => c.id === ctx.nodeId);
    if (idx !== -1) {
      const [removed] = ctx.target.children.splice(idx, 1);
      // Reparent: если assembly — его дети поднимаются на уровень вверх
      if (removed.type === 'assembly' && removed.children?.length) {
        ctx.target.children.push(
          ...removed.children.map(child => ({ ...child, parentId: ctx.target.id }))
        );
      }
      ctx.found = true;
      return;
    }
    for (const child of ctx.target.children) {
      if (!ctx.found) removeRecursive({ target: child, ...ctx });
    }
  }
}
```

### Edge Cases
| Сценарий | Обработка |
|----------|-----------|
| Удаление корневого узла | Запрещено (корень = само изделие) |
| Удаление `part` с `processOps` | WorkTask отвязывается (orphan), помечается `⚠️ BOM node deleted` |
| Удаление `purchased` с `MaterialRequest` | MaterialRequest не удаляется, но получает флаг `bomOrphan: true` |

---

## Конфликт #2: Изменение шаблона Категории при активном Заказе

### Ситуация
Инженер изменил шаблон категории (добавил/удалил атрибуты, поменял `isRequired`). Активный Заказ ссылается на спецификацию, созданную по СТАРОМУ шаблону.

### Решение: Snapshot Isolation + Version Bump (Правила VERSION-1—3)

```
Категория (version: 1) → создаётся ProductSpec (categoryVersion: 1) → Заказ ссылается на spec
     ↓
Категория изменена (version: 2)
     ↓
⚠️ ProductSpec видит: categoryVersion (1) < category.version (2)
     ↓
Пользователь запускает resyncFromCategory(specId)
     ↓
  1. Добавлены новые атрибуты (по умолчанию)
  2. Удалённые атрибуты → orphan: true
  3. categoryVersion: 1 → 2
```

### Матрица поведения при рассинхронизации

| Действие в категории | Эффект на ProductSpec до resync | Эффект после resync |
|---------------------|--------------------------------|--------------------|
| Добавлен атрибут | Spec не видит новый атрибут | Атрибут добавлен со значением по умолчанию |
| Удалён атрибут | Spec сохраняет данные (не теряет) | Атрибут помечен `orphan: true` |
| Изменён `isRequired: false→true` | Spec не знает (валидация по старому шаблону) | Валидация `advance` теперь проверяет этот атрибут |
| Изменён `unit` | Spec хранит старую единицу | Единица обновлена |
| Добавлена группа | — | Группа создана, атрибуты добавлены |

### Блокировки
- `advance as_built → as_maintained` НЕВОЗМОЖЕН, если есть orphan-атрибуты
- `resync` НЕ удаляет никогда никакие данные (только `orphan: true`)

---

## Конфликт #3: Валидация dimension (80x80x3) для ERP

### Ситуация
Поле `dimension` — строка "80x80x3". ERP нужно рассчитать площадь поверхности, объём, вес для MaterialRequest.

### Решение: Структурированный парсинг dimension (Правила TYPE-1—3)

```typescript
// Парсинг при сохранении designValue
type DimensionNormalized = {
  width: number;
  height: number;
  thickness: number;    // 1 если не указана
  length?: number;      // для 4-частного формата
};

type DimensionComputed = {
  surfaceAreaMm2: number;
  volumeMm3: number;
  weightG?: number;     // если известна плотность
};

// Валидация форматов:
// "500x200"        → лист 500x200 мм
// "80x80x3"        → труба/профиль 80x80 мм, стенка 3 мм
// "100x50x4x6000"  → профиль 100x50x4, длина 6000 мм
```

### Матрица форматов dimension

| Формат | Пример | width | height | thickness | length | Площадь | Объём |
|--------|--------|-------|--------|-----------|--------|---------|-------|
| `AxB` | 500x200 | 500 | 200 | 1 | — | 100000 мм² | 100000 мм³ |
| `AxBxC` | 80x80x3 | 80 | 80 | 3 | — | 13760 мм² | 19200 мм³ |
| `AxBxCxD` | 100x50x4x6000 | 100 | 50 | 4 | 6000 | 1700000 мм² | 1200000 мм³ |

### Обработка ошибок парсинга
| Ошибка | Сообщение |
|--------|-----------|
| Нечисловые части | `"Dimension '80x80xABC' contains non-numeric value at position 3"` |
| Меньше 2 частей | `"Dimension must have at least 2 numeric parts (e.g. 80x80x3)"` |
| Больше 4 частей | `"Dimension must have at most 4 numeric parts"` |
| Отрицательные значения | `"Dimension values must be positive"` |
| Нулевая площадь | `"Dimension results in zero surface area"` |

### Плотность материала
```typescript
const MATERIAL_DENSITY: Record<string, number> = {
  'Сталь': 7.85,          // г/см³
  'Нержавейка': 7.93,
  'Алюминий': 2.70,
  'Медь': 8.96,
  'Латунь': 8.50,
  'Пластик (ПЭ)': 0.95,
  'Древесина (сосна)': 0.52,
};
// Вес = volumeMm3 * density / 1000 (г → кг)
```

---

## Конфликт #4: Compliance-флаг при частичных данных

### Ситуация
Атрибут имеет `orderedValue`, но `designValue` ещё не заполнен. Нужен ли compliance?

### Решение
**Правило CRM-5:** Compliance проверяется ТОЛЬКО для атрибутов, где оба сравниваемых значения не-null. Если `designValue === null` — compliance не вычисляется (`null`). Это позволяет создавать спецификацию поэтапно.

---

## Конфликт #5: Одновременное изменение BOM из нескольких источников

### Ситуация
Два инженера открыли одну спецификацию и одновременно редактируют BOM.

### Решение
Используется **Optimistic Locking** через поле `__v` (Mongoose versionKey):
- При GET спецификации фронт получает `version`
- При POST BOM фронт отправляет `version`
- Если `version` на сервере отличается — `409 Conflict`
- Фронт показывает: "Дерево было изменено другим пользователем. Перезагрузить?"

---

## Сводная карта

| # | Конфликт | Тип | Статус | Решение |
|---|----------|-----|--------|---------|
| 1 | Удаление родителя BOM | Data Integrity | ✅ Решён | Reparenting (PLM-11) |
| 2 | Изменение категории при активном заказе | Versioning | ✅ Решён | Snapshot Isolation + Version Bump |
| 3 | Валидация dimension для ERP | Type System | ✅ Решён | Структурированный парсинг |
| 4 | Compliance при null-значениях | Logic | ✅ Решён | Пропуск проверки если null |
| 5 | Одновременное редактирование BOM | Concurrency | ✅ Решён | Optimistic Locking через `__v` |
