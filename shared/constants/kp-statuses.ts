import type { KpStatus, KpType } from '../types/kp.interface';

export const KP_STATUS_TRANSITIONS: Record<KpStatus, KpStatus[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected'],
  accepted: [],
  rejected: ['draft'],
};

export const KP_STATUS_LABELS: Record<KpStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  accepted: 'Принят',
  rejected: 'Отклонён',
};

export const KP_TYPE_LABELS: Record<KpType, string> = {
  standard: 'КП',
  response: 'Ответ на письмо',
  special: 'Спецпредложение',
  tender: 'Для тендера',
  service: 'На услуги',
};

export function getNextStatuses(current: KpStatus): KpStatus[] {
  return KP_STATUS_TRANSITIONS[current] ?? [];
}
