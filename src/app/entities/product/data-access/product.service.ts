import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { Product } from '../models/product.model';
import { API_BASE_URL } from '../../../core/api.config';
import {
  ResourceState,
  initialResourceState,
} from '../../../shared/utils/resource-state';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/products`;

  private readonly _products: Signal<ResourceState<Product[]>> = toSignal(
    this.http.get<Product[]>(this.baseUrl).pipe(
      map((data): ResourceState<Product[]> => ({
        loading: false,
        error: null,
        data,
      })),
      catchError((err: HttpErrorResponse) =>
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
      this.http.get<Product>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
        map((data): ResourceState<Product | undefined> => ({
          loading: false,
          error: null,
          data,
        })),
        catchError((err: HttpErrorResponse) =>
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