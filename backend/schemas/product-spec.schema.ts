import { Schema, model } from 'mongoose';
import type { LifecycleStatus } from '@shared/types/attribute.types';

/**
 * Схема значения атрибута в Digital Twin.
 *
 * Соответствие бизнес-правилам:
 *   PLM-3: attrCode — строковая ссылка (не ObjectId) для устойчивости к переименованиям
 *   PLM-4: 4 независимых состояния
 *   PLM-6: compliance — Boolean | null (null = не проверялось, true = ок, false = deviation)
 */
const AttributeValueSchema = new Schema({
  /** Код атрибута из IAttributeDef.code (human-readable, устойчивый к переименованиям) */
  attrCode: { type: String, required: true, index: true },

  /** Имя атрибута на момент создания (снэпшот для отчётов) */
  attrName: { type: String, required: true },

  /** Тип значения (для парсинга dimension и корректного сравнения) */
  valueType: {
    type: String,
    enum: ['number', 'dimension', 'string', 'enum', 'boolean', 'range'],
    required: true,
  },

  /** Был ли атрибут обязательным на момент создания */
  isRequired: { type: Boolean, default: false },

  /** 4 состояния жизненного цикла (Digital Twin) */
  orderedValue: { type: Schema.Types.Mixed, default: null },
  designValue: { type: Schema.Types.Mixed, default: null },
  builtValue: { type: Schema.Types.Mixed, default: null },
  maintainedValue: { type: Schema.Types.Mixed, default: null },

  /**
   * Compliance flag:
   *   null  — проверка не выполнялась (значения не заполнены)
   *   true  — значения совпадают
   *   false — deviation (несоответствие)
   */
  compliant: { type: Boolean, default: null },

  /** Если атрибут был удалён из категории — помечаем orphan */
  orphan: { type: Boolean, default: false },
});

export const ProductSpecSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory',
      required: true,
    },
    /**
     * Версия категории на момент создания/последней ресинхронизации.
     * Используется для обнаружения рассинхронизации (VERSION-2).
     */
    categoryVersion: { type: Number, default: 1 },

    /** Версия спецификации (инкрементируется при каждом advance) */
    version: { type: Number, default: 1 },

    status: {
      type: String,
      enum: ['as_ordered', 'as_designed', 'as_built', 'as_maintained'] as LifecycleStatus[],
      default: 'as_ordered',
      required: true,
    },

    /** EAV-значения атрибутов */
    attributeValues: [AttributeValueSchema],

    /** Корневой узел BOM (дерево, вложенное для производительности) */
    bom: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

ProductSpecSchema.index({ productId: 1, version: -1 });

export const ProductSpecModel = model('ProductSpec', ProductSpecSchema);
