import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { IOverlayDef } from '../../../../shared/types/document.types';

@Component({
  selector: 'app-overlay-renderer',
  standalone: true,
  imports: [],
  templateUrl: './overlay-renderer.component.html',
  styleUrls: ['./overlay-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayRendererComponent {
  readonly overlay = input.required<IOverlayDef>();
  readonly data = input<Record<string, unknown>>({});

  /** Извлечённое значение по dataSource */
  readonly value = computed<unknown>(() => {
    const o = this.overlay();
    const d = this.data();
    return resolveDataSource(o.dataSource, d);
  });

  /** Для таблиц: value как массив */
  readonly tableRows = computed<unknown[]>(() => {
    const v = this.value();
    return Array.isArray(v) ? v : [];
  });

  /** Проверка условной видимости */
  readonly visible = computed(() => {
    const condition = this.overlay().visibilityCondition;
    if (!condition) return true;
    return evaluateCondition(condition, this.data());
  });

  /** Публичный метод для шаблона (resolve значения строки таблицы) */
  resolveRowValue(row: unknown, field: string): unknown {
    return resolveRowValueFn(row, field);
  }
}

/** Разрезолвить dataSource вида "company.name" или "metadata.number"
 *  Для таблиц dataSource="items[]" — возвращает весь массив */
function resolveDataSource(path: string, data: Record<string, unknown>): unknown {
  if (data[path] !== undefined) return data[path];

  // Поддержка точечной нотации: company.name
  const parts = path.split('.');
  let current: unknown = data;
  for (const part of parts) {
    if (current === null || current === undefined) return '';
    if (typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return '';
    }
  }
  return current ?? '';
}

/** Разрезолвить значение строки таблицы по field (поддержка вложенных полей) */
export function resolveRowValueFn(row: unknown, field: string): unknown {
  if (row === null || row === undefined) return '';
  if (typeof row === 'object' && field in (row as Record<string, unknown>)) {
    const val = (row as Record<string, unknown>)[field];
    if (val === null || val === undefined) return '';
    return val;
  }
  return '';
}

/** Простейший evaluation условных выражений:
 *  "spec.has_ramp == true" → data["spec.has_ramp"] === true
 *  "items.length > 0"    → Array.isArray(data["items"]) && data["items"].length > 0
 *  "company.name != ''"  → data["company.name"] !== ''
 */
function evaluateCondition(condition: string, data: Record<string, unknown>): boolean {
  const match = condition.match(/^(\S+)\s*(==|!=|>|<|>=|<=)\s*(\S+)$/);
  if (!match) return true;

  const [, field, op, expected] = match;
  const value = resolveDataSource(field, data);

  let expectedValue: unknown = expected;
  if (expected === 'true') expectedValue = true;
  else if (expected === 'false') expectedValue = false;
  else if (!isNaN(Number(expected))) expectedValue = Number(expected);
  else if (expected.startsWith("'") && expected.endsWith("'")) expectedValue = expected.slice(1, -1);

  switch (op) {
    case '==': return value == expectedValue;
    case '!=': return value != expectedValue;
    case '>': return Number(value) > Number(expectedValue);
    case '<': return Number(value) < Number(expectedValue);
    case '>=': return Number(value) >= Number(expectedValue);
    case '<=': return Number(value) <= Number(expectedValue);
    default: return true;
  }
}
