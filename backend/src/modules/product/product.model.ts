import mongoose, { Schema, Document } from 'mongoose';
import type { IProduct, ProductKind } from '@shared/types/product.interface';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    kind: {
      type: String,
      enum: ['ITEM', 'SERVICE', 'WORK'],
      required: true,
    },
    images: [{ type: String }],
    category: { type: String, trim: true },
    subcategory: { type: String, trim: true },
    specId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', code: 'text' });
productSchema.index({ kind: 1, isActive: 1 });

export const ProductModel = mongoose.model<IProductDocument>('Product', productSchema);
