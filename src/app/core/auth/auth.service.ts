import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthStore } from './auth.store';
import { ApiService } from '../api/api.service';
import type { ILoginRequest, ILoginResponse, IUser } from '../../shared/types/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly store = inject(AuthStore);

  constructor() {
    // Восстановить токен при загрузке (синхронно, без ожидания)
    const token = this.store.accessToken();
    if (token) {
      this.api.setToken(token);
    }
  }

  /** Авторизация — возвращает Observable, чтобы UI мог подписаться */
  login(credentials: ILoginRequest): Observable<void> {
    this.store.setLoading(true);
    return this.api.post<ILoginResponse>('/auth/login', credentials).pipe(
      tap((res) => {
        const { user, tokens } = res.data;
        this.store.setTokens(tokens.accessToken, tokens.refreshToken);
        this.api.setToken(tokens.accessToken);
        this.store.setUser(user);
        this.store.setLoading(false);
      }),
      map(() => void 0),
      catchError((err) => {
        this.store.setLoading(false);
        throw err;
      }),
    );
  }

  /** Регистрация */
  register(data: { username: string; email: string; password: string; displayName: string }): Observable<void> {
    this.store.setLoading(true);
    return this.api.post<ILoginResponse>('/auth/register', data).pipe(
      tap((res) => {
        const { user, tokens } = res.data;
        this.store.setTokens(tokens.accessToken, tokens.refreshToken);
        this.api.setToken(tokens.accessToken);
        this.store.setUser(user);
        this.store.setLoading(false);
      }),
      map(() => void 0),
      catchError((err) => {
        this.store.setLoading(false);
        throw err;
      }),
    );
  }

  /** Загрузить текущего пользователя */
  loadCurrentUser(): Observable<IUser> {
    return this.api.get<IUser>('/auth/me').pipe(
      tap((res) => {
        this.store.setUser(res.data);
      }),
      map((res) => res.data),
    );
  }

  /** Обновить токен */
  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const rt = this.store.refreshToken();
    if (!rt) {
      this.logout();
      return of({ accessToken: '', refreshToken: '' });
    }

    return this.api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken: rt }).pipe(
      tap((res) => {
        this.store.setTokens(res.data.accessToken, res.data.refreshToken);
        this.api.setToken(res.data.accessToken);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.logout();
        throw err;
      }),
    );
  }

  /** Выход */
  logout(): void {
    this.store.clear();
    this.api.setToken(null);
  }

  /** Инициализация при старте — проверяет токен и загружает пользователя */
  initAuth(): Observable<boolean> {
    const token = this.store.accessToken();
    if (!token) return of(false);

    this.api.setToken(token);

    return this.loadCurrentUser().pipe(
      map(() => true),
      catchError(() => {
        // Пробуем обновить токен
        const refresh = this.store.refreshToken();
        if (!refresh) {
          this.logout();
          return of(false);
        }
        return this.refreshToken().pipe(
          switchMap(() => this.loadCurrentUser().pipe(map(() => true))),
          catchError(() => {
            this.logout();
            return of(false);
          }),
        );
      }),
    );
  }
}
