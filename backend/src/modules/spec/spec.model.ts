import { ProductCategoryModel } from '../../../schemas/product-category.schema';
import { ProductSpecModel } from '../../../schemas/product-spec.schema';
import type { IProductCategory } from '@shared/types/category.types';
import type { IRequirement } from '@shared/types/requirement.types';
import type { LifecycleStatus } from '@shared/types/attribute.types';

export { ProductCategoryModel, ProductSpecModel };

/** Категория с полным шаблоном атрибутов */
export async function getCategoryById(id: string): Promise<IProductCategory | null> {
  const doc = await ProductCategoryModel.findById(id).lean();
  return doc as unknown as IProductCategory | null;
}

export async function getCategoryByCode(code: string): Promise<IProductCategory | null> {
  const doc = await ProductCategoryModel.findOne({ code }).lean();
  return doc as unknown as IProductCategory | null;
}

export async function listCategories(): Promise<IProductCategory[]> {
  const docs = await ProductCategoryModel.find().lean();
  return docs as unknown as IProductCategory[];
}

/** Создать ProductSpec (Digital Twin) для товара */
export async function createSpec(
  productId: string,
  categoryId: string,
  version?: string,
): Promise<string> {
  const spec = await ProductSpecModel.create({
    productId,
    categoryId,
    version: version || '1.0',
    status: 'as_ordered' as LifecycleStatus,
    attributeValues: [],
  });
  return spec._id.toString();
}

/** Обновить статус жизненного цикла спецификации */
export async function updateSpecStatus(
  specId: string,
  status: LifecycleStatus,
): Promise<void> {
  await ProductSpecModel.findByIdAndUpdate(specId, { status });
}
