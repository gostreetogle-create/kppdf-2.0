import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { IAttachment } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'attachments';

  private readonly _list = signal<IAttachment[]>([]);
  readonly list = this._list.asReadonly();

  async getByEntity(entityType: string, entityId: string): Promise<void> {
    const res = await this.api.get<{ data: IAttachment[] }>(`${this.endpoint}/by-entity/${entityType}/${entityId}`);
    this._list.set(res.data);
  }
}
