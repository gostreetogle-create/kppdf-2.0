/** Тип работы — классификатор для позиции заказа */
export interface IWorkType {
  _id?: string;
  name: string;
  label: string;
  section: 'materials' | 'work' | 'task' | 'drawing';
  icon?: string;
  sortOrder: number;
  color?: string;
}
