import type { IProductCategory } from './category.types';
import type { IAttributeValue, LifecycleStatus } from './attribute.types';
import type { IComponentNode } from './bom.types';

export type ProductKind = 'ITEM' | 'SERVICE' | 'WORK' | 'COMPLEX';

/** PLM-ориентированная модель товара */
export interface IProduct {
  id: string;
  name: string;                    // Маркетинговое имя
  sku: string;                     // Артикул

  // Связи PLM
  categoryId: string;              // Ссылка на IProductCategory (шаблон)
  specId: string;                  // Ссылка на активную IProductSpec

  // Краткие метаданные для списков
  kind: ProductKind;
  status: string;                  // 'active' | 'archived' | 'draft'

  // Виртуальные поля (подгружаются на фронте)
  category?: IProductCategory;
  specification?: {
    version: string;
    status: LifecycleStatus;
    attributeValues: IAttributeValue[];
    bom?: IComponentNode;
  };
}
