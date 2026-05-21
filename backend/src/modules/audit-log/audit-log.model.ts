import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED';

export interface IAuditLog {
  _id?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId?: string;
  username?: string;
  /** Только изменившиеся поля: { field: { old, new } } */
  diff: Record<string, { old: unknown; new: unknown }>;
  timestamp: Date;
}

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const auditLogSchema = new Schema<IAuditLogDocument>({
  entityType: { type: String, required: true, index: true },
  entityId: { type: String, required: true, index: true },
  action: {
    type: String,
    required: true,
    enum: ['CREATED', 'UPDATED', 'DELETED'],
  },
  userId: { type: String },
  username: { type: String },
  diff: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

// Составной индекс для быстрого поиска по сущности
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

// TTL — автоудаление записей старше 365 дней
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 },
);

export const AuditLogModel = mongoose.model<IAuditLogDocument>(
  'AuditLog',
  auditLogSchema,
);
