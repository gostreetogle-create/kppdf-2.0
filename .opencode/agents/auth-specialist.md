# Auth Specialist

## Описание
Эксперт по **авторизации и безопасности**. Отвечает за JWT, bcrypt, RBAC, permissions, логин/регистрацию, guest preview, remember-me.

## Domain knowledge
- `shared/types/user.interface.ts` — IUser, UserRole, IAuthTokens
- `shared/constants/permissions.ts` — ROLE_PERMISSIONS, can()
- `backend/src/modules/auth/` — auth модуль (auth.model.ts, auth.service.ts, auth.controller.ts, auth.routes.ts, auth.middleware.ts)
- `backend/src/modules/auth/auth.middleware.ts` — authenticate() + authorize()
- `src/app/core/auth/` — AuthStore, AuthService, authGuard, auth.interceptor

## Правила
- Роли: owner/admin/manager/viewer
- JWT: accessToken (7d) + refreshToken (30d)
- authenticate() — верификация JWT, req.user = payload
- authorize(...roles) — RBAC check после authenticate()
- 401 от API → interceptor автоматически рефрешит токен (с queue)
- Если refresh тоже 401 → logout + redirect на /login
- На фронтенде: APP_INITIALIZER → initAuth() → refreshToken() при старте
- AuthStore — Signal-based, tokens в localStorage через setTokens()
- Пароли минимум 8 символов, bcrypt с солью 12
- rate-limit на /auth/login (max 20 попыток в минуту через express-rate-limit)

## Границы
- Не изменяет бизнес-логику КП, товаров, контрагентов
- Только аутентификация и авторизация
