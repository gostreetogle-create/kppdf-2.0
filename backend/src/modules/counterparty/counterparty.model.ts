import mongoose, { Schema, Document } from 'mongoose';
import type { ICounterparty, CounterpartyLegalForm, CounterpartyRole, ICounterpartyBrandingTemplate } from '@shared/types/counterparty.interface';

export interface ICounterpartyDocument extends Omit<ICounterparty, '_id'>, Document {}

const brandingTemplateSchema = new Schema<ICounterpartyBrandingTemplate>(
  {
    templateKey: { type: String, required: true },
    templateName: { type: String, required: true },
    kpType: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
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
    conditions: [{ type: String }],
  },
  { _id: false },
);

const counterpartySchema = new Schema<ICounterpartyDocument>(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    legalForm: {
      type: String,
      enum: ['ООО', 'ИП', 'АО', 'ПАО', 'МКУ', 'Физлицо', 'Другое'],
      required: true,
    },
    roles: [{ type: String, enum: ['client', 'supplier', 'company'] }],
    isOurCompany: { type: Boolean, default: false },
    isDefaultInitiator: { type: Boolean, default: false },
    inn: { type: String, trim: true },
    kpp: { type: String, trim: true },
    ogrn: { type: String, trim: true },
    legalAddress: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    bankName: { type: String, trim: true },
    bik: { type: String, trim: true },
    checkingAccount: { type: String, trim: true },
    correspondentAccount: { type: String, trim: true },
    founderName: { type: String, trim: true },
    founderNameShort: { type: String, trim: true },
    brandingTemplates: [brandingTemplateSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

counterpartySchema.index({ name: 'text', inn: 1 });
counterpartySchema.index({ isOurCompany: 1 });

export const CounterpartyModel = mongoose.model<ICounterpartyDocument>('Counterparty', counterpartySchema);
