import type { IOrderItemSnapshot } from './order.interface';

/** Производственная задача — привязана к позиции заказа */
export interface IWorkTask {
  _id?: string;
  orderItemId: string;
  workTypeId?: string;
  statusId: string;
  executorId?: string;
  executorName?: string;
  plannedHours: number;
  actualHours?: number;
  description: string;
  /** Snapshot — имя позиции на момент создания */
  itemSnapshot?: Pick<IOrderItemSnapshot, 'name' | 'sku'>;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
