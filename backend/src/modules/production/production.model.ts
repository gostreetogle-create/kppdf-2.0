import { Schema, model } from 'mongoose';

/** План производства = развёрнутый BOM + потребности */
export interface IProductionPlan {
  _id?: string;
  orderId: string;
  specId: string;
  status: 'draft' | 'calculated' | 'approved' | 'in_progress' | 'completed';
  totalCost: number;
  totalLaborHours: number;
  leadTimeDays: number;
  materialRequirements: {
    materialId?: string;
    materialName: string;
    requiredQty: number;
    unit: string;
    costPerUnit?: number;
    source: 'purchased' | 'stock' | 'produced';
  }[];
  workItems: {
    workTypeId: string;
    name: string;
    assignedTo?: string;
    plannedHours: number;
    dependsOn?: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductionPlanSchema = new Schema<IProductionPlan>(
  {
    orderId: { type: String, required: true, index: true },
    specId: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'calculated', 'approved', 'in_progress', 'completed'],
      default: 'draft',
    },
    totalCost: { type: Number, default: 0 },
    totalLaborHours: { type: Number, default: 0 },
    leadTimeDays: { type: Number, default: 0 },
    materialRequirements: [{
      materialId: String,
      materialName: { type: String, required: true },
      requiredQty: { type: Number, required: true },
      unit: { type: String, required: true },
      costPerUnit: Number,
      source: { type: String, enum: ['purchased', 'stock', 'produced'], default: 'purchased' },
    }],
    workItems: [{
      workTypeId: { type: String, required: true },
      name: { type: String, required: true },
      assignedTo: String,
      plannedHours: { type: Number, default: 0 },
      dependsOn: String,
    }],
  },
  { timestamps: true },
);

export const ProductionPlanModel = model<IProductionPlan>('ProductionPlan', ProductionPlanSchema);
