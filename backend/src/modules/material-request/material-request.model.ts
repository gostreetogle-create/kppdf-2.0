import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../../shared/middleware/audit.plugin';
import type { IMaterialRequest } from '@shared/types/material-request.interface';

export interface IMaterialRequestDocument extends Omit<IMaterialRequest, '_id'>, Document {}

const materialRequestSchema = new Schema<IMaterialRequestDocument>(
  {
    orderItemId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    productId: { type: String },
    productName: { type: String, required: true },
    sku: { type: String },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    approvedQuantity: { type: Number },
    statusId: { type: String, required: true },
    neededAt: { type: String },
    comment: { type: String },
    createdBy: { type: String },
    approvedBy: { type: String },
  },
  { timestamps: true },
);

materialRequestSchema.plugin(auditPlugin);

export const MaterialRequestModel = mongoose.model<IMaterialRequestDocument>('MaterialRequest', materialRequestSchema);
