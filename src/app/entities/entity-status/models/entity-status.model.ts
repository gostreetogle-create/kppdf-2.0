import type { IEntityStatus } from '../../../shared/types/entity-status.interface';

export type { IEntityStatus };

/** Типы сущностей, для которых настраиваются статусы */
export const ENTITY_STATUS_TYPES: { value: EntityType; label: string }[] = [
  { value: 'ORDER', label: 'Заказы' },
  { value: 'ORDER_ITEM', label: 'Позиции заказа' },
  { value: 'WORK_TASK', label: 'Производственные задания' },
  { value: 'MATERIAL_REQUEST', label: 'Заявки на материалы' },
  { value: 'KP', label: 'Коммерческие предложения' },
  { value: 'PRODUCT', label: 'Товары' },
];

export type EntityType = 'ORDER' | 'ORDER_ITEM' | 'WORK_TASK' | 'MATERIAL_REQUEST' | 'KP' | 'PRODUCT';
