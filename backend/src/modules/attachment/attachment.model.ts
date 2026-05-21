import mongoose, { Schema, Document } from 'mongoose';
import type { IAttachment } from '@shared/types/attachment.interface';

export interface IAttachmentDocument extends Omit<IAttachment, '_id'>, Document {}

const attachmentSchema = new Schema<IAttachmentDocument>(
  {
    entityType: { type: String, enum: ['order', 'order-item', 'product', 'work-task'], required: true },
    entityId: { type: String, required: true, index: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    drawingNumber: { type: String },
    revision: { type: String },
    uploadedBy: { type: String },
  },
  { timestamps: true },
);

attachmentSchema.index({ entityType: 1, entityId: 1 });

export const AttachmentModel = mongoose.model<IAttachmentDocument>('Attachment', attachmentSchema);
