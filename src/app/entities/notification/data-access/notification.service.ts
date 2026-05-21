import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import type { INotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/notifications';

  private readonly _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  private readonly _list = signal<INotification[]>([]);
  readonly list = this._list.asReadonly();

  private eventSource: EventSource | null = null;

  /** Подключиться к SSE */
  connect(token: string): void {
    this.disconnect();
    this.eventSource = new EventSource(`${this.api['baseUrl']}/${this.endpoint}/sse?token=${token}`);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') return;
        this._unreadCount.update((c) => c + 1);
        this._list.update((list) => [data.payload, ...list]);
      } catch { /* ignore malformed */ }
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  async loadUnread(): Promise<void> {
    const res = await this.api.get<{ data: INotification[] }>(`${this.endpoint}/unread`);
    this._list.set(res.data);
    this._unreadCount.set(res.data.length);
  }

  async markRead(id: string): Promise<void> {
    await this.api.patch(`${this.endpoint}/${id}/read`, {});
    this._unreadCount.update((c) => Math.max(0, c - 1));
    this._list.update((list) =>
      list.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
  }

  async markAllRead(): Promise<void> {
    await this.api.patch(`${this.endpoint}/read-all`, {});
    this._unreadCount.set(0);
    this._list.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }
}
