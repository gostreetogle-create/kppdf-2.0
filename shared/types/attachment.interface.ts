/** Вложение / чертёж — привязано к сущности (order, product, orderItem) */
export interface IAttachment {
  _id?: string;
  entityType: 'order' | 'order-item' | 'product' | 'work-task';
  entityId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  /** Для чертежей — номер чертежа */
  drawingNumber?: string;
  /** Для чертежей — ревизия */
  revision?: string;
  uploadedBy?: string;
  createdAt?: string;
}
