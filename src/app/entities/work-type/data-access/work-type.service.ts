import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { IWorkType } from '../models/work-type.model';

@Injectable({ providedIn: 'root' })
export class WorkTypeService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/work-types';
  private readonly _list = signal<IWorkType[]>([]);
  readonly list = this._list.asReadonly();

  async loadAll(): Promise<void> {
    const res = await this.api.get<{ data: IWorkType[] }>(this.endpoint);
    this._list.set(res.data);
  }

  async create(data: Partial<IWorkType>): Promise<IWorkType> {
    const res = await this.api.post<{ data: IWorkType }>(this.endpoint, data);
    await this.loadAll();
    return res.data;
  }

  async update(name: string, data: Partial<IWorkType>): Promise<IWorkType> {
    const res = await this.api.put<{ data: IWorkType }>(`${this.endpoint}/${name}`, data);
    await this.loadAll();
    return res.data;
  }

  async delete(name: string): Promise<void> {
    await this.api.delete(`${this.endpoint}/${name}`);
    await this.loadAll();
  }
}
