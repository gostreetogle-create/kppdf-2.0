export type MaterialCategory = 'metal' | 'wood' | 'plastic' | 'paint' | 'fastener' | 'other';

export interface IMaterialItem {
  id: string;
  code: string;                    // Артикул 1С
  name: string;                    // Сталь листовая х/к 2 мм
  category: MaterialCategory;
  unit: string;                    // кг, м2, м.п.
  baseCost?: number;
  warehouseCode?: string;
}
