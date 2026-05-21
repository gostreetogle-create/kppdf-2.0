import mongoose, { Schema, Document } from 'mongoose';
import type { IKp, KpStatus, KpType, IKpItem, IKpMetadata, IKpCompanySnapshot, IKpRecipientSnapshot, IKpVersionMeta } from '@shared/types/kp.interface';

export interface IKpDocument extends Omit<IKp, '_id'>, Document {}

const kpItemSchema = new Schema<IKpItem>(
  {
    productId: { type: String, required: true },
    code: { type: String },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    markupEnabled: { type: Boolean, default: false },
    markupPercent: { type: Number, min: 0 },
    discountEnabled: { type: Boolean, default: false },
    discountPercent: { type: Number, min: 0 },
    effectivePrice: { type: Number },
  },
  { _id: false },
);

const recipientSnapshotSchema = new Schema<IKpRecipientSnapshot>(
  {
    name: { type: String, required: true },
    shortName: { type: String },
    legalForm: { type: String },
    inn: { type: String },
    kpp: { type: String },
    ogrn: { type: String },
    legalAddress: { type: String },
    phone: { type: String },
    email: { type: String },
    bankName: { type: String },
    bik: { type: String },
    checkingAccount: { type: String },
    correspondentAccount: { type: String },
  },
  { _id: false },
);

const metadataSchema = new Schema<IKpMetadata>(
  {
    number: { type: String, required: true },
    createdAt: { type: String },
    validityDays: { type: Number, default: 30 },
    prepaymentPercent: { type: Number, default: 50 },
    productionDays: { type: Number, default: 30 },
    tablePageBreakFirstPage: { type: Number },
    tablePageBreakNextPages: { type: Number },
    photoScalePercent: { type: Number },
    showPhotoColumn: { type: Boolean, default: true },
    defaultMarkupPercent: { type: Number },
    defaultDiscountPercent: { type: Number },
  },
  { _id: false },
);

const companySnapshotSchema = new Schema<IKpCompanySnapshot>(
  {
    companyId: { type: String, default: '' },
    companyName: { type: String, default: '' },
    templateKey: { type: String, default: 'default' },
    templateName: { type: String, default: 'По умолчанию' },
    kpType: { type: String, default: 'standard' },
    assets: {
      kpPage1: { type: String, default: '' },
      kpPage2: { type: String },
      passport: { type: String },
      appendix: { type: String },
    },
    texts: {
      headerNote: { type: String },
      introText: { type: String },
      footerText: { type: String },
      closingText: { type: String },
    },
    requisites: {
      inn: { type: String },
      kpp: { type: String },
      ogrn: { type: String },
      phone: { type: String },
      email: { type: String },
    },
  },
  { _id: false },
);

const versionMetaSchema = new Schema<IKpVersionMeta>(
  {
    version: { type: Number, required: true },
    createdAt: { type: String, required: true },
    status: { type: String, required: true },
    number: { type: String, required: true },
    title: { type: String, required: true },
  },
  { _id: false },
);

const kpSchema = new Schema<IKpDocument>(
  {
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected'],
      default: 'draft',
    },
    kpType: {
      type: String,
      enum: ['standard', 'response', 'special', 'tender', 'service'],
      default: 'standard',
    },
    counterpartyId: { type: String },
    companyId: { type: String },
    recipient: { type: recipientSnapshotSchema, required: true },
    metadata: { type: metadataSchema, required: true },
    companySnapshot: { type: companySnapshotSchema, required: true },
    items: [kpItemSchema],
    conditions: [{ type: String }],
    vatPercent: { type: Number, default: 0 },
    totalAmount: { type: Number },
    versions: [versionMetaSchema],
    createdBy: { type: String },
  },
  { timestamps: true },
);

kpSchema.index({ 'metadata.number': 1 });
kpSchema.index({ status: 1 });
kpSchema.index({ counterpartyId: 1 });

export const KpModel = mongoose.model<IKpDocument>('Kp', kpSchema);
