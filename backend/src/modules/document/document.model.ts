import mongoose, { Schema, Document } from 'mongoose';
import type { IDocument, IDocumentPage, IOverlayDef } from '@shared/types/document.types';

export interface IDocumentDocument extends Omit<IDocument, 'id'>, Document {}

const overlayDefSchema = new Schema<IOverlayDef>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'table', 'image', 'qrcode', 'barcode'], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    dataSource: { type: String, required: true },
    style: {
      type: new Schema(
        {
          fontSize: { type: Number, required: true },
          fontFamily: { type: String, required: true },
          bold: { type: Boolean, default: false },
          textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
          color: { type: String, default: '#000000' },
        },
        { _id: false },
      ),
      required: true,
    },
    tableColumns: [
      new Schema(
        {
          field: { type: String, required: true },
          header: { type: String, required: true },
          width: { type: Number, required: true },
          align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
          format: { type: String },
        },
        { _id: false },
      ),
    ],
    pageBreak: { type: String, enum: ['none', 'auto', 'always'], default: 'none' },
    visibilityCondition: { type: String },
    qrcodeData: { type: String },
  },
  { _id: false },
);

const documentPageSchema = new Schema<IDocumentPage>(
  {
    pageNumber: { type: Number, required: true },
    backgroundImage: { type: String },
    overlays: [overlayDefSchema],
  },
  { _id: false },
);

const documentSchema = new Schema<IDocumentDocument>(
  {
    templateId: { type: String, required: true },
    templateName: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['kp', 'contract', 'invoice', 'passport', 'appendix', 'spec'],
      required: true,
    },
    entityId: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['draft', 'final', 'archived'],
      default: 'draft',
    },
    pages: [documentPageSchema],
    finalizedAt: { type: String },
  },
  { timestamps: true },
);

documentSchema.index({ entityType: 1, entityId: 1 });
documentSchema.index({ templateId: 1 });
documentSchema.index({ status: 1 });

export const DocumentModel = mongoose.model<IDocumentDocument>('Document', documentSchema);
