import type { ComparisonOperator } from './attribute.types';

/** Требование из CRM (КП) для Compliance Bridge */
export interface IRequirement {
  id: string;
  dealId: string;                  // Ссылка на сделку/КП
  attrCode: string;                // К какому атрибуту привязано (например, 'painting_color')
  expectedValue: string;           // Что хочет клиент
  operator: ComparisonOperator;    // Оператор сравнения
  unit?: string;                   // Единица измерения
  isCritical: boolean;             // Блокировать ли паспорт при несоответствии
  compliance?: 'match' | 'deviation' | 'pending';
  deviationReason?: string;        // Почему допустили отклонение
}
