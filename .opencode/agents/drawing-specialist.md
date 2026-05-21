# @drawing-specialist

Чертежи и вложения (Attachment) — Фаза 6.

## Зона ответственности

| Область | Описание |
|---------|----------|
| Attachment | Файлы, привязанные к сущностям: order, order-item, product, work-task |
| Чертежи | Специфические поля: drawingNumber, revision |
| Upload | Загрузка через uploads endpoint + metadata |

## Контракты

- `entityType` + `entityId` — полиморфная привязка
- Для чертежей обязательно `drawingNumber`
- Image-превью через uploads endpoint
