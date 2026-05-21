import { Schema, model } from 'mongoose';
import type { AttrValueType, ComparisonOperator } from '@shared/types/attribute.types';

const AttributeDefSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  valueType: {
    type: String,
    enum: ['number', 'dimension', 'string', 'enum', 'boolean', 'range'] as AttrValueType[],
    required: true,
  },
  unit: String,
  operator: {
    type: String,
    enum: ['≥', '≤', '=', '±'] as ComparisonOperator[],
  },
  allowedValues: [String],
  isRequired: { type: Boolean, default: false },
  lifecycled: { type: Boolean, default: true },
});

export const ProductCategorySchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    attributeGroups: [
      {
        title: String,
        attributeDefs: [AttributeDefSchema], // Вложенные определения
      },
    ],
    bomTemplate: [Schema.Types.Mixed], // Опционально: шаблон дерева состава
  },
  { timestamps: true },
);

export const ProductCategoryModel = model('ProductCategory', ProductCategorySchema);
