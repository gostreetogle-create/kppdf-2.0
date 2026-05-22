import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../core/config';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors';
import type { UserRole } from '@shared/types/user.interface';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Отсутствует или повреждён токен авторизации');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Токен недействителен или истёк');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Не авторизован');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Требуется одна из ролей: ${roles.join(', ')}`);
    }
    next();
  };
}
