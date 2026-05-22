import { OrderModel, IOrderDocument } from './order.model';
import { OrderItemModel } from '../order-item/order-item.model';
import { NotFoundError, AppError } from '../../shared/errors';

/** Генерирует номер заказа: ORDER-YYYYMMDD-XXX */
async function generateNumber(): Promise<string> {
  const date = new Date();
  const yymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const last = await OrderModel.findOne({ number: new RegExp(`^ORDER-${yymmdd}-`) })
    .sort({ number: -1 })
    .lean();
  let seq = 1;
  if (last) {
    const parts = last.number.split('-');
    seq = parseInt(parts[parts.length - 1] || '0', 10) + 1;
  }
  return `ORDER-${yymmdd}-${String(seq).padStart(3, '0')}`;
}

export async function getAll(
  filters: { statusId?: string; priority?: string; search?: string } = {},
): Promise<IOrderDocument[]> {
  const query: Record<string, unknown> = {};
  if (filters.statusId) query.statusId = filters.statusId;
  if (filters.priority) query.priority = filters.priority;
  if (filters.search) {
    query.$or = [
      { number: { $regex: filters.search, $options: 'i' } },
      { counterpartyName: { $regex: filters.search, $options: 'i' } },
    ];
  }
  return OrderModel.find(query).sort({ createdAt: -1 });
}

export async function getById(id: string): Promise<IOrderDocument> {
  const doc = await OrderModel.findById(id);
  if (!doc) throw new NotFoundError('Заказ', id);
  return doc;
}

export async function getWithItems(id: string): Promise<{ order: IOrderDocument; items: unknown[] }> {
  const order = await getById(id);
  const items = await OrderItemModel.find({ orderId: id }).sort({ sortOrder: 1 });
  return { order, items };
}

export async function create(data: Partial<IOrderDocument> & { items?: Array<{
  productId?: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  kind: 'ITEM' | 'SERVICE' | 'WORK';
  section: string;
  sku?: string;
  images?: string[];
}> }): Promise<{ order: IOrderDocument; items: unknown[] }> {
  const number = await generateNumber();
  const order = await OrderModel.create({
    ...data,
    number,
    totalSum: 0,
  });

  const items = data.items || [];
  const orderItems = items.map((item, i) => ({
    orderId: order._id.toString(),
    productId: item.productId,
    snapshot: {
      productId: item.productId,
      name: item.name,
      price: item.price,
      unit: item.unit,
      sku: item.sku || '',
      images: item.images || [],
    },
    quantity: item.quantity,
    totalPrice: item.price * item.quantity,
    kind: item.kind,
    section: item.section || 'work',
    sortOrder: i * 10,
  }));

  const createdItems = await OrderItemModel.insertMany(orderItems);
  const totalSum = createdItems.reduce((s, it) => s + it.totalPrice, 0);
  order.totalSum = totalSum;
  await order.save();

  return { order, items: createdItems };
}

export async function update(
  id: string,
  data: Partial<IOrderDocument>,
): Promise<IOrderDocument> {
  const doc = await getById(id);
  Object.assign(doc, data);
  return doc.save();
}

/** Пересчитать totalSum заказа */
export async function recalcTotal(id: string): Promise<IOrderDocument> {
  const order = await getById(id);
  const items = await OrderItemModel.find({ orderId: id });
  order.totalSum = items.reduce((s, it) => s + it.totalPrice, 0);
  return order.save();
}

export async function remove(id: string): Promise<void> {
  const doc = await getById(id);
  await OrderItemModel.deleteMany({ orderId: id });
  await doc.deleteOne();
}
