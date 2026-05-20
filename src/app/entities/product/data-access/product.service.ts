import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ApiService, ApiError } from '../../../core/api/api.service';
import {
  ResourceState,
  initialResourceState,
} from '../../../shared/utils/resource-state';
import type { IProduct } from '../../../shared/types/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);

  /** Триггер перезагрузки списка */
  private readonly _refresh$ = new BehaviorSubject<void>(undefined);

  /** Данные списка товаров (реактивные — обновляются при reload()) */
  private readonly _products: Signal<ResourceState<Product[]>> = toSignal(
    this._refresh$.pipe(
      switchMap(() =>
        this.api.get<IProduct[]>('/products').pipe(
          map((res): ResourceState<Product[]> => ({
            loading: false,
            error: null,
            data: (res.data ?? []).map((p) => new Product(p)),
          })),
          catchError((err: ApiError) =>
            of({
              loading: false,
              error: err.message ?? 'Ошибка загрузки товаров',
              data: [] as Product[],
            }),
          ),
          startWith(initialResourceState<Product[]>([])),
        ),
      ),
    ),
    { initialValue: initialResourceState<Product[]>([]) },
  );
  readonly products: Signal<ResourceState<Product[]>> = this._products;

  /** Принудительная перезагрузка списка */
  reload(): void {
    this._refresh$.next();
  }

  getById(id: string): Signal<ResourceState<Product | undefined>> {
    return toSignal(
      this.api.getById<IProduct>('/products', id).pipe(
        map((res): ResourceState<Product | undefined> => ({
          loading: false,
          error: null,
          data: res.data ? new Product(res.data) : undefined,
        })),
        catchError((err: ApiError) =>
          of({
            loading: false,
            error: err.message ?? 'Ошибка загрузки товара',
            data: undefined,
          }),
        ),
        startWith(initialResourceState<Product | undefined>(undefined)),
      ),
      { initialValue: initialResourceState<Product | undefined>(undefined) },
    );
  }

  /** Создать товар */
  create(data: Partial<IProduct>): Observable<Product> {
    return this.api.post<IProduct>('/products', data).pipe(
      map((res) => {
        this.reload();
        return new Product(res.data);
      }),
    );
  }

  /** Обновить товар */
  update(id: string, data: Partial<IProduct>): Observable<Product> {
    return this.api.put<IProduct>('/products', id, data).pipe(
      map((res) => {
        this.reload();
        return new Product(res.data);
      }),
    );
  }

  /** Удалить товар */
  delete(id: string): Observable<void> {
    return this.api.delete('/products', id).pipe(
      map(() => {
        this.reload();
      }),
    );
  }
}
