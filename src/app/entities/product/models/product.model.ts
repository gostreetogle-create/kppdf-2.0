export type ProductKind = 'ITEM' | 'SERVICE' | 'WORK';

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  kind: ProductKind;
}