import mongoose, { Schema, Document } from 'mongoose';
import type { IRole } from '@shared/types/role.interface';

export interface IRoleDocument extends Omit<IRole, '_id'>, Document {}

const roleSchema = new Schema<IRoleDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const RoleModel = mongoose.model<IRoleDocument>('Role', roleSchema);
