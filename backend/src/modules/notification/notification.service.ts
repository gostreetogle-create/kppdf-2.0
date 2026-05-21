import { Response } from 'express';
import { NotificationModel, INotificationDocument } from './notification.model';
import type { INotification } from '@shared/types/notification.interface';

/** SSE-клиенты: userId → Response[] */
const sseClients = new Map<string, Response[]>();

export function addSseClient(userId: string, res: Response): void {
  const clients = sseClients.get(userId) || [];
  clients.push(res);
  sseClients.set(userId, clients);
  res.on('close', () => removeSseClient(userId, res));
}

function removeSseClient(userId: string, res: Response): void {
  const clients = (sseClients.get(userId) || []).filter((c) => c !== res);
  if (clients.length === 0) {
    sseClients.delete(userId);
  } else {
    sseClients.set(userId, clients);
  }
}

/** Отправить уведомление конкретному пользователю через SSE */
async function sendSse(userId: string, notification: INotificationDocument): Promise<void> {
  const clients = sseClients.get(userId);
  if (!clients || clients.length === 0) return;
  const data = JSON.stringify({ type: notification.type, payload: notification });
  for (const res of clients) {
    res.write(`data: ${data}\n\n`);
  }
}

/** Создать уведомление + отправить SSE */
export async function notify(
  userId: string,
  type: INotification['type'],
  title: string,
  message: string,
  link?: string,
): Promise<INotificationDocument> {
  const notification = await NotificationModel.create({ userId, type, title, message, link, isRead: false });
  await sendSse(userId, notification);
  return notification;
}

export async function getUnread(userId: string): Promise<INotificationDocument[]> {
  return NotificationModel.find({ userId, isRead: false }).sort({ createdAt: -1 }).limit(50);
}

export async function getAll(userId: string): Promise<INotificationDocument[]> {
  return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(100);
}

export async function markRead(id: string): Promise<void> {
  await NotificationModel.findByIdAndUpdate(id, { isRead: true });
}

export async function markAllRead(userId: string): Promise<void> {
  await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
}
