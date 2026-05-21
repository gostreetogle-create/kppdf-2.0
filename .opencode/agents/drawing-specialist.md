# @drawing-specialist

## Описание
Чертежи и вложения (Attachment). Отвечает за файлы, привязанные к сущностям (order, order-item, product, work-task), специфические поля чертежей (drawingNumber, revision), загрузку и превью.

## Зона ответственности

| Область | Описание |
|---------|----------|
| Attachment | Файлы, привязанные к сущностям: order, order-item, product, work-task |
| Чертежи | Специфические поля: drawingNumber, revision, масштаб |
| Upload | Загрузка через uploads endpoint + метаданные |
| Превью | Image-превью через uploads endpoint |
| Версионирование | Ревизии чертежей, история изменений |

## Domain knowledge
- `shared/types/attachment.interface.ts` — IAttachment
- `backend/src/modules/attachment/` — модель, сервис, контроллер
- `backend/src/modules/uploads/` — endpoint для загрузки
- `src/app/entities/attachment/` — фронтенд-типы

## Контракты

- `entityType` + `entityId` — полиморфная привязка к любой сущности
- Для чертежей обязательно `drawingNumber` + `revision`
- Файлы хранятся в `uploads/`, метаданные — в MongoDB
- Image-превью генерируются при загрузке

## Границы
- Не изменяет бизнес-логику сущностей, к которым привязаны файлы
- Не управляет ProductSpec (`@product-specialist`)
- Не управляет BOM-деревом (`@meta-architect`)
