import type { IProduct, IProductComponent, ProductKind } from '../../../shared/types/product.interface';

export type { ProductKind, IProductComponent };
export type { IProduct };

/** Фронтенд-модель товара — расширяет IProduct полем id для удобства */
export class Product implements IProduct {
  _id!: string;
  name!: string;
  code?: string;
  description!: string;
  price!: number;
  unit!: string;
  kind!: ProductKind;
  images!: string[];
  category?: string;
  subcategory?: string;
  specId?: string;
  isActive!: boolean;
  components?: IProductComponent[];
  createdAt?: string;
  updatedAt?: string;

  /** Алиас для _id — обратная совместимость */
  get id(): string {
    return this._id;
  }

  constructor(init: Partial<Product>) {
    Object.assign(this, init);
  }
}
