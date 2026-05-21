import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { IRole } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'roles';

  private readonly _list = signal<IRole[]>([]);
  readonly list = this._list.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  async loadAll(): Promise<void> {
    this._loading.set(true);
    try {
      const res = await this.api.get<{ data: IRole[] }>(this.endpoint);
      this._list.set(res.data);
    } finally {
      this._loading.set(false);
    }
  }

  async getByName(name: string): Promise<IRole | null> {
    const res = await this.api.get<{ data: IRole | null }>(`${this.endpoint}/${name}`);
    return res.data;
  }

  async create(data: Partial<IRole>): Promise<IRole> {
    const res = await this.api.post<{ data: IRole }>(this.endpoint, data);
    await this.loadAll();
    return res.data;
  }

  async update(name: string, data: Partial<IRole>): Promise<IRole> {
    const res = await this.api.put<{ data: IRole }>(`${this.endpoint}/${name}`, data);
    await this.loadAll();
    return res.data;
  }

  async delete(name: string): Promise<void> {
    await this.api.delete(`${this.endpoint}/${name}`);
    await this.loadAll();
  }
}
