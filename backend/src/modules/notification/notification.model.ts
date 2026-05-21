import mongoose, { Schema, Document } from 'mongoose';
import type { INotification, NotificationType } from '@shared/types/notification.interface';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['order_status', 'task_assigned', 'material_approved', 'kp_status', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', notificationSchema);
