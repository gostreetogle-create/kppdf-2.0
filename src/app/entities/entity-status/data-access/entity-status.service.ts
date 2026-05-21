import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import type { IEntityStatus } from '../../../shared/types/entity-status.interface';

@Injectable({ providedIn: 'root' })
export class EntityStatusService {
  private readonly api = inject(ApiService);

  /** Кеш статусов по entityType */
  private readonly _cache = signal<Map<string, IEntityStatus[]>>(new Map());

  /** Получить статусы для типа (с кешем) */
  getByEntityType(entityType: string): Observable<IEntityStatus[]> {
    const cached = this._cache().get(entityType);
    if (cached) {
      return new Observable((sub) => {
        sub.next(cached);
        sub.complete();
      });
    }
    return this.api.get<IEntityStatus[]>(`/entity-statuses/${entityType}`).pipe(
      map((res) => res.data ?? []),
      tap((data) => {
        this._cache.update((map) => {
          map.set(entityType, data);
          return new Map(map);
        });
      }),
    );
  }

  /** Создать статус */
  create(data: Partial<IEntityStatus>): Observable<IEntityStatus> {
    return this.api.post<IEntityStatus>('/entity-statuses', data).pipe(
      map((res) => res.data),
      tap(() => this.invalidateCache(data.entityType!)),
    );
  }

  /** Обновить статус */
  update(entityType: string, statusId: string, data: Partial<IEntityStatus>): Observable<IEntityStatus> {
    return this.api.put<IEntityStatus>(`/entity-statuses/${entityType}`, statusId, data).pipe(
      map((res) => res.data),
      tap(() => this.invalidateCache(entityType)),
    );
  }

  /** Удалить статус */
  remove(entityType: string, statusId: string): Observable<void> {
    return this.api.deleteByPath<void>(`/entity-statuses/${entityType}/${statusId}`).pipe(
      map(() => undefined),
      tap(() => this.invalidateCache(entityType)),
    );
  }

  private invalidateCache(entityType: string): void {
    this._cache.update((map) => {
      map.delete(entityType);
      return new Map(map);
    });
  }
}
