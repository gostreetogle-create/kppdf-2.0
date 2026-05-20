import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
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

  private readonly _products: Signal<ResourceState<Product[]>> = toSignal(
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
    { initialValue: initialResourceState<Product[]>([]) },
  );
  readonly products: Signal<ResourceState<Product[]>> = this._products;

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
}
