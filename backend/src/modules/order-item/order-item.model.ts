import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../../shared/middleware/audit.plugin';
import type { IOrderItem, IOrderItemSnapshot } from '@shared/types/order.interface';

export interface IOrderItemDocument extends Omit<IOrderItem, '_id'>, Document {}

const snapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    sku: { type: String },
    images: [{ type: String }],
  },
  { _id: false },
);

const orderItemSchema = new Schema<IOrderItemDocument>(
  {
    orderId: { type: String, required: true, index: true },
    productId: { type: String },
    snapshot: { type: snapshotSchema, required: true },
    quantity: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true },
    kind: { type: String, enum: ['ITEM', 'SERVICE', 'WORK'], required: true },
    section: { type: String, enum: ['materials', 'work', 'task', 'drawing'], default: 'work' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

orderItemSchema.index({ orderId: 1, section: 1, sortOrder: 1 });
orderItemSchema.plugin(auditPlugin);

export const OrderItemModel = mongoose.model<IOrderItemDocument>('OrderItem', orderItemSchema);
