import mongoose, { Schema, Document } from 'mongoose';
import type { IWorkType } from '@shared/types/work-type.interface';

export interface IWorkTypeDocument extends Omit<IWorkType, '_id'>, Document {}

const workTypeSchema = new Schema<IWorkTypeDocument>(
  {
    name: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    section: { type: String, enum: ['materials', 'work', 'task', 'drawing'], required: true },
    icon: { type: String },
    sortOrder: { type: Number, default: 0 },
    color: { type: String },
  },
  { timestamps: true },
);

export const WorkTypeModel = mongoose.model<IWorkTypeDocument>('WorkType', workTypeSchema);
