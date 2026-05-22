import mongoose, { Schema, Document } from 'mongoose';
import type { IDocumentTemplate, IDocumentPage, IOverlayDef, ITableColumnDef, IOverlayStyle } from '@shared/types/document.types';

export interface IDocumentTemplateDocument extends Omit<IDocumentTemplate, 'id'>, Document {}

const overlayStyleSchema = new Schema<IOverlayStyle>(
  {
    fontSize: { type: Number, required: true },
    fontFamily: { type: String, required: true },
    bold: { type: Boolean, default: false },
    textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    color: { type: String, default: '#000000' },
  },
  { _id: false },
);

const tableColumnSchema = new Schema<ITableColumnDef>(
  {
    field: { type: String, required: true },
    header: { type: String, required: true },
    width: { type: Number, required: true },
    align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    format: { type: String },
  },
  { _id: false },
);

const overlayDefSchema = new Schema<IOverlayDef>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'table', 'image', 'qrcode', 'barcode'], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    dataSource: { type: String, required: true },
    style: { type: overlayStyleSchema, required: true },
    tableColumns: [tableColumnSchema],
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

const documentTemplateSchema = new Schema<IDocumentTemplateDocument>(
  {
    name: { type: String, required: true, trim: true },
    documentType: {
      type: String,
      enum: ['kp', 'contract', 'invoice', 'passport', 'appendix', 'spec'],
      required: true,
    },
    description: { type: String },
    backgroundImage: { type: String, required: true },
    pages: [documentPageSchema],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

documentTemplateSchema.index({ documentType: 1, isDefault: 1 });
documentTemplateSchema.index({ name: 'text' });

export const DocumentTemplateModel = mongoose.model<IDocumentTemplateDocument>('DocumentTemplate', documentTemplateSchema);
