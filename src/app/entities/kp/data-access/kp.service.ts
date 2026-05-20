import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Kp } from '../models/kp.model';
import { ApiService, ApiError } from '../../../core/api/api.service';
import { ResourceState, initialResourceState } from '../../../shared/utils/resource-state';
import type { IKp } from '../../../shared/types/kp.interface';

@Injectable({ providedIn: 'root' })
export class KpService {
  private readonly api = inject(ApiService);
  private readonly _refresh$ = new BehaviorSubject<void>(undefined);

  private readonly _items: Signal<ResourceState<Kp[]>> = toSignal(
    this._refresh$.pipe(
      switchMap(() =>
        this.api.get<IKp[]>('/kp').pipe(
          map((res): ResourceState<Kp[]> => ({
            loading: false, error: null,
            data: (res.data ?? []).map((p) => new Kp(p)),
          })),
          catchError((err: ApiError) =>
            of({ loading: false, error: err.message ?? 'Ошибка загрузки', data: [] as Kp[] }),
          ),
          startWith(initialResourceState<Kp[]>([])),
        ),
      ),
    ),
    { initialValue: initialResourceState<Kp[]>([]) },
  );
  readonly items: Signal<ResourceState<Kp[]>> = this._items;
  reload(): void { this._refresh$.next(); }

  create(data: Partial<IKp>): Observable<Kp> {
    return this.api.post<IKp>('/kp', data).pipe(
      map((res) => { this.reload(); return new Kp(res.data); }),
    );
  }
  update(id: string, data: Partial<IKp>): Observable<Kp> {
    return this.api.put<IKp>('/kp', id, data).pipe(
      map((res) => { this.reload(); return new Kp(res.data); }),
    );
  }
  delete(id: string): Observable<void> {
    return this.api.delete('/kp', id).pipe(map(() => { this.reload(); }));
  }
}
