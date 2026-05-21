import { OrderItemModel, IOrderItemDocument } from './order-item.model';
import { NotFoundError } from '../../shared/errors';
import { OrderModel } from '../order/order.model';

export async function getByOrderId(orderId: string): Promise<IOrderItemDocument[]> {
  return OrderItemModel.find({ orderId }).sort({ section: 1, sortOrder: 1 });
}

export async function create(data: Partial<IOrderItemDocument>): Promise<IOrderItemDocument> {
  const doc = await OrderItemModel.create(data);
  await recalcOrderTotal(doc.orderId);
  return doc;
}

export async function update(id: string, data: Partial<IOrderItemDocument>): Promise<IOrderItemDocument> {
  const doc = await OrderItemModel.findById(id);
  if (!doc) throw new NotFoundError('OrderItem', id);
  Object.assign(doc, data);
  if (data.quantity !== undefined || data.snapshot?.price !== undefined) {
    const price = data.snapshot?.price ?? doc.snapshot.price;
    const quantity = data.quantity ?? doc.quantity;
    doc.totalPrice = price * quantity;
  }
  await doc.save();
  await recalcOrderTotal(doc.orderId);
  return doc;
}

export async function remove(id: string): Promise<void> {
  const doc = await OrderItemModel.findById(id);
  if (!doc) throw new NotFoundError('OrderItem', id);
  const orderId = doc.orderId;
  await doc.deleteOne();
  await recalcOrderTotal(orderId);
}

export async function reorder(orderId: string, itemIds: string[]): Promise<void> {
  for (let i = 0; i < itemIds.length; i++) {
    await OrderItemModel.findByIdAndUpdate(itemIds[i], { sortOrder: i * 10 });
  }
}

async function recalcOrderTotal(orderId: string): Promise<void> {
  const items = await OrderItemModel.find({ orderId });
  const totalSum = items.reduce((s, it) => s + it.totalPrice, 0);
  await OrderModel.findByIdAndUpdate(orderId, { totalSum });
}
