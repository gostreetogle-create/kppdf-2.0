export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface ILoginResponse {
  user: IUser;
  tokens: IAuthTokens;
}
