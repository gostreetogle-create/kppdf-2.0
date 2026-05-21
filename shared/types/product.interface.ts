export type ProductKind = 'ITEM' | 'SERVICE' | 'WORK' | 'COMPLEX';

/** Снимок товара внутри комплекса */
export interface IProductComponent {
  productId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

export interface IProduct {
  _id: string;
  name: string;
  code?: string;
  description: string;
  price: number;
  unit: string;
  kind: ProductKind;
  images: string[];
  category?: string;
  subcategory?: string;
  specId?: string;
  isActive: boolean;
  /** Только для kind = COMPLEX — состав комплекса */
  components?: IProductComponent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductSpecGroupParam {
  name: string;
  value: string;
}

export interface IProductSpecGroup {
  title: string;
  params: IProductSpecGroupParam[];
}

export interface IProductSpecDrawing {
  viewFront?: string;
  viewSide?: string;
  viewTop?: string;
  view3D?: string;
}

export interface IProductSpec {
  _id: string;
  productId: string;
  groups: IProductSpecGroup[];
  drawings: IProductSpecDrawing;
  createdAt?: string;
  updatedAt?: string;
}
