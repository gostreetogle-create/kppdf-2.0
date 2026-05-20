import { Pipe, PipeTransform } from '@angular/core';
import type { KpStatus, KpType } from '../types/kp.interface';

const STATUS_LABELS: Record<KpStatus, string> = { draft: 'Черновик', sent: 'Отправлено', accepted: 'Принято', rejected: 'Отклонено' };
const TYPE_LABELS: Record<KpType, string> = { standard: 'Стандартное', response: 'Ответ на запрос', special: 'Спецпредложение', tender: 'Тендер', service: 'Услуга' };

@Pipe({ name: 'kpStatusLabel', standalone: true })
export class KpStatusLabelPipe implements PipeTransform {
  transform(value: KpStatus | null | undefined): string { return value ? STATUS_LABELS[value] ?? value : ''; }
}

@Pipe({ name: 'kpTypeLabel', standalone: true })
export class KpTypeLabelPipe implements PipeTransform {
  transform(value: KpType | null | undefined): string { return value ? TYPE_LABELS[value] ?? value : ''; }
}

export const KP_PIPES = [KpStatusLabelPipe, KpTypeLabelPipe] as const;
