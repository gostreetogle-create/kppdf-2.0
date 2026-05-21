import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import type { IProductCategory } from '@shared/types/category.types';
import type { IAttributeValue, LifecycleStatus } from '@shared/types/attribute.types';
import type { IComponentNode } from '@shared/types/bom.types';

@Injectable({ providedIn: 'root' })
export class SpecService {
  private readonly http = inject(HttpClient);

  /** Получить все категории */
  readonly categories = toSignal(
    this.http.get<{ data: IProductCategory[] }>('/api/v1/spec/categories'),
    { initialValue: [] as IProductCategory[] },
  );

  /** Получить категорию по ID */
  getCategory(id: string) {
    return this.http.get<{ data: IProductCategory }>(`/api/v1/spec/categories/${id}`);
  }

  /** Создать категорию */
  createCategory(data: Partial<IProductCategory>) {
    return this.http.post<{ data: { id: string } }>('/api/v1/spec/categories', data);
  }

  /** Получить спецификацию (Digital Twin) */
  getSpec(specId: string) {
    return this.http.get<{ data: any }>(`/api/v1/spec/specs/${specId}`);
  }

  /** Создать спецификацию */
  createSpec(productId: string, categoryId: string) {
    return this.http.post<{ data: { id: string } }>('/api/v1/spec/specs', { productId, categoryId });
  }

  /** Продвинуть жизненный цикл */
  advanceLifecycle(specId: string) {
    return this.http.post<{ data: { status: string } }>(`/api/v1/spec/specs/${specId}/advance`, {});
  }

  /** Сохранить BOM-дерево */
  saveBom(specId: string, bom: IComponentNode) {
    return this.http.post(`/api/v1/spec/specs/${specId}/bom`, { bom });
  }
}
