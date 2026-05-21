/** Типы данных для универсального приложения */
export type AttrValueType = 'number' | 'dimension' | 'string' | 'enum' | 'boolean' | 'range';

/** Жизненный цикл данных изделия */
export type LifecycleStatus = 'as_ordered' | 'as_designed' | 'as_built' | 'as_maintained';

/** Операторы сравнения для ТЗ и паспортов */
export type ComparisonOperator = '≥' | '≤' | '=' | '±';

/** Определение атрибута (Шаблон в Категории) */
export interface IAttributeDef {
  id: string;                      // MongoDB ObjectId as string
  code: string;                    // Например: 'frame_material'
  name: string;                    // Например: 'Материал каркаса'
  valueType: AttrValueType;
  unit?: string;                   // мм, кг, В, А, м2
  operator?: ComparisonOperator;
  allowedValues?: string[];        // Для типа enum (RAL, Сорта дерева)
  isRequired: boolean;
  lifecycled: boolean;             // Нужно ли отслеживать изменения Ordered -> Built
}

/** Значение атрибута (Экземпляр в Изделии) */
export interface IAttributeValue {
  attrDefId: string;               // Ссылка на IAttributeDef

  // Реализация концепции Digital Twin (разные состояния данных)
  orderedValue?: string;           // Требование CRM
  designValue: string;             // Решение инженера (PLM)
  builtValue?: string;             // Факт производства (ERP)
  maintainedValue?: string;        // Для паспорта

  compliance?: 'match' | 'deviation' | 'pending';
}

export interface IAttributeGroup {
  id: string;
  title: string;                   // 'Геометрия', 'Электрика', 'Покрытие'
  attributes: IAttributeValue[];
}
