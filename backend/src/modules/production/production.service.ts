import { ProductionPlanModel, type IProductionPlan } from './production.model';
import { ProductSpecModel } from '../../../schemas/product-spec.schema';
import { WorkTaskModel } from '../work-task/work-task.model';
import { MaterialRequestModel } from '../material-request/material-request.model';
import { getInitial } from '../entity-status/entity-status.service';
import type { IComponentNode } from '@shared/types/bom.types';
import type { IMaterialItem } from '@shared/types/material.types';
import { DimensionParser, type IParsedDimension } from '../../../shared/logic/dimension-parser';

export class ProductionService {
  /** Получить план по заказу */
  async getPlanByOrder(orderId: string) {
    return ProductionPlanModel.findOne({ orderId }).lean();
  }

  /** Создать/пересчитать план на основе BOM */
  async calculatePlan(orderId: string, specId: string): Promise<string> {
    const spec = await ProductSpecModel.findById(specId).lean();
    if (!spec || !spec.bom) throw new Error('Spec or BOM not found');

    const bom = spec.bom as unknown as IComponentNode;
    const materials = this.flattenBomMaterials(bom);
    const workItems = this.flattenWorkItems(bom);

    const totalCost = materials.reduce((s, m) => s + (m.costPerUnit ?? 0) * m.requiredQty, 0);
    const totalLaborHours = workItems.reduce((s, w) => s + w.plannedHours, 0);
    const leadTimeDays = this.calculateLeadTime(workItems);

    const plan = await ProductionPlanModel.findOneAndUpdate(
      { orderId },
      {
        orderId,
        specId,
        status: 'calculated',
        totalCost,
        totalLaborHours,
        leadTimeDays,
        materialRequirements: materials,
        workItems,
      },
      { upsert: true, new: true },
    );

    return plan._id.toString();
  }

  // ==================== ERP Trigger Methods (called by SpecService.advanceLifecycle) ====================

  /**
   * ERP-4: Автоматическое создание WorkTask для processOps в BOM.
   * Вызывается при advance → as_designed.
   *
   * @returns Массив ID созданных WorkTask
   */
  async createWorkTasksFromBom(
    specId: string,
    productId: string,
    bom: IComponentNode,
  ): Promise<string[]> {
    // Ищем начальный статус для WorkTask
    const initialStatus = await getInitial('work-task');
    const statusId = initialStatus?.statusId ?? 'pending';
    const createdIds: string[] = [];
    const processNodes = this.collectProcessNodes(bom);

    for (const node of processNodes) {
      const task = await WorkTaskModel.create({
        orderItemId: productId, // Используем productId как контекст
        workTypeId: node.marking || undefined,
        statusId,
        plannedHours: node.leadTimeDays ?? 0,
        description: `Техпроцесс: ${node.name}`,
        itemSnapshot: {
          name: node.name,
          sku: node.marking || undefined,
        },
      });
      createdIds.push(task._id.toString());
    }

    return createdIds;
  }

  /**
   * ERP-5: Автоматическое создание MaterialRequest для purchased-узлов BOM.
   * Количество = рекурсивное умножение qty (цепочка parent qty).
   * Если у purchased-узла есть dimension — конвертируем в объём (TYPE-3).
   *
   * @returns Массив ID созданных MaterialRequest
   */
  async createMaterialRequestsFromBom(
    specId: string,
    bom: IComponentNode,
  ): Promise<string[]> {
    const initialStatus = await getInitial('material-request');
    const statusId = initialStatus?.statusId ?? 'requested';
    const createdIds: string[] = [];

    // Собираем все purchased-узлы с учётом множителя parent qty
    const purchasedNodes = this.collectPurchasedNodes(bom, 1);

    for (const item of purchasedNodes) {
      let quantity = item.totalQty;
      let unit = item.node.unit || 'шт';

      // TYPE-3: Если есть dimension — конвертируем в объём
      if (item.node.dimensions) {
        try {
          const parsed = DimensionParser.parse(item.node.dimensions);
          // Для purchased материалов вес/объём важнее штук
          quantity = parsed.computed.volumeMm3 * item.totalQty / 1000; // в см³
          unit = 'см³';
        } catch {
          // Если не удалось распарсить — оставляем как есть
        }
      }

      const mr = await MaterialRequestModel.create({
        orderItemId: specId,
        orderId: specId,
        productName: item.node.material || item.node.name,
        sku: item.node.marking || undefined,
        unit,
        quantity: Math.round(quantity * 100) / 100,
        statusId,
        neededAt: undefined,
        comment: `Авто: из BOM спецификации ${specId}`,
      });
      createdIds.push(mr._id.toString());
    }

    return createdIds;
  }

  // ==================== BOM traversal helpers ====================

  private collectProcessNodes(node: IComponentNode): IComponentNode[] {
    const result: IComponentNode[] = [];
    if (node.type === 'process') {
      result.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        result.push(...this.collectProcessNodes(child));
      }
    }
    return result;
  }

  /**
   * Собирает все purchased-узлы с рекурсивным умножением количества.
   * Если purchased находится внутри assembly, его qty умножается на qty всех родителей.
   */
  private collectPurchasedNodes(
    node: IComponentNode,
    parentMultiplier: number,
  ): { node: IComponentNode; totalQty: number }[] {
    const result: { node: IComponentNode; totalQty: number }[] = [];
    const currentMultiplier = parentMultiplier * (node.qty || 1);

    if (node.type === 'purchased') {
      result.push({ node, totalQty: currentMultiplier });
    }

    if (node.children) {
      for (const child of node.children) {
        result.push(...this.collectPurchasedNodes(child, currentMultiplier));
      }
    }

    return result;
  }

  // ==================== BOM flattening (existing) ====================

  private flattenBomMaterials(node: IComponentNode): IProductionPlan['materialRequirements'] {
    const result: IProductionPlan['materialRequirements'] = [];

    if (node.materialId || node.material) {
      result.push({
        materialId: node.materialId,
        materialName: node.material ?? node.name,
        requiredQty: node.qty,
        unit: node.unit,
        costPerUnit: node.costPerUnit,
        source: node.type === 'purchased' ? 'purchased' : node.type === 'part' ? 'produced' : 'stock',
      });
    }

    if (node.children) {
      for (const child of node.children) {
        result.push(...this.flattenBomMaterials(child));
      }
    }

    return result;
  }

  private flattenWorkItems(node: IComponentNode): IProductionPlan['workItems'] {
    const result: IProductionPlan['workItems'] = [];

    if (node.type === 'process' || node.type === 'assembly') {
      result.push({
        workTypeId: node.marking,
        name: node.name,
        plannedHours: node.leadTimeDays ?? 0,
        dependsOn: undefined,
      });
    }

    if (node.children) {
      for (const child of node.children) {
        result.push(...this.flattenWorkItems(child));
      }
    }

    return result;
  }

  private calculateLeadTime(workItems: IProductionPlan['workItems']): number {
    return workItems.reduce((max, w) => Math.max(max, w.plannedHours), 0);
  }

  /** Утвердить план */
  async approvePlan(orderId: string): Promise<void> {
    await ProductionPlanModel.findOneAndUpdate({ orderId }, { status: 'approved' });
  }
}

export const productionService = new ProductionService();
