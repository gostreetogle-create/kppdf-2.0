import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser, UserRole } from '@shared/types/user.interface';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  passwordHash: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'viewer'], default: 'manager' },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: { type: String },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc: any, ret: any) {
    const { passwordHash, __v, _id, ...rest } = ret;
    return { ...rest, _id, id: _id?.toString() };
  },
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
