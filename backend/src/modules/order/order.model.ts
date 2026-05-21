import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../../shared/middleware/audit.plugin';
import type { IOrder, OrderPriority } from '@shared/types/order.interface';

export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const orderSchema = new Schema<IOrderDocument>(
  {
    number: { type: String, required: true, unique: true },
    statusId: { type: String, required: true, index: true },
    counterpartyId: { type: String },
    counterpartyName: { type: String, required: true },
    counterpartyInn: { type: String },
    kpIds: [{ type: String }],
    totalSum: { type: Number, default: 0 },
    vatPercent: { type: Number, default: 20 },
    productionDays: { type: Number, default: 30 },
    prepaymentPercent: { type: Number, default: 50 },
    plannedStartDate: { type: String },
    plannedEndDate: { type: String },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    description: { type: String, default: '' },
    internalNote: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

orderSchema.index({ statusId: 1, priority: -1 });
orderSchema.index({ counterpartyName: 'text', number: 'text' });

orderSchema.plugin(auditPlugin);

export const OrderModel = mongoose.model<IOrderDocument>('Order', orderSchema);
