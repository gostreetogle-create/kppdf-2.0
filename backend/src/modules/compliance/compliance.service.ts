import { ComplianceCheckModel, type IComplianceCheck } from './compliance.model';
import { getCategoryByCode } from '../spec/spec.model';
import { ProductSpecModel } from '../../../schemas/product-spec.schema';
import type { IAttributeValue, ComparisonOperator } from '@shared/types/attribute.types';
import type { IRequirement } from '@shared/types/requirement.types';

export interface CompareResult {
  match: boolean;
  message: string;
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

export class ComplianceService {
  /**
   * Проверить спецификацию на соответствие требованиям КП.
   *
   * CRM-1: Двухфазная сверка:
   *   Фаза 1 — количественная проверка каждого атрибута по оператору
   *   Фаза 2 — качественная проверка на MISSING_ATTRIBUTE
   */
  async checkCompliance(dealId: string, specId: string): Promise<string> {
    const spec = await ProductSpecModel.findById(specId).lean();
    if (!spec) throw new Error('Spec not found');

    const attrValues = (spec.attributeValues ?? []) as unknown as IAttributeValue[];
    const results: IComplianceCheck['results'] = [];

    for (const attr of attrValues) {
      // CRM-5: Если нет orderedValue — нечего проверять
      if (attr.orderedValue === null || attr.orderedValue === undefined) continue;

      // Дизайн или built — что более актуально
      const actual = attr.designValue ?? attr.builtValue ?? attr.orderedValue;
      const isMatch = this.compareValues(attr.orderedValue, String(actual), '=');

      results.push({
        attrCode: attr.attrCode,
        attrName: attr.attrName ?? attr.attrCode,
        expected: String(attr.orderedValue),
        actual: String(actual),
        operator: '=',
        status: isMatch ? 'match' : 'deviation',
        severity: isMatch ? 'warning' : 'error',
        message: isMatch
          ? undefined
          : `Ожидалось ${attr.orderedValue}, получено ${actual}`,
      });
    }

    const passed = results.every(r => r.status === 'match');
    const failed = results.some(r => r.status === 'deviation' && r.severity === 'error');

    const check = await ComplianceCheckModel.create({
      dealId,
      specId,
      status: passed ? 'passed' : failed ? 'failed' : 'partial',
      checkedAt: new Date(),
      results,
    });

    return check._id.toString();
  }

  /** Получить результат проверки */
  async getCheckById(id: string) {
    return ComplianceCheckModel.findById(id).lean();
  }

  // ==================== Unified compare engine (8 operators) ====================

  /**
   * Сравнить два значения по оператору.
   * Это ядро Compliance Engine, вызывается из advanceLifecycle.
   *
   * Поддерживаемые операторы: =, ≠, >, <, ≥, ≤, ±, range
   *
   * @see CRM-1 (таблица операторов)
   * @see CRM-2 (tolerance для ±)
   */
  compare(
    source: string | number | boolean,
    target: string | number | boolean,
    operator: ComparisonOperator | string,
    tolerance?: number,
  ): CompareResult {
    // Числовое сравнение (если оба значения — числа)
    const srcNum = Number(source);
    const tgtNum = Number(target);
    const isNumeric = !isNaN(srcNum) && !isNaN(tgtNum) && typeof source !== 'boolean';

    if (isNumeric) {
      return this.compareNumeric(srcNum, tgtNum, operator as ComparisonOperator, tolerance);
    }

    // Строковое/булево сравнение (только = и ≠)
    switch (operator) {
      case '=':
      case '≥':
      case '≤':
        return {
          match: String(source).trim().toLowerCase() === String(target).trim().toLowerCase(),
          message: `Строковое сравнение: "${source}" ${operator} "${target}"`,
        };
      case '≠':
        return {
          match: String(source).trim().toLowerCase() !== String(target).trim().toLowerCase(),
          message: `Строковое сравнение: "${source}" ≠ "${target}"`,
        };
      default:
        return {
          match: false,
          message: `Оператор "${operator}" не поддерживается для нечисловых значений`,
        };
    }
  }

  private compareNumeric(
    source: number,
    target: number,
    operator: ComparisonOperator,
    tolerance?: number,
  ): CompareResult {
    switch (operator) {
      case '=':
        return {
          match: source === target,
          message: `${source} = ${target}: ${source === target ? 'Совпадает' : 'Отклонение'}`,
        };

      case '≠':
        return {
          match: source !== target,
          message: `${source} ≠ ${target}: ${source !== target ? 'OK' : 'Равны (ожидалось ≠)'}`,
        };

      case '>':
        return {
          match: target > source,
          message: `${target} > ${source}: ${target > source ? 'OK' : `Ожидалось > ${source}`}`,
        };

      case '<':
        return {
          match: target < source,
          message: `${target} < ${source}: ${target < source ? 'OK' : `Ожидалось < ${source}`}`,
        };

      case '≥':
        return {
          match: target >= source,
          message: `${target} ≥ ${source}: ${target >= source ? 'OK' : `Ожидалось ≥ ${source}`}`,
        };

      case '≤':
        return {
          match: target <= source,
          message: `${target} ≤ ${source}: ${target <= source ? 'OK' : `Ожидалось ≤ ${source}`}`,
        };

      case '±': {
        // CRM-2: tolerance по умолчанию 10% если не указан
        const tol = tolerance ?? 0.1;

        // Абсолютный допуск (если tol < 1 — считаем относительным)
        const absTol = tol < 1 ? Math.abs(source) * tol : tol;
        const diff = Math.abs(target - source);
        const match = diff <= absTol;

        return {
          match,
          message: match
            ? `${target} ± ${absTol.toFixed(2)} от ${source}: OK`
            : `${target} ± ${absTol.toFixed(2)} от ${source}: Отклонение ${diff.toFixed(2)}`,
        };
      }

      case 'range': {
        // Ожидаем source в формате "min-max" или имеем min/max как отдельные поля
        const srcStr = String(source);
        const rangeMatch = srcStr.match(/^(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)$/);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          const match = target >= min && target <= max;
          return {
            match,
            message: match
              ? `${target} в диапазоне [${min}, ${max}]: OK`
              : `${target} вне диапазона [${min}, ${max}]`,
          };
        }
        // Если source — одно число, проверяем равенство
        return {
          match: source === target,
          message: `range: source не является диапазоном, сравнение как =`,
        };
      }

      default:
        return {
          match: false,
          message: `Неизвестный оператор: "${operator}"`,
        };
    }
  }

  // ==================== Requirements check ====================

  /** Проверка требований клиента против атрибутов спецификации */
  async checkRequirements(
    specId: string,
    requirements: IRequirement[],
  ): Promise<IComplianceCheck['results']> {
    const spec = await ProductSpecModel.findById(specId).lean();
    if (!spec) throw new Error('Spec not found');

    const attrValues = (spec.attributeValues ?? []) as unknown as IAttributeValue[];
    const results: IComplianceCheck['results'] = [];

    for (const req of requirements) {
      const attr = attrValues.find(a => a.attrCode === req.attrCode);

      // Фаза 2: MISSING_ATTRIBUTE
      if (!attr) {
        results.push({
          attrCode: req.attrCode,
          attrName: req.attrCode,
          expected: req.expectedValue,
          actual: '(отсутствует)',
          operator: req.operator,
          status: 'deviation',
          severity: 'error',
          message: `Атрибут "${req.attrCode}" отсутствует в спецификации`,
        });
        continue;
      }

      const actual = attr.designValue ?? attr.builtValue ?? attr.orderedValue ?? '';
      const result = this.compare(req.expectedValue, String(actual), req.operator);

      results.push({
        attrCode: req.attrCode,
        attrName: attr.attrName ?? req.attrCode,
        expected: req.expectedValue,
        actual: String(actual),
        operator: req.operator,
        status: result.match ? 'match' : 'deviation',
        severity: req.isCritical ? 'error' : 'warning',
        message: result.match ? undefined : result.message,
      });
    }

    return results;
  }

  // ==================== Private helpers (legacy) ====================

  private compareValues(expected: string, actual: string, operator: string): boolean {
    const exp = parseFloat(expected);
    const act = parseFloat(actual);

    if (isNaN(exp) || isNaN(act)) {
      return expected.trim().toLowerCase() === actual.trim().toLowerCase();
    }

    switch (operator) {
      case '=': return exp === act;
      case '>': return act > exp;
      case '<': return act < exp;
      case '≥': return act >= exp;
      case '≤': return act <= exp;
      case '≠': return act !== exp;
      case '±': return Math.abs(act - exp) / exp <= 0.1;
      case 'range': return true; // kept for backward compat
      default: return false;
    }
  }
}

export const complianceService = new ComplianceService();
