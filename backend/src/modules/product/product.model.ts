import mongoose, { Schema, Document } from 'mongoose';
import type { IProduct, ProductKind } from '@shared/types/product.interface';
import type { LifecycleStatus } from '@shared/types/attribute.types';

export interface IProductDocument extends Omit<IProduct, 'id' | 'category' | 'specification'>, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    categoryId: { type: String, required: true },
    specId: { type: String, required: true },
    kind: {
      type: String,
      enum: ['ITEM', 'SERVICE', 'WORK', 'COMPLEX'],
      required: true,
    },
    status: { type: String, default: 'draft' },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', sku: 'text' });
productSchema.index({ kind: 1, status: 1 });
productSchema.index({ categoryId: 1 });

export const ProductModel = mongoose.model<IProductDocument>('Product', productSchema);
