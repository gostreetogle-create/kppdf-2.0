import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../core/config';
import { UserModel, IUserDocument } from './auth.model';
import { RoleModel } from '../role/role.model';
import { AppError, UnauthorizedError } from '../../shared/errors';
import type { ILoginRequest, ILoginResponse, IAuthTokens, IUser, UserRole } from '@shared/types/user.interface';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function generateTokens(user: IUserDocument): IAuthTokens {
  const payload = { sub: user._id.toString(), role: user.role, username: user.username };
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign({ sub: user._id.toString() }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken, expiresIn: 7 * 24 * 60 * 60 };
}

async function resolvePermissions(roleName: string): Promise<string[]> {
  try {
    const role = await RoleModel.findOne({ name: roleName }).lean();
    return role?.permissions ?? [];
  } catch {
    return [];
  }
}

async function toUserJSON(doc: IUserDocument): Promise<IUser> {
  const permissions = await resolvePermissions(doc.role);
  return {
    _id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role as UserRole,
    permissions,
    isActive: doc.isActive,
    mustChangePassword: doc.mustChangePassword,
    lastLoginAt: doc.lastLoginAt,
    createdAt: (doc as any).createdAt?.toISOString(),
    updatedAt: (doc as any).updatedAt?.toISOString(),
  };
}

export async function register(data: { username: string; email: string; password: string; displayName: string; role?: UserRole }): Promise<ILoginResponse> {
  const existing = await UserModel.findOne({ $or: [{ username: data.username }, { email: data.email }] });
  if (existing) {
    throw new AppError(409, 'Username or email already exists');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await UserModel.create({
    username: data.username,
    email: data.email,
    displayName: data.displayName,
    passwordHash,
    role: data.role || 'manager',
  });

  return { user: await toUserJSON(user), tokens: generateTokens(user) };
}

export async function login(data: ILoginRequest): Promise<ILoginResponse> {
  const user = await UserModel.findOne({ username: data.username }).select('+passwordHash');
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const valid = await user.comparePassword(data.password);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date().toISOString() });
  return { user: await toUserJSON(user), tokens: generateTokens(user) };
}

export async function getMe(userId: string): Promise<IUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  return await toUserJSON(user);
}

export async function refreshAccessToken(refreshToken: string): Promise<IAuthTokens> {
  let payload: { sub: string };
  try {
    payload = jwt.verify(refreshToken, config.jwt.secret) as { sub: string };
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await UserModel.findById(payload.sub);
  if (!user) throw new UnauthorizedError('User not found');

  return generateTokens(user);
}
