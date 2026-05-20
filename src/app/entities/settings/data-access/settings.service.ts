import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Setting } from '../models/setting.model';
import { ApiService, ApiError } from '../../../core/api/api.service';
import { ResourceState, initialResourceState } from '../../../shared/utils/resource-state';
import type { ISetting } from '../../../shared/types/settings.interface';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);
  private readonly _refresh$ = new BehaviorSubject<void>(undefined);

  private readonly _items: Signal<ResourceState<Setting[]>> = toSignal(
    this._refresh$.pipe(
      switchMap(() =>
        this.api.get<ISetting[]>('/settings').pipe(
          map((res): ResourceState<Setting[]> => ({
            loading: false, error: null,
            data: (res.data ?? []).map((s) => new Setting(s)),
          })),
          catchError((err: ApiError) =>
            of({ loading: false, error: err.message ?? 'Ошибка загрузки', data: [] as Setting[] }),
          ),
          startWith(initialResourceState<Setting[]>([])),
        ),
      ),
    ),
    { initialValue: initialResourceState<Setting[]>([]) },
  );
  readonly items: Signal<ResourceState<Setting[]>> = this._items;
  reload(): void { this._refresh$.next(); }

  update(key: string, value: unknown): Observable<void> {
    return this.api.patch('/settings', key, { value }).pipe(map(() => { this.reload(); }));
  }
}
