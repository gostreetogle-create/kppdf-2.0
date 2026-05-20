import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';

export function authGuard() {
  const store = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Есть токен — проверяем, что пользователь загружен
  if (store.isAuthenticated()) {
    if (store.user()) {
      return true;
    }
    // Токен есть, но пользователь ещё не загружен — ждём
    return authService.initAuth().pipe(
      map((ok) => {
        if (ok) return true;
        router.navigate(['/login']);
        return false;
      }),
    );
  }

  // Нет токена — на логин
  router.navigate(['/login']);
  return false;
}
