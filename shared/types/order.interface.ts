export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface IOrderItemSnapshot {
  productId?: string;
  name: string;
  price: number;
  unit: string;
  sku?: string;
  images: string[];
}

export interface IOrder {
  _id?: string;
  number: string;
  statusId: string;
  /** Реквизиты (snapshot из KP / Counterparty) */
  counterpartyId?: string;
  counterpartyName: string;
  counterpartyInn?: string;
  /** Привязка к исходному КП */
  kpIds: string[];
  /** Валютные параметры */
  totalSum: number;
  vatPercent: number;
  productionDays: number;
  prepaymentPercent: number;
  /** Сроки */
  plannedStartDate?: string;
  plannedEndDate?: string;
  priority: OrderPriority;
  description: string;
  /** Примечание менеджера */
  internalNote?: string;
  /** Кто создал */
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrderItem {
  _id?: string;
  orderId: string;
  productId?: string;
  /** Snapshot-копия из Product на момент создания */
  snapshot: IOrderItemSnapshot;
  quantity: number;
  totalPrice: number;
  kind: 'ITEM' | 'SERVICE' | 'WORK';
  section: 'materials' | 'work' | 'task' | 'drawing';
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Статистика заказа для карточки */
export interface IOrderStats {
  totalItems: number;
  itemCount: number;
  serviceCount: number;
  workCount: number;
  totalSum: number;
}
