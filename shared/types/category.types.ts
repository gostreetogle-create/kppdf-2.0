import type { IAttributeDef } from './attribute.types';
import type { IComponentNode } from './bom.types';

export interface ICategoryValidation {
  rule: string;                    // Например: 'height >= 2000'
  message: string;                 // «Высота должна быть не менее 2 метров»
  severity: 'error' | 'warning';
}

export interface IProductCategory {
  id: string;
  code: string;                    // 'bench', 'pavilion', 'stele'
  name: string;
  attributeGroups: {
    title: string;
    attributeDefs: IAttributeDef[];
  }[];
  bomTemplate?: IComponentNode[];  // Базовый состав для этой категории
  validations?: ICategoryValidation[];
}
