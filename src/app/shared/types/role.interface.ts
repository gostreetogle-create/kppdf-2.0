/** Разрешение — флаг «можно делать X» */
export interface IPermission {
  code: string;       // 'order.edit', 'order.delete', 'product.create'
  label: string;      // 'Редактирование заказов'
  group: string;      // 'order', 'product', 'settings'
}

/** Роль — набор разрешений */
export interface IRole {
  _id?: string;
  name: string;           // 'director', 'manager', 'worker', 'viewer'
  label: string;          // 'Директор', 'Менеджер'
  description?: string;
  permissions: string[];  // Массив кодов разрешений: ['order.edit', 'product.view']
  isSystem: boolean;      // Системную роль нельзя удалить
  sortOrder: number;
}

/** Список всех доступных разрешений (определён в коде, расширяется с каждой фичей) */
export const ALL_PERMISSIONS: IPermission[] = [
  // Order
  { code: 'order.view',    label: 'Просмотр заказов',         group: 'order' },
  { code: 'order.create',  label: 'Создание заказов',         group: 'order' },
  { code: 'order.edit',    label: 'Редактирование заказов',   group: 'order' },
  { code: 'order.delete',  label: 'Удаление заказов',         group: 'order' },
  { code: 'order.status',  label: 'Изменение статуса заказа', group: 'order' },

  // Product
  { code: 'product.view',   label: 'Просмотр товаров',        group: 'product' },
  { code: 'product.create', label: 'Создание товаров',        group: 'product' },
  { code: 'product.edit',   label: 'Редактирование товаров',  group: 'product' },
  { code: 'product.delete', label: 'Удаление товаров',        group: 'product' },

  // Counterparty
  { code: 'counterparty.view',   label: 'Просмотр контрагентов',        group: 'counterparty' },
  { code: 'counterparty.create', label: 'Создание контрагентов',        group: 'counterparty' },
  { code: 'counterparty.edit',   label: 'Редактирование контрагентов',  group: 'counterparty' },
  { code: 'counterparty.delete', label: 'Удаление контрагентов',        group: 'counterparty' },

  // KP
  { code: 'kp.view',    label: 'Просмотр КП',        group: 'kp' },
  { code: 'kp.create',  label: 'Создание КП',        group: 'kp' },
  { code: 'kp.edit',    label: 'Редактирование КП',  group: 'kp' },
  { code: 'kp.delete',  label: 'Удаление КП',        group: 'kp' },
  { code: 'kp.accept',  label: 'Утверждение КП',     group: 'kp' },

  // WorkTask
  { code: 'task.view',       label: 'Просмотр задач',                  group: 'task' },
  { code: 'task.create',     label: 'Создание задач',                  group: 'task' },
  { code: 'task.edit',       label: 'Редактирование задач',            group: 'task' },
  { code: 'task.complete',   label: 'Отметка выполнения задачи',       group: 'task' },

  // Materials
  { code: 'material.view',   label: 'Просмотр материалов',   group: 'material' },
  { code: 'material.request',label: 'Создание заявок',       group: 'material' },
  { code: 'material.approve',label: 'Утверждение заявок',    group: 'material' },

  // Settings
  { code: 'settings.view',   label: 'Просмотр настроек',       group: 'settings' },
  { code: 'settings.edit',   label: 'Редактирование настроек', group: 'settings' },
  { code: 'statuses.edit',   label: 'Управление статусами',    group: 'settings' },
  { code: 'roles.edit',      label: 'Управление ролями',       group: 'settings' },
];
