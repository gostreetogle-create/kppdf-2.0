/**
 * KPPDF 2.0 — Dimension Parser (Frontend mirror)
 *
 * @see shared/logic/dimension-parser.ts — каноническая версия
 */

export interface IParsedDimension {
  raw: string;
  parts: number[];
  normalized: string;
  width?: number;
  height?: number;
  thickness: number;
  length?: number;
  computed: {
    surfaceAreaMm2: number;
    surfaceAreaM2: number;
    volumeMm3: number;
    volumeM3: number;
    weightG?: number;
    weightKg?: number;
  };
  axes: 1 | 2 | 3 | 4;
  formatLabel: string;
}

export const MATERIAL_DENSITY: Record<string, number> = {
  'Сталь': 7.85,
  'Нержавейка': 7.93,
  'Алюминий': 2.70,
  'Медь': 8.96,
  'Латунь': 8.50,
  'Пластик (ПЭ)': 0.95,
  'Пластик (ПП)': 0.91,
  'Пластик (ПВХ)': 1.40,
  'Древесина (сосна)': 0.52,
  'Древесина (дуб)': 0.75,
  'Стекло': 2.50,
  'Резина': 1.20,
} as const;

export class DimensionParseError extends Error {
  constructor(message: string, public readonly raw: string) {
    super(`Dimension parse error: ${message} (raw: "${raw}")`);
    this.name = 'DimensionParseError';
  }
}

export class DimensionParser {
  static parse(value: string, options?: { materialName?: string; densityGcm3?: number }): IParsedDimension {
    const trimmed = value.trim();
    if (!trimmed) throw new DimensionParseError('Пустая строка', value);

    const parts = trimmed
      .split(/[xх×*]/)
      .map(p => p.trim())
      .map(p => {
        const n = parseFloat(p);
        return isNaN(n) ? null : n;
      });

    const invalidIdx = parts.findIndex(p => p === null);
    if (invalidIdx !== -1) {
      throw new DimensionParseError(`Часть ${invalidIdx + 1} не является числом`, value);
    }

    const numericParts = parts as number[];
    if (numericParts.length < 1) throw new DimensionParseError('Должна быть хотя бы 1 числовая часть', value);
    if (numericParts.length > 4) throw new DimensionParseError('Максимум 4 числовые части', value);

    for (let i = 0; i < numericParts.length; i++) {
      if (numericParts[i] <= 0) {
        throw new DimensionParseError(`Часть ${i + 1} (${numericParts[i]}) должна быть положительной`, value);
      }
    }

    let width: number | undefined;
    let height: number | undefined;
    let thickness = 1;
    let length: number | undefined;
    const axes = numericParts.length as 1 | 2 | 3 | 4;
    let formatLabel = '';
    const [a, b, c, d] = numericParts;

    switch (numericParts.length) {
      case 1:
        length = a; formatLabel = `Линейный: ${a} мм`; break;
      case 2:
        width = a; height = b; formatLabel = `Лист: ${a}×${b} мм`; break;
      case 3:
        width = a; height = b; thickness = c; formatLabel = `Профиль/труба: ${a}×${b}×${c} мм`; break;
      case 4:
        width = a; height = b; thickness = c; length = d; formatLabel = `Профиль: ${a}×${b}×${c}, L=${d} мм`; break;
    }

    let surfaceAreaMm2 = 0;
    let volumeMm3 = 0;

    switch (numericParts.length) {
      case 1:
        volumeMm3 = 1 * a; surfaceAreaMm2 = 0; break;
      case 2:
        surfaceAreaMm2 = 2 * a * b; volumeMm3 = a * b * 1; break;
      case 3:
        surfaceAreaMm2 = 2 * (a * b + a * c + b * c); volumeMm3 = a * b * c; break;
      case 4:
        surfaceAreaMm2 = 2 * (a * b + a * c) * d; volumeMm3 = a * b * d; break;
    }

    let weightG: number | undefined;
    let weightKg: number | undefined;
    const effectiveDensity = options?.densityGcm3 ?? (options?.materialName ? MATERIAL_DENSITY[options.materialName] : undefined);
    if (effectiveDensity !== undefined) {
      weightG = (volumeMm3 / 1000) * effectiveDensity;
      weightKg = weightG / 1000;
    }

    return {
      raw: value,
      parts: numericParts,
      normalized: numericParts.join('x'),
      width, height, thickness, length,
      computed: {
        surfaceAreaMm2: Math.round(surfaceAreaMm2 * 100) / 100,
        surfaceAreaM2: Math.round((surfaceAreaMm2 / 1_000_000) * 10000) / 10000,
        volumeMm3: Math.round(volumeMm3 * 100) / 100,
        volumeM3: Math.round((volumeMm3 / 1_000_000_000) * 1000000) / 1000000,
        weightG: weightG !== undefined ? Math.round(weightG * 100) / 100 : undefined,
        weightKg: weightKg !== undefined ? Math.round(weightKg * 1000) / 1000 : undefined,
      },
      axes,
      formatLabel,
    };
  }

  static validate(value: string): string | null {
    try { DimensionParser.parse(value); return null; }
    catch (e) { return e instanceof DimensionParseError ? e.message : 'Неизвестная ошибка парсинга'; }
  }

  static formatArea(mm2: number): string {
    if (mm2 >= 1_000_000) return `${(mm2 / 1_000_000).toFixed(2)} м²`;
    if (mm2 >= 1) return `${mm2.toFixed(0)} мм²`;
    return `${(mm2 * 1_000_000).toFixed(2)} мкм²`;
  }

  static formatVolume(mm3: number): string {
    if (mm3 >= 1_000_000_000) return `${(mm3 / 1_000_000_000).toFixed(4)} м³`;
    if (mm3 >= 1_000) return `${(mm3 / 1_000).toFixed(2)} см³`;
    return `${mm3.toFixed(0)} мм³`;
  }
}
