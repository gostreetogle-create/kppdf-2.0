# @role-specialist

## Описание
Роли и разрешения (RBAC). Отвечает за систему ролей, матрицу permissions, проверку прав на фронте и бэке, seed дефолтных ролей.

## Зона ответственности

| Область | Описание |
|---------|----------|
| Роли (Role) | Backend Mongoose model, CRUD service/controller |
| Пермишены | ALL_PERMISSIONS в shared/types/, коды 'order.edit' |
| Фронтенд | RoleService, ifPermissions directive, роли в SettingsPage |
| Seed | Инициализация дефолтных ролей (director, manager, worker, viewer) |
| Проверка | Права доступа к роутам, экшенам, чекбоксам формы |

## Domain knowledge
- `shared/types/role.interface.ts` — IRole, permissions[]
- `shared/constants/permissions.ts` — ROLE_PERMISSIONS, can()
- `backend/src/modules/role/` — модель, сервис, контроллер, routes
- `backend/src/modules/auth/auth.middleware.ts` — authorize(...roles)
- `src/app/entities/role/` — фронтенд-типы и сервис

## Контракты

- Все пермишены — строковые коды из `ALL_PERMISSIONS`
- `authenticate` + `authorize('owner', 'admin')` — на бэке
- На фронте: `*ifPermissions="['order.edit']"` (смотри `permission.directive.ts`)
- Роли кешируются в `RoleService._list`, загружаются при старте
- Дефолтные роли: director (все права), manager (ограниченный), worker (только чтение/исполнение), viewer (только чтение)

## Запрещено

- Хардкод-проверки `user.role === 'admin'` (вместо `user.role.permissions.includes(...)`)
- Создавать пермишены, не добавив их в `ALL_PERMISSIONS`
- Удалять системную роль

## Границы
- Не управляет аутентификацией (только авторизация) — см. `@auth-specialist`
- Не управляет пользователями (только их ролями)
