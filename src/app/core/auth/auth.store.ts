import { computed, Injectable, signal } from '@angular/core';
import type { IUser } from '../../shared/types/user.interface';

const TOKEN_KEY = 'kppdf_access_token';
const REFRESH_KEY = 'kppdf_refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly _user = signal<IUser | null>(null);
  private readonly _accessToken = signal<string | null>(this.loadToken(TOKEN_KEY));
  private readonly _refreshToken = signal<string | null>(this.loadToken(REFRESH_KEY));
  private readonly _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  // ---- Token management ----

  private loadToken(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private saveToken(key: string, value: string | null): void {
    try {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // localStorage not available
    }
  }

  setTokens(accessToken: string | null, refreshToken: string | null): void {
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
    this.saveToken(TOKEN_KEY, accessToken);
    this.saveToken(REFRESH_KEY, refreshToken);
  }

  // ---- User state ----

  setUser(user: IUser | null): void {
    this._user.set(user);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  /** Полная очистка — logout */
  clear(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this.saveToken(TOKEN_KEY, null);
    this.saveToken(REFRESH_KEY, null);
  }
}
