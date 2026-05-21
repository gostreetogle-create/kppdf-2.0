/** Конфигурация статусов для бизнес-сущностей */
export interface IEntityStatus {
  _id?: string;
  /** Тип сущности: ORDER, ORDER_ITEM, WORK_TASK, MATERIAL_REQUEST и т.д. */
  entityType: string;
  /** Уникальный строковый код статуса: 'in_progress', 'completed' */
  statusId: string;
  /** Отображаемое название */
  label: string;
  /** Hex-цвет: '#3b82f6' */
  color: string;
  /** Иконка PrimeIcon: 'pi pi-clock' */
  icon: string;
  /** Порядок сортировки */
  sortOrder: number;
  /** Начальный статус (при создании сущности) */
  isInitial: boolean;
  /** Конечный статус (завершён) */
  isFinal: boolean;
}
