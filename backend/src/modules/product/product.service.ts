import { ProductModel, IProductDocument } from './product.model';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { IProduct, ProductKind } from '@shared/types/product.interface';

function toJSON(doc: IProductDocument): IProduct {
  return { id: doc._id.toString(), ...doc.toJSON() } as unknown as IProduct;
}

export async function getAll(filters?: {
  kind?: ProductKind;
  status?: string;
  search?: string;
}): Promise<IProduct[]> {
  const query: any = {};

  if (filters?.kind) query.kind = filters.kind;
  if (filters?.status) query.status = filters.status;
  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { sku: { $regex: filters.search, $options: 'i' } },
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

export async function create(data: Omit<IProduct, 'id' | 'category' | 'specification'>): Promise<IProduct> {
  if (!data.name || !data.sku || !data.categoryId || !data.kind) {
    throw new ValidationError('name, sku, categoryId, kind are required');
  }
  const doc = await ProductModel.create(data);
  return toJSON(doc);
}

export async function update(id: string, data: Partial<Omit<IProduct, 'id' | 'category' | 'specification'>>): Promise<IProduct> {
  const doc = await ProductModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('Product', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await ProductModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Product', id);
}
