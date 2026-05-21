import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import type { IOrder } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'orders';

  private readonly _list = signal<IOrder[]>([]);
  readonly list = this._list.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  async loadAll(filters?: { statusId?: string; priority?: string; search?: string }): Promise<void> {
    this._loading.set(true);
    try {
      const params = new URLSearchParams();
      if (filters?.statusId) params.set('statusId', filters.statusId);
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.search) params.set('search', filters.search);
      const qs = params.toString();
      const url = qs ? `${this.endpoint}?${qs}` : this.endpoint;
      const res = await firstValueFrom(this.api.get<IOrder[]>(url));
      this._list.set(res.data);
    } finally {
      this._loading.set(false);
    }
  }

  async getById(id: string): Promise<IOrder> {
    const res = await firstValueFrom(this.api.get<IOrder>(`${this.endpoint}/${id}`));
    return res.data;
  }

  async getWithItems(id: string): Promise<{ order: IOrder; items: unknown[] }> {
    const res = await firstValueFrom(this.api.get<{ order: IOrder; items: unknown[] }>(`${this.endpoint}/${id}/items`));
    return res.data;
  }

  async create(data: Partial<IOrder> & { items?: Record<string, unknown>[] }): Promise<IOrder> {
    const res = await firstValueFrom(this.api.post<{ order: IOrder }>(this.endpoint, data));
    await this.loadAll();
    return res.data.order;
  }

  async update(id: string, data: Partial<IOrder>): Promise<IOrder> {
    const res = await firstValueFrom(this.api.put<IOrder>(this.endpoint, id, data));
    await this.loadAll();
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(this.endpoint, id));
    await this.loadAll();
  }
}
