import mongoose, { Schema, Document } from 'mongoose';
import type { ISetting } from '@shared/types/settings.interface';

export interface ISettingDocument extends Omit<ISetting, '_id'>, Document {}

const settingSchema = new Schema<ISettingDocument>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    label: { type: String, required: true },
    description: { type: String },
    group: { type: String, default: 'general' },
  },
  { timestamps: true },
);

export const SettingModel = mongoose.model<ISettingDocument>('Setting', settingSchema);
