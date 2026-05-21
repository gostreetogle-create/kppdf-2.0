/** Заявка на материал — привязана к позиции заказа */
export interface IMaterialRequest {
  _id?: string;
  orderItemId: string;
  orderId: string;
  productId?: string;
  productName: string;
  sku?: string;
  unit: string;
  quantity: number;
  approvedQuantity?: number;
  statusId: string;
  neededAt?: string;
  comment?: string;
  createdBy?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
