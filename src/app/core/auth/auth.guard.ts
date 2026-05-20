import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';

export function authGuard(): boolean {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (store.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
}
