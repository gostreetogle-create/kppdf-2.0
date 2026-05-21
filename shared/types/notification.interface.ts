export type NotificationType = 'order_status' | 'task_assigned' | 'material_approved' | 'kp_status' | 'system';

export interface INotification {
  _id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Ссылка на связанную сущность */
  link?: string;
  isRead: boolean;
  createdAt?: string;
}

export interface ISseEvent {
  type: NotificationType;
  payload: INotification;
}
