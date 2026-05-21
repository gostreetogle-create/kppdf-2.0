import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import type { IWorkTask } from '../models/work-task.model';

@Injectable({ providedIn: 'root' })
export class WorkTaskService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/work-tasks';

  async getByOrderItem(orderItemId: string): Promise<IWorkTask[]> {
    const res = await firstValueFrom(this.api.get<IWorkTask[]>(`${this.endpoint}/by-order-item/${orderItemId}`));
    return res.data;
  }

  async getByOrder(orderItemIds: string[]): Promise<IWorkTask[]> {
    const res = await firstValueFrom(this.api.post<IWorkTask[]>(`${this.endpoint}/by-order`, { orderItemIds }));
    return res.data;
  }

  async create(data: Partial<IWorkTask>): Promise<IWorkTask> {
    const res = await firstValueFrom(this.api.post<IWorkTask>(this.endpoint, data));
    return res.data;
  }

  async update(id: string, data: Partial<IWorkTask>): Promise<IWorkTask> {
    const res = await firstValueFrom(this.api.put<IWorkTask>(this.endpoint, id, data));
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(this.endpoint, id));
  }
}
