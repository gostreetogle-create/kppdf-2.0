/** Типы данных для универсального приложения */
export type AttrValueType = 'number' | 'dimension' | 'string' | 'enum' | 'boolean' | 'range';

/** Жизненный цикл данных изделия */
export type LifecycleStatus = 'as_ordered' | 'as_designed' | 'as_built' | 'as_maintained';

/** Операторы сравнения для ТЗ и паспортов */
export type ComparisonOperator = '≥' | '≤' | '=' | '≠' | '>' | '<' | '±' | 'range';

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
  /** Код атрибута из IAttributeDef.code (human-readable, устойчивый к переименованиям) */
  attrCode: string;
  /** Имя атрибута на момент создания (снэпшот для отчётов) */
  attrName: string;
  /** Тип значения (для парсинга dimension) */
  valueType: AttrValueType;
  /** Был ли атрибут обязательным на момент создания */
  isRequired: boolean;
  /** Если атрибут был удалён из категории */
  orphan?: boolean;

  // Реализация концепции Digital Twin (разные состояния данных)
  orderedValue?: string | number | boolean | null;   // Требование CRM
  designValue?: string | number | boolean | null;     // Решение инженера (PLM)
  builtValue?: string | number | boolean | null;      // Факт производства (ERP)
  maintainedValue?: string | number | boolean | null; // Для паспорта

  /**
   * Compliance flag:
   *   null  — проверка не выполнялась (значения не заполнены)
   *   true  — значения совпадают
   *   false — deviation (несоответствие)
   */
  compliant?: boolean | null;
}

export interface IAttributeGroup {
  id: string;
  title: string;                   // 'Геометрия', 'Электрика', 'Покрытие'
  attributes: IAttributeValue[];
}
