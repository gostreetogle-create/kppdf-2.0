import mongoose, { Schema, Document } from 'mongoose';
import type { IEntityStatus } from '@shared/types/entity-status.interface';

export interface IEntityStatusDocument extends Omit<IEntityStatus, '_id'>, Document {}

const entityStatusSchema = new Schema<IEntityStatusDocument>(
  {
    entityType: { type: String, required: true },
    statusId: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String, default: '#607D8B' },
    icon: { type: String, default: 'pi pi-circle' },
    sortOrder: { type: Number, default: 0 },
    isInitial: { type: Boolean, default: false },
    isFinal: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Уникальный индекс: один statusId на entityType
entityStatusSchema.index({ entityType: 1, statusId: 1 }, { unique: true });

// Только один isInitial на entityType
entityStatusSchema.index(
  { entityType: 1, isInitial: 1 },
  { unique: true, partialFilterExpression: { isInitial: true } },
);

export const EntityStatusModel = mongoose.model<IEntityStatusDocument>(
  'EntityStatus',
  entityStatusSchema,
);
