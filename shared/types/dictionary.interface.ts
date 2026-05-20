export type DictionaryKind = 'category' | 'subcategory' | 'unit' | 'kind';

export interface IDictionaryItem {
  _id?: string;
  kind: DictionaryKind;
  name: string;
  sort?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
