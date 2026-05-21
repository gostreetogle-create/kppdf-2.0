import mongoose, { Schema, Document } from 'mongoose';
import { auditPlugin } from '../../shared/middleware/audit.plugin';
import type { IWorkTask } from '@shared/types/work-task.interface';

export interface IWorkTaskDocument extends Omit<IWorkTask, '_id'>, Document {}

const workTaskSchema = new Schema<IWorkTaskDocument>(
  {
    orderItemId: { type: String, required: true, index: true },
    workTypeId: { type: String },
    statusId: { type: String, required: true },
    executorId: { type: String },
    executorName: { type: String },
    plannedHours: { type: Number, default: 0 },
    actualHours: { type: Number },
    description: { type: String, default: '' },
    itemSnapshot: {
      name: { type: String },
      sku: { type: String },
    },
    startDate: { type: String },
    endDate: { type: String },
    completedAt: { type: String },
    createdBy: { type: String },
  },
  { timestamps: true },
);

workTaskSchema.index({ statusId: 1, orderItemId: 1 });
workTaskSchema.plugin(auditPlugin);

export const WorkTaskModel = mongoose.model<IWorkTaskDocument>('WorkTask', workTaskSchema);
