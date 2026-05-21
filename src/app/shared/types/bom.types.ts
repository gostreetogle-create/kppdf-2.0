export type BOMNodeType = 'assembly' | 'part' | 'purchased' | 'process';
export type BOMStatus = 'design' | 'approved' | 'in_production' | 'produced' | 'shipped';

/** Узел состава изделия (Цифровой состав) */
export interface IComponentNode {
  id: string;                      // MongoDB ObjectId
  parentId: string | null;         // Ссылка на родителя (null для корня)
  type: BOMNodeType;

  // PLM (Инженерия)
  marking: string;                 // П_8_1
  name: string;
  material?: string;               // Текстовое описание
  materialId?: string;             // Ссылка на справочник ТМЦ
  dimensions?: string;             // 80х80х3
  weight?: number;
  drawingRef?: string;             // URL или ID файла чертежа

  // ERP (Производство)
  qty: number;
  unit: string;                    // шт, м.п., кг
  costPerUnit?: number;            // Себестоимость
  leadTimeDays?: number;           // Срок
  warehouseCode?: string;          // Интеграция со складом

  // CRM
  requirementId?: string;          // Ссылка на пункт в КП

  status: BOMStatus;
  children?: IComponentNode[];     // Для фронтенда (Tree Structure)
}
