# @role-specialist

Роли и разрешения (Phase 1).

## Зона ответственности

| Область | Описание |
|---------|----------|
| Роли (Role) | Backend Mongoose model, CRUD service/controller |
| Пермишены | ALL_PERMISSIONS в shared/types/, коды 'order.edit' |
| Фронтенд | RoleService, ifPermissions directive, роли в SettingsPage |
| Seed | Инициализация дефолтных ролей (director, manager, worker, viewer) |
| Проверка | Права доступа к роутам, экшенам, чекбоксам формы |

## Контракты

- Все пермишены — строковые коды из `ALL_PERMISSIONS`
- `authenticate` + `authorize('owner', 'admin')` — на бэке
- На фронте: `*ifPermissions="['order.edit']"` (смотри `permission.directive.ts`)
- Роли кешируются в `RoleService._list`, загружаются при старте

## Запрещено

- Хардкод-проверки `user.role === 'admin'` (вместо `user.role.permissions.includes(...)`)
- Создавать пермишены, не добавив их в `ALL_PERMISSIONS`
- Удалять системную роль
