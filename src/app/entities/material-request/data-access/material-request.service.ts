import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { IMaterialRequest } from '../models/material-request.model';

@Injectable({ providedIn: 'root' })
export class MaterialRequestService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'material-requests';

  async getByOrder(orderId: string): Promise<IMaterialRequest[]> {
    const res = await this.api.get<{ data: IMaterialRequest[] }>(`${this.endpoint}/by-order/${orderId}`);
    return res.data;
  }

  async getByOrderItem(orderItemId: string): Promise<IMaterialRequest[]> {
    const res = await this.api.get<{ data: IMaterialRequest[] }>(`${this.endpoint}/by-order-item/${orderItemId}`);
    return res.data;
  }

  async create(data: Partial<IMaterialRequest>): Promise<IMaterialRequest> {
    const res = await this.api.post<{ data: IMaterialRequest }>(this.endpoint, data);
    return res.data;
  }

  async update(id: string, data: Partial<IMaterialRequest>): Promise<IMaterialRequest> {
    const res = await this.api.put<{ data: IMaterialRequest }>(`${this.endpoint}/${id}`, data);
    return res.data;
  }

  async approve(id: string, approvedQuantity: number, approvedBy: string): Promise<IMaterialRequest> {
    const res = await this.api.patch<{ data: IMaterialRequest }>(`${this.endpoint}/${id}/approve`, { approvedQuantity, approvedBy });
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${this.endpoint}/${id}`);
  }
}
