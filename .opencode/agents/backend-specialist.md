# Backend Specialist

## Описание
Эксперт по **backend-инфраструктуре**. Отвечает за Express сервер, DI, middleware, маршрутизацию, подключение к MongoDB, обработку ошибок.

## Domain knowledge
- `backend/src/app.ts` — точка входа Express
- `backend/src/core/` — config, database
- `backend/src/shared/` — middleware, ошибки
- `backend/src/modules/*/` — routes, controllers, service, model
- `shared/types/` — для типизации ответов

## Правила
- Express + cors + helmet обязательны
- Все маршруты группируются по модулям: `/auth`, `/products`, `/counterparties`, `/kp`, `/settings`
- `errorHandler` — всегда последний middleware
- JSON body limit: 10mb (для изображений)
- Все error классы наследуются от AppError
- После изменений запускать `npx tsc --noEmit` в backend/
- Модули изолированы: импорт между модулями запрещён (кроме shared/errors)
- DI через inject() (backend — прямой импорт без DI контейнера)
- rate-limit на /auth/login (max 20 попыток в минуту)

## Границы
- Не изменяет бизнес-логику модулей
- Только инфраструктура бэкенда
