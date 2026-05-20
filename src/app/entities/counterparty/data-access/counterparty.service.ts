import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Counterparty } from '../models/counterparty.model';
import { ApiService, ApiError } from '../../../core/api/api.service';
import { ResourceState, initialResourceState } from '../../../shared/utils/resource-state';
import type { ICounterparty } from '../../../shared/types/counterparty.interface';


@Injectable({ providedIn: 'root' })
export class CounterpartyService {
  private readonly api = inject(ApiService);
  private readonly _refresh$ = new BehaviorSubject<void>(undefined);

  private readonly _items: Signal<ResourceState<Counterparty[]>> = toSignal(
    this._refresh$.pipe(
      switchMap(() =>
        this.api.get<ICounterparty[]>('/counterparties').pipe(
          map((res): ResourceState<Counterparty[]> => ({
            loading: false,
            error: null,
            data: (res.data ?? []).map((p) => new Counterparty(p)),
          })),
          catchError((err: ApiError) =>
            of({ loading: false, error: err.message ?? 'Ошибка загрузки', data: [] as Counterparty[] }),
          ),
          startWith(initialResourceState<Counterparty[]>([])),
        ),
      ),
    ),
    { initialValue: initialResourceState<Counterparty[]>([]) },
  );
  readonly items: Signal<ResourceState<Counterparty[]>> = this._items;

  reload(): void { this._refresh$.next(); }

  getById(id: string): Signal<ResourceState<Counterparty | undefined>> {
    return toSignal(
      this._refresh$.pipe(
        switchMap(() =>
          this.api.getById<ICounterparty>('/counterparties', id).pipe(
            map((res): ResourceState<Counterparty | undefined> => ({
              loading: false, error: null, data: res.data ? new Counterparty(res.data) : undefined,
            })),
            catchError((err: ApiError) =>
              of({ loading: false, error: err.message ?? 'Ошибка загрузки', data: undefined }),
            ),
            startWith(initialResourceState<Counterparty | undefined>(undefined)),
          ),
        ),
      ),
      { initialValue: initialResourceState<Counterparty | undefined>(undefined) },
    );
  }

  create(data: Partial<ICounterparty>): Observable<Counterparty> {
    return this.api.post<ICounterparty>('/counterparties', data).pipe(
      map((res) => { this.reload(); return new Counterparty(res.data); }),
    );
  }

  update(id: string, data: Partial<ICounterparty>): Observable<Counterparty> {
    return this.api.put<ICounterparty>('/counterparties', id, data).pipe(
      map((res) => { this.reload(); return new Counterparty(res.data); }),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete('/counterparties', id).pipe(map(() => { this.reload(); }));
  }
}
