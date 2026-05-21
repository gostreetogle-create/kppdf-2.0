import type { IProduct, ProductKind } from '../../../shared/types/product.interface';
import type { IProductCategory } from '../../../shared/types/category.types';
import type { IAttributeValue, LifecycleStatus } from '../../../shared/types/attribute.types';
import type { IComponentNode } from '../../../shared/types/bom.types';

export type { ProductKind };
export type { IProduct };

/** Фронтенд-модель товара — PLM-ориентированная */
export class Product implements IProduct {
  id!: string;
  name!: string;
  sku!: string;
  categoryId!: string;
  specId!: string;
  kind!: ProductKind;
  status!: string; // 'active' | 'archived' | 'draft'

  /** Виртуальные поля (подгружаются с бэкенда) */
  category?: IProductCategory;
  specification?: {
    version: string;
    status: LifecycleStatus;
    attributeValues: IAttributeValue[];
    bom?: IComponentNode;
  };

  constructor(init: Partial<Product>) {
    Object.assign(this, init);
  }
}
