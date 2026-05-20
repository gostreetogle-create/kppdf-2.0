import { ProductModel, IProductDocument } from './product.model';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { IProduct, ProductKind } from '@shared/types/product.interface';

function toJSON(doc: IProductDocument): IProduct {
  return doc.toJSON() as unknown as IProduct;
}

export async function getAll(filters?: {
  kind?: ProductKind;
  isActive?: boolean;
  search?: string;
}): Promise<IProduct[]> {
  const query: any = {};

  if (filters?.kind) query.kind = filters.kind;
  if (filters?.isActive !== undefined) query.isActive = filters.isActive;
  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { code: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const docs = await ProductModel.find(query).sort({ name: 1 });
  return docs.map(toJSON);
}

export async function getById(id: string): Promise<IProduct> {
  const doc = await ProductModel.findById(id);
  if (!doc) throw new NotFoundError('Product', id);
  return toJSON(doc);
}

export async function create(data: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
  if (!data.name || data.price === undefined || !data.unit || !data.kind) {
    throw new ValidationError('name, price, unit, kind are required');
  }
  const doc = await ProductModel.create(data);
  return toJSON(doc);
}

export async function update(id: string, data: Partial<Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>>): Promise<IProduct> {
  const doc = await ProductModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('Product', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await ProductModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Product', id);
}
