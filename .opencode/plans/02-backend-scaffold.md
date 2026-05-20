# Шаг A3: backend/ — Express + MongoDB scaffold

## Структура

```
backend/
├── src/
│   ├── core/
│   │   ├── config.ts          # Переменные окружения
│   │   └── database.ts        # Подключение MongoDB
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT проверка
│   │   │   ├── error-handler.ts       # Глобальный обработчик ошибок
│   │   │   └── validate.middleware.ts  # Валидация запросов
│   │   └── errors.ts          # AppError класс
│   ├── modules/
│   │   ├── health/
│   │   │   ├── health.controller.ts   # GET /health
│   │   │   └── health.routes.ts
│   │   └── ...
│   └── app.ts                 # Точка входа Express
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

## Файлы для создания

### backend/package.json

```json
{
  "name": "kppdf-2.0-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "seed:admin": "tsx src/scripts/seed-admin.ts",
    "seed:demo": "tsx src/scripts/seed-demo.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^4.21.0",
    "mongoose": "^8.8.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "dotenv": "^16.4.5",
    "multer": "^1.4.5-lts.1",
    "puppeteer": "^23.0.0",
    "express-rate-limit": "^7.4.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "~5.9.0",
    "vitest": "^2.1.0"
  }
}
```

### backend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@shared/*": ["../shared/*"]
    },
    "baseUrl": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### backend/.env.example

```
# Сервер
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/kppdf

# JWT
JWT_SECRET=change-me-to-random-64-chars-min
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:4200

# DaData (опционально)
DADATA_TOKEN=

# Puppeteer
PDF_CHROME_PATH=
```

### backend/src/core/config.ts

```typescript
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kppdf',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },

  dadata: {
    token: process.env.DADATA_TOKEN || '',
  },

  pdf: {
    chromePath: process.env.PDF_CHROME_PATH || '',
  },
};
```

### backend/src/core/database.ts

```typescript
import mongoose from 'mongoose';
import { config } from './config';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log(`[DB] Connected to MongoDB: ${config.mongo.uri}`);
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Runtime error:', err);
  });
}
```

### backend/src/shared/errors.ts

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(404, id ? `${entity} with id '${id}' not found` : `${entity} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}
```

### backend/src/shared/middleware/error-handler.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { config } from '../../core/config';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  console.error('[ERROR] Unhandled:', err);
  res.status(500).json({
    error: {
      message: config.isDev ? err.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
```

### backend/src/modules/health/health.controller.ts

```typescript
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export function getHealth(_req: Request, res: Response): void {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: dbStatus[dbState] || 'unknown',
    memory: process.memoryUsage(),
  });
}
```

### backend/src/modules/health/health.routes.ts

```typescript
import { Router } from 'express';
import { getHealth } from './health.controller';

const router = Router();
router.get('/', getHealth);
export default router;
```

### backend/src/app.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './core/config';
import { connectDatabase } from './core/database';
import { errorHandler } from './shared/middleware/error-handler';
import healthRoutes from './modules/health/health.routes';

async function main(): Promise<void> {
  await connectDatabase();

  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json({ limit: '10mb' }));

  // Routes
  app.use('/health', healthRoutes);

  // Error handler (always last)
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log(`[Server] Health: http://localhost:${config.port}/health`);
  });
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
```

## После создания

```bash
cd backend
npm install
npm run dev
# Открыть http://localhost:3000/health → { status: 'ok', mongodb: 'connected', ... }
```
