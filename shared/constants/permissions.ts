import type { UserRole } from '../types/user.interface';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: ['*'],
  admin: [
    'kp.*',
    'products.*',
    'counterparties.*',
    'settings.*',
    'backups.*',
    'users.*',
  ],
  manager: [
    'kp.*',
    'products.read',
    'products.create',
    'counterparties.read',
    'settings.read',
  ],
  viewer: [
    'kp.read',
    'products.read',
    'counterparties.read',
  ],
};

export function can(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.some((p) => {
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2);
      return permission.startsWith(prefix);
    }
    return p === permission;
  });
}
