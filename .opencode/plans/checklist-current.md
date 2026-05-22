# Актуальный чеклист KPPDF 2.0

> Создан: 21.05.2026
> Статус: ожидает выполнения

---

## 🔴 КРИТИЧЕСКИЕ

### 1. PrimeNG compliance — исправить raw-элементы в шаблонах

| Файл | Что | Заменить на |
|------|-----|------------|
| `editor-toolbar.component.html` | 5× `<button pButton>` | `<p-button>` |
| `order-list-feature.component.html` | 2× `<button pButton>` | `<p-button>` |
| `overlay-renderer.component.html` | 1× `<table>` | `<p-table>` |

**Примечание:** `<input pInputText>` в kp-list и counterparty-list — это **корректное использование** (pInputText — только директива, компонента нет).

### 2. Проверить билд
- `ng build` — 0 ошибок
- `ng lint` — 0 ошибок

### 3. Закоммитить 36 изменённых файлов
- document-editor (новая фича)
- seed-demo (обновление)
- Рефакторинг сервисов (auth, spec, compliance, production, и др.)

---

## 🟡 ВАЖНЫЕ

### 4. Проверить архитектуру document-editor
- Делегировать `@guardian` на проверку слоёв и импортов
- Файлы: `features/document-editor/`, `entities/document/`, `entities/document-template/`

### 5. Тесты
- Сейчас 9 spec-файлов на 109 TS (8.3%)
- Добавить минимум smoke-тесты:
  - `core/api/api.service.ts`
  - `core/auth/auth.service.ts`
  - `entities/product/data-access/product.service.ts`
  - `pages/*.component.ts` — smoke-тесты с роутингом

---

## 🔵 ПРИОРИТЕТНЫЕ ДОРАБОТКИ (Этап F)

### 6. `resyncFromCategory()` — синхронизация спецификации с категорией
- Агент: `@meta-architect`

### 7. DynamicAttrForm → API
- Привязать форму атрибутов к spec API
- Агент: `@ui-specialist`

### 8. BOMTreeEditor → API
- Сохранение/удаление BOM-узлов через бэкенд
- Агент: `@ui-specialist`

### 9. Role → ObjectId
- `User.role` перевести с `name` на `_id`
- WorkType: добавить `code` полю, искать по stable-коду
- Агент: `@role-specialist`

### 10. Delete guard
- Проверка зависимостей перед удалением сущности
- Агент: `@guardian`

---

## 🟢 СРЕДНЕЙ СРОЧНОСТИ (Этапы G, H)

### 11. Полный цикл КП через UI → PDF
- Агенты: `@kp-specialist` + `@pdf-specialist`

### 12. Заказы (Order, OrderItem) — lifecycle + канбан
- Агент: `@order-specialist`

### 13. Производство (WorkTask, MaterialRequest)
- Агенты: `@work-specialist` + `@material-specialist`

### 14. Гант-диаграммы
- Агент: `@gantt-specialist`

### 15. Compliance Dashboard
- Агент: `@compliance-validator`

### 16. Документ-редактор — интеграция с КП и Договорами
- Path Resolver для подстановки данных
- Snapshot Freeze при экспорте
- QR-коды
- Экспорт в PDF
- Агенты: `@pdf-specialist`, `@kp-specialist`, `@order-specialist`