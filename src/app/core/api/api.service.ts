import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  total?: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private _token: string | null = null;

  /** Установить accessToken для авторизации */
  setToken(token: string | null): void {
    this._token = token;
  }

  /** Получить текущий токен */
  getToken(): string | null {
    return this._token;
  }

  /** Собрать заголовки (Content-Type + Bearer если есть токен) */
  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }
    return headers;
  }

  /** Преобразовать ответ в ApiResponse<T> */
  private handleResponse<T>(obs: Observable<T>): Observable<ApiResponse<T>> {
    return obs.pipe(
      map((body) => {
        // Если ответ уже имеет форму { data, total } — проксируем
        if (body && typeof body === 'object' && 'data' in (body as object)) {
          return body as unknown as ApiResponse<T>;
        }
        // Иначе оборачиваем
        return { data: body } as ApiResponse<T>;
      }),
      catchError((err: HttpErrorResponse) => {
        const apiError: ApiError = {
          message: err.error?.error?.message ?? err.message ?? 'Unknown error',
          code: err.error?.error?.code,
        };
        return throwError(() => apiError);
      }),
    );
  }

  // ---- HTTP методы ----

  get<T>(path: string, params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>): Observable<ApiResponse<T>> {
    const httpParams = params instanceof HttpParams ? params : new HttpParams({ fromObject: params as Record<string, string | number | boolean | readonly (string | number | boolean)[]> });
    return this.handleResponse(
      this.http.get<T>(`${this.baseUrl}${path}`, {
        headers: this.headers(),
        params: httpParams,
      }),
    );
  }

  getById<T>(path: string, id: string): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.get<T>(`${this.baseUrl}${path}/${encodeURIComponent(id)}`, {
        headers: this.headers(),
      }),
    );
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.post<T>(`${this.baseUrl}${path}`, body, {
        headers: this.headers(),
      }),
    );
  }

  put<T>(path: string, id: string, body: unknown): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.put<T>(`${this.baseUrl}${path}/${encodeURIComponent(id)}`, body, {
        headers: this.headers(),
      }),
    );
  }

  patch<T>(path: string, id: string, body: unknown): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.patch<T>(`${this.baseUrl}${path}/${encodeURIComponent(id)}`, body, {
        headers: this.headers(),
      }),
    );
  }

  /** Загрузить файлы (multipart/form-data) */
  upload<T>(path: string, files: File[], fieldName = 'images'): Observable<ApiResponse<T>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append(fieldName, file, file.name);
    }
    return this.handleResponse(
      this.http.post<T>(`${this.baseUrl}${path}`, formData, {
        headers: {
          ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
        },
      }),
    );
  }

  /** DELETE без id (для /uploads/filename) */
  deleteByPath<T = void>(path: string): Observable<ApiResponse<T>> {
    return this.handleResponse<T>(
      this.http.delete<T>(`${this.baseUrl}${path}`, {
        headers: this.headers(),
      }) as Observable<T>,
    );
  }

  delete<T = void>(path: string, id: string): Observable<ApiResponse<T>> {
    return this.handleResponse<T>(
      this.http.delete<T>(`${this.baseUrl}${path}/${encodeURIComponent(id)}`, {
        headers: this.headers(),
      }) as Observable<T>,
    );
  }
}
