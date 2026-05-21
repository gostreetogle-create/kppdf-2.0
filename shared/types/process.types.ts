/** Операция техпроцесса для связи PLM -> ERP */
export interface IProcessOp {
  id: string;
  name: string;                    // «Пескоструй», «Покраска»
  attrCode: string;                // Атрибут-триггер (например, 'surface_area')
  workTypeId: string;              // Ссылка на тип работ из справочника
  laborHours: number;              // Нормо-часы на единицу измерения
  equipment?: string;              // На каком станке делать
  materialConsumption?: {
    materialId: string;            // Ссылка на IMaterialItem
    rate: number;                  // Норма расхода на единицу (например, 0.2 кг на м2)
  };
}
