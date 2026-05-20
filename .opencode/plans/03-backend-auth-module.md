# Шаг A4: backend/ — Модуль Auth (JWT + bcrypt + RBAC)

## Структура модуля

```
backend/src/modules/auth/
├── auth.model.ts           # Mongoose schema (User)
├── auth.service.ts         # Бизнес-логика: login, register, refresh, changePassword
├── auth.controller.ts      # Обработчики HTTP
├── auth.routes.ts          # POST /api/auth/login, /register, /refresh, /logout
└── auth.errors.ts          # Специфичные ошибки

backend/src/modules/user/
├── user.model.ts           # Mongoose schema (User)
├── user.service.ts         # CRUD пользователей
├── user.controller.ts
├── user.routes.ts          # /api/users
└── user.permissions.ts     # RBAC permission map

backend/src/shared/middleware/
├── auth.middleware.ts      # Проверка JWT, достаёт user в req
└── permission.guard.ts     # Проверка can(permission)
```

## Файлы для создания

### backend/src/modules/auth/auth.model.ts

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser, UserRole } from '@shared/types/user.interface';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  passwordHash: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'viewer'], default: 'manager' },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
```

### backend/src/modules/auth/auth.service.ts

```typescript
import jwt from 'jsonwebtoken';
import { UserModel } from './auth.model';
import { config } from '../../core/config';
import { UnauthorizedError } from '../../shared/errors';
import type { IAuthTokens, IUser } from '@shared/types/user.interface';

function generateTokens(userId: string, role: string): IAuthTokens {
  const accessToken = jwt.sign({ userId, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ userId, role, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken, expiresIn: 7 * 24 * 60 * 60 };
}

function toUserJSON(doc: any): IUser {
  return {
    _id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role,
    isActive: doc.isActive,
    mustChangePassword: doc.mustChangePassword,
    lastLoginAt: doc.lastLoginAt?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function login(username: string, password: string): Promise<{ user: IUser; tokens: IAuthTokens }> {
  const user = await UserModel.findOne({ username: username.toLowerCase() });
  if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new UnauthorizedError('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user._id.toString(), user.role);
  return { user: toUserJSON(user), tokens };
}

export async function register(data: { username: string; email: string; displayName: string; password: string }): Promise<IUser> {
  const existing = await UserModel.findOne({
    $or: [{ username: data.username.toLowerCase() }, { email: data.email.toLowerCase() }],
  });
  if (existing) throw new UnauthorizedError('Username or email already exists');

  const user = await UserModel.create({
    username: data.username,
    email: data.email,
    displayName: data.displayName,
    passwordHash: data.password,
    role: 'manager',
  });

  return toUserJSON(user);
}

export async function refreshToken(token: string): Promise<IAuthTokens> {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: string; role: string; type: string };
    if (payload.type !== 'refresh') throw new Error('Invalid token type');
    return generateTokens(payload.userId, payload.role);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
```

### backend/src/modules/auth/auth.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json({ tokens });
  } catch (err) {
    next(err);
  }
}
```

### backend/src/modules/auth/auth.routes.ts

```typescript
import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refresh);

export default router;
```

### backend/src/shared/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../core/config';
import { UnauthorizedError } from '../errors';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing token');

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
```

### backend/src/shared/middleware/permission.guard.ts

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../errors';
import { can as checkPermission } from '../../../../shared/constants/permissions';

export function requirePermission(permission: string) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.userRole) throw new ForbiddenError('No role found');
    if (!checkPermission(req.userRole as any, permission)) {
      throw new ForbiddenError(`Permission '${permission}' required`);
    }
    next();
  };
}
```

### backend/src/modules/user/user.model.ts

```typescript
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'viewer'], default: 'manager' },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model('User', userSchema);
```

## Подключение в app.ts

Добавить в `backend/src/app.ts`:

```typescript
import authRoutes from './modules/auth/auth.routes';

// После middleware, до errorHandler:
app.use('/api/auth', authRoutes);
```
