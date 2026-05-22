import {
  ProductCategoryModel,
  ProductSpecModel,
  getCategoryById,
  getCategoryByCode,
  listCategories,
  createSpec,
  updateSpecStatus,
} from './spec.model';
import { complianceService } from '../compliance/compliance.service';
import { productionService } from '../production/production.service';
import type { IProductCategory } from '@shared/types/category.types';
import type { LifecycleStatus, IAttributeDef, IAttributeValue } from '@shared/types/attribute.types';
import type { IComponentNode } from '@shared/types/bom.types';

/**
 * Порядок стадий жизненного цикла Digital Twin.
 * Индекс = позиция в цепочке advance.
 */
const LIFECYCLE_FLOW: LifecycleStatus[] = [
  'as_ordered',
  'as_designed',
  'as_built',
  'as_maintained',
];

/** Маппинг стадий → имена полей в IAttributeValue */
const STAGE_TO_FIELD: Record<LifecycleStatus, keyof IAttributeValue> = {
  'as_ordered': 'orderedValue',
  'as_designed': 'designValue',
  'as_built': 'builtValue',
  'as_maintained': 'maintainedValue',
};

/** Маппинг: какая стадия с какой сравнивается при compliance */
const COMPLIANCE_PAIRS: [LifecycleStatus, LifecycleStatus][] = [
  ['as_ordered', 'as_designed'],
  ['as_designed', 'as_built'],
  ['as_built', 'as_maintained'],
];

export class SpecService {
  // ==================== Categories ====================

  async getAllCategories(): Promise<IProductCategory[]> {
    return listCategories();
  }

  async getCategory(id: string): Promise<IProductCategory | null> {
    return getCategoryById(id);
  }

  async getCategoryByCode(code: string): Promise<IProductCategory | null> {
    return getCategoryByCode(code);
  }

  async createCategory(data: Partial<IProductCategory>): Promise<string> {
    const doc = await ProductCategoryModel.create(data);
    return doc._id.toString();
  }

  async updateCategory(id: string, data: Partial<IProductCategory>): Promise<void> {
    await ProductCategoryModel.findByIdAndUpdate(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    await ProductCategoryModel.findByIdAndDelete(id);
  }

  // ==================== Specs (Digital Twin) ====================

  /**
   * Создать спецификацию (Digital Twin) для товара.
   *
   * Правила:
   *   PLM-1: Глубокое копирование шаблона атрибутов из категории
   *   PLM-3: attrCode — строковая ссылка (не ObjectId)
   */
  async createSpec(productId: string, categoryId: string): Promise<string> {
    const category = await ProductCategoryModel.findById(categoryId).lean();
    if (!category) throw new Error(`Категория ${categoryId} не найдена`);

    // PLM-1: Deep copy атрибутов из категории → attributeValues (ordered-стадия)
    const attributeValues = (category.attributeGroups ?? []).flatMap(group =>
      (group.attributeDefs ?? []).map((def: any) => ({
        attrCode: def.code,
        attrName: def.name,
        valueType: def.valueType,
        isRequired: def.isRequired ?? false,
        orderedValue: def.defaultValue ?? null,
        designValue: null,
        builtValue: null,
        maintainedValue: null,
        compliant: null,
        orphan: false,
      })),
    );

    const spec = await ProductSpecModel.create({
      productId,
      categoryId,
      categoryVersion: category.__v ?? 1,
      version: 1,
      status: 'as_ordered',
      attributeValues,
      bom: null,
    });
    return spec._id.toString();
  }

  /**
   * Получить спецификацию с полными данными.
   */
  async getSpec(specId: string) {
    return ProductSpecModel.findById(specId).lean();
  }

  /**
   * Продвинуть спецификацию на следующую стадию жизненного цикла.
   *
   * Порядок: as_ordered → as_designed → as_built → as_maintained
   *
   * Валидации:
   *   PLM-2:  Все обязательные атрибуты должны быть заполнены на текущей стадии
   *   PLM-5:  Все предыдущие стадии должны быть не-null
   *   PLM-6:  Compliance-сверка между текущей и следующей стадией
   *   CRM-3:  Блокировка as_maintained если есть non-compliant обязательные атрибуты
   *
   * ERP-триггеры (при advance → as_designed):
   *   ERP-4:  Создание WorkTask для processOps
   *   ERP-5:  Создание MaterialRequest для purchased-узлов
   */
  async advanceLifecycle(specId: string): Promise<AdvanceLifecycleResult> {
    const spec = await ProductSpecModel.findById(specId);
    if (!spec) throw new Error(`Спецификация ${specId} не найдена`);

    const currentStatus = spec.status as LifecycleStatus;
    const currentIdx = LIFECYCLE_FLOW.indexOf(currentStatus);

    if (currentIdx === -1) throw new Error(`Неизвестный статус: ${currentStatus}`);
    if (currentIdx >= LIFECYCLE_FLOW.length - 1) {
      throw new Error(`Спецификация ${specId} уже на финальной стадии: ${currentStatus}`);
    }

    const nextStatus = LIFECYCLE_FLOW[currentIdx + 1];
    const currentField = STAGE_TO_FIELD[currentStatus];
    const nextField = STAGE_TO_FIELD[nextStatus];
    const violations: AdvanceLifecycleViolation[] = [];

    // === PLM-5: Проверка цепочки (все стадии до current должны быть не-null) ===
    for (let i = 0; i <= currentIdx; i++) {
      const stageField = STAGE_TO_FIELD[LIFECYCLE_FLOW[i]];
      for (const attr of spec.attributeValues) {
        if (attr.isRequired && attr[stageField] === null && attr.orphan !== true) {
          violations.push({
            type: 'missing_previous_stage',
            attrCode: attr.attrCode,
            attrName: attr.attrName,
            message: `Обязательный атрибут "${attr.attrName}" не заполнен на стадии ${LIFECYCLE_FLOW[i]}`,
            severity: 'block',
          });
        }
      }
    }

    if (violations.some(v => v.severity === 'block')) {
      return { success: false, status: currentStatus, violations, warnings: [] };
    }

    // === PLM-2: Валидация обязательных атрибутов для текущей стадии ===
    for (const attr of spec.attributeValues) {
      if (attr.isRequired && attr[currentField] === null && attr.orphan !== true) {
        violations.push({
          type: 'required_field_empty',
          attrCode: attr.attrCode,
          attrName: attr.attrName,
          message: `Обязательный атрибут "${attr.attrName}" должен быть заполнен для стадии ${currentStatus}`,
          severity: 'block',
        });
      }
    }

    if (violations.some(v => v.severity === 'block')) {
      return { success: false, status: currentStatus, violations, warnings: [] };
    }

    // === PLM-6: Compliance-сверка (current vs next) ===
    const warnings: AdvanceLifecycleViolation[] = [];
    const complianceItems: ComplianceCheckItem[] = [];
    let hasBlockingViolations = false;

    // Ищем определение атрибута в категории для получения оператора
    const category = await ProductCategoryModel.findById(spec.categoryId).lean();
    const attrDefMap = new Map<string, any>();
    if (category) {
      for (const group of (category as any).attributeGroups ?? []) {
        for (const def of group.attributeDefs ?? []) {
          attrDefMap.set(def.code, def);
        }
      }
    }

    for (const attr of spec.attributeValues) {
      const sourceVal = attr[currentField];
      const targetVal = attr[nextField];
      const def = attrDefMap.get(attr.attrCode);

      // CRM-5: Если любое из значений null — пропускаем
      if (sourceVal === null || targetVal === null) {
        attr.compliant = null;
        continue;
      }

      const operator = def?.operator ?? '=';
      const tolerance = def?.tolerance ?? (operator === '±' ? 0.1 : undefined);

      // Конвертируем значения в числа для числовых операторов
      const sourceNum = Number(sourceVal);
      const targetNum = Number(targetVal);
      const isNumeric = !isNaN(sourceNum) && !isNaN(targetNum);
      const source = isNumeric ? sourceNum : sourceVal;
      const target = isNumeric ? targetNum : targetVal;

      const result = complianceService.compare(source, target, operator, tolerance);
      attr.compliant = result.match;

      if (!result.match) {
        const isBlocking = attr.isRequired && def?.lifecycled !== false;
        const violation: AdvanceLifecycleViolation = {
          type: 'compliance_deviation',
          attrCode: attr.attrCode,
          attrName: attr.attrName,
          expected: String(sourceVal),
          actual: String(targetVal),
          operator,
          message: result.message,
          severity: isBlocking ? 'block' : 'warning',
        };

        if (isBlocking) {
          violations.push(violation);
          hasBlockingViolations = true;
        } else {
          warnings.push(violation);
        }
      }

      complianceItems.push({
        attrCode: attr.attrCode,
        attrName: attr.attrName,
        sourceValue: String(sourceVal),
        targetValue: String(targetVal),
        operator,
        match: result.match,
        message: result.message,
      });
    }

    // === CRM-3: Блокировка as_maintained ===
    if (nextStatus === 'as_maintained' && hasBlockingViolations) {
      violations.push({
        type: 'passport_blocked',
        attrCode: '',
        attrName: '',
        message: 'Невозможно финализировать паспорт: есть критические несоответствия',
        severity: 'block',
      });

      // Сохраняем compliance флаги даже при блокировке (чтобы не потерять данные)
      await spec.save();

      return { success: false, status: currentStatus, violations, warnings };
    }

    // === ADVANCE: Переход на следующую стадию ===
    spec.status = nextStatus;
    spec.version = (spec.version ?? 1) + 1;
    await spec.save();

    // === ERP-триггеры при advance → as_designed ===
    const createdWorkTasks: string[] = [];
    const createdMaterialRequests: string[] = [];

    if (nextStatus === 'as_designed' && spec.bom) {
      try {
        const bom = spec.bom as IComponentNode;
        // ERP-4: WorkTask из processOps
        const wtResult = await productionService.createWorkTasksFromBom(
          specId,
          spec.productId.toString(),
          bom,
        );
        createdWorkTasks.push(...wtResult);

        // ERP-5: MaterialRequest из purchased-узлов
        const mrResult = await productionService.createMaterialRequestsFromBom(
          specId,
          bom,
        );
        createdMaterialRequests.push(...mrResult);
      } catch (err) {
        // Ошибка триггера не блокирует advance
        console.warn(`[SpecService] ERP triggers failed for spec ${specId}:`, err);
      }
    }

    return {
      success: true,
      status: nextStatus,
      previousStatus: currentStatus,
      version: spec.version,
      violations,
      warnings,
      compliance: complianceItems,
      createdWorkTasks,
      createdMaterialRequests,
    };
  }

  /** Сохранить BOM-дерево в спецификацию */
  async saveBom(specId: string, bom: IComponentNode): Promise<void> {
    await ProductSpecModel.findByIdAndUpdate(specId, { bom });
  }

  /**
   * Удалить узел из BOM-дерева с reparenting (PLM-11).
   * Если удаляется assembly — его дети перемещаются к родителю.
   * Если удаляется part/purchased/process — просто удаляется.
   * Корневой узел удалить нельзя.
   */
  async removeBomNode(specId: string, nodeId: string): Promise<IComponentNode> {
    const spec = await ProductSpecModel.findById(specId);
    if (!spec) throw new Error(`Спецификация ${specId} не найдена`);
    if (!spec.bom) throw new Error('Спецификация не содержит BOM');

    const bom = spec.bom as IComponentNode;

    // Корневой узел нельзя удалить
    if (bom.id === nodeId) {
      throw new Error('Нельзя удалить корневой узел BOM');
    }

    const found = this.removeNodeRecursive(bom, nodeId);
    if (!found) throw new Error(`Узел BOM ${nodeId} не найден`);

    spec.bom = bom;
    await spec.save();
    return bom;
  }

  /**
   * Рекурсивное удаление узла с reparenting.
   * Возвращает true если узел найден и удалён.
   */
  private removeNodeRecursive(parent: IComponentNode, nodeId: string): boolean {
    if (!parent.children) return false;

    const idx = parent.children.findIndex(c => c.id === nodeId);
    if (idx !== -1) {
      const [removed] = parent.children.splice(idx, 1);

      // PLM-11: Если assembly — reparenting детей
      if (removed.type === 'assembly' && removed.children?.length) {
        const reparented = removed.children.map(child => ({
          ...child,
          parentId: parent.id,
        }));
        parent.children.push(...reparented);
      }
      return true;
    }

    for (const child of parent.children) {
      if (this.removeNodeRecursive(child, nodeId)) return true;
    }
    return false;
  }
}

// ==================== Types ====================

export interface AdvanceLifecycleViolation {
  type: 'required_field_empty' | 'missing_previous_stage' | 'compliance_deviation' | 'passport_blocked';
  attrCode: string;
  attrName: string;
  expected?: string;
  actual?: string;
  operator?: string;
  message: string;
  severity: 'warning' | 'block';
}

export interface ComplianceCheckItem {
  attrCode: string;
  attrName: string;
  sourceValue: string;
  targetValue: string;
  operator: string;
  match: boolean;
  message?: string;
}

export interface AdvanceLifecycleResult {
  success: boolean;
  status: LifecycleStatus;
  previousStatus?: LifecycleStatus;
  version?: number;
  violations: AdvanceLifecycleViolation[];
  warnings: AdvanceLifecycleViolation[];
  compliance?: ComplianceCheckItem[];
  createdWorkTasks?: string[];
  createdMaterialRequests?: string[];
}

export const specService = new SpecService();
