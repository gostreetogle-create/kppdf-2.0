import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import type { IOrderItem } from '../models/order-item.model';

@Injectable({ providedIn: 'root' })
export class OrderItemService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/order-items';

  async getByOrderId(orderId: string): Promise<IOrderItem[]> {
    const res = await firstValueFrom(this.api.get<IOrderItem[]>(`${this.endpoint}/by-order/${orderId}`));
    return res.data;
  }

  async create(data: Partial<IOrderItem>): Promise<IOrderItem> {
    const res = await firstValueFrom(this.api.post<IOrderItem>(this.endpoint, data));
    return res.data;
  }

  async update(id: string, data: Partial<IOrderItem>): Promise<IOrderItem> {
    const res = await firstValueFrom(this.api.put<IOrderItem>(this.endpoint, id, data));
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(this.endpoint, id));
  }

  async reorder(orderId: string, itemIds: string[]): Promise<void> {
    await firstValueFrom(this.api.patch(this.endpoint, `reorder/${orderId}`, { itemIds }));
  }
}
