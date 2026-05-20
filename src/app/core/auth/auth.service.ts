import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
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
    // Восстановить токен при загрузке
    const token = this.store.accessToken();
    if (token) {
      this.api.setToken(token);
      this.loadCurrentUser().subscribe({
        error: () => this.store.clear(),
      });
    }
  }

  /** Авторизация */
  login(credentials: ILoginRequest): void {
    this.store.setLoading(true);
    this.api
      .post<ILoginResponse>('/auth/login', credentials)
      .pipe(
        tap((res) => {
          const { user, tokens } = res.data;
          this.store.setTokens(tokens.accessToken, tokens.refreshToken);
          this.api.setToken(tokens.accessToken);
          this.store.setUser(user);
          this.store.setLoading(false);
        }),
      )
      .subscribe({
        error: () => this.store.setLoading(false),
      });
  }

  /** Регистрация */
  register(data: { username: string; email: string; password: string; displayName: string }): void {
    this.store.setLoading(true);
    this.api
      .post<ILoginResponse>('/auth/register', data)
      .pipe(
        tap((res) => {
          const { user, tokens } = res.data;
          this.store.setTokens(tokens.accessToken, tokens.refreshToken);
          this.api.setToken(tokens.accessToken);
          this.store.setUser(user);
          this.store.setLoading(false);
        }),
      )
      .subscribe({
        error: () => this.store.setLoading(false),
      });
  }

  /** Загрузить текущего пользователя */
  loadCurrentUser() {
    return this.api.get<IUser>('/auth/me').pipe(
      tap((res) => {
        this.store.setUser(res.data);
      }),
    );
  }

  /** Выход */
  logout(): void {
    this.store.clear();
    this.api.setToken(null);
  }

  /** Обновить токен */
  refreshToken(): void {
    const rt = this.store.refreshToken();
    if (!rt) {
      this.logout();
      return;
    }

    this.api
      .post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken: rt })
      .pipe(
        tap((res) => {
          this.store.setTokens(res.data.accessToken, res.data.refreshToken);
          this.api.setToken(res.data.accessToken);
        }),
      )
      .subscribe({
        error: () => this.logout(),
      });
  }
}
