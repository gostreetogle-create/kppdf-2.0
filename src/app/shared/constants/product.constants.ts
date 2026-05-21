/** Маппинг статусов жизненного цикла изделия */
export const PRODUCT_STATUSES = {
  ORDERED: 'as_ordered',
  DESIGNED: 'as_designed',
  BUILT: 'as_built',
  MAINTAINED: 'as_maintained'
} as const;

/** Методы монтажа (из твоих примеров) */
export const INSTALLATION_METHODS = [
  { label: 'Прямое бетонирование', value: 'concrete_casting' },
  { label: 'Анкерное крепление', value: 'anchor_fixing' },
  { label: 'Закладные элементы', value: 'embedded_parts' },
  { label: 'Приставное', value: 'standalone' }
] as const;

/** Виды обработки поверхности */
export const SURFACE_TREATMENTS = [
  { label: 'Пескоструйная обработка', value: 'sandblasting' },
  { label: 'Шлифование древесины', value: 'wood_sanding' },
  { label: 'Промежуточное шлифование', value: 'inter_sanding' },
  { label: 'Цинкование', value: 'galvanizing' }
] as const;

/** Типы защитных покрытий */
export const COATING_TYPES = [
  { label: 'Порошковое окрашивание', value: 'powder_coating' },
  { label: 'Итальянское масло Renner', value: 'renner_oil' },
  { label: 'Атмосферостойкая эмаль', value: 'weatherproof_enamel' },
  { label: 'Резиновое покрытие (крошка)', value: 'rubber_crumb' }
] as const;

/** Сорта древесины */
export const WOOD_GRADES = [
  { label: 'Экстра', value: 'extra' },
  { label: 'Сорт А+', value: 'grade_a_plus' },
  { label: 'Сорт А', value: 'grade_a' },
  { label: 'Сорт Б', value: 'grade_b' }
] as const;
