/**
 * KPPDF 2.0 — Dimension Parser
 *
 * Преобразует строку вида "80x80x3" в структурированный объект
 * с рассчитанными площадью поверхности, объёмом и весом.
 *
 * Соответствует правилам:
 *   TYPE-1 (Формат dimension)
 *   TYPE-2 (Парсинг dimension)
 *   TYPE-3 (Dimension → ERP материалы)
 *
 * @see docs/business-rules.md — Раздел 4.3, Правила TYPE-1—3
 * @see docs/conflict-resolution-map.md — Конфликт #3
 */

/**
 * Разобранное измерение.
 * Все числовые значения в миллиметрах.
 */
export interface IParsedDimension {
  /** Исходная строка */
  raw: string;

  /** Все числовые части */
  parts: number[];

  /** Нормализованная строка (через 'x') */
  normalized: string;

  /** Семантические поля */
  width?: number;
  height?: number;
  thickness: number;
  length?: number;

  /** Рассчитанные значения */
  computed: {
    /** Площадь поверхности в мм² */
    surfaceAreaMm2: number;
    /** Площадь поверхности в м² */
    surfaceAreaM2: number;
    /** Объём в мм³ */
    volumeMm3: number;
    /** Объём в м³ */
    volumeM3: number;
    /** Вес в граммах (если известна плотность) */
    weightG?: number;
    /** Вес в кг */
    weightKg?: number;
  };

  /** Количество осей (1=линейный, 2=плоский, 3=объёмный, 4=профиль) */
  axes: 1 | 2 | 3 | 4;

  /** Человеческое описание формата */
  formatLabel: string;
}

/** Плотности материалов (г/см³) */
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
  /**
   * Парсит строку измерения.
   *
   * Поддерживаемые форматы:
   *   "40"           → линейный размер (d = 40)
   *   "500x200"      → лист 500x200 мм
   *   "80x80x3"      → труба/профиль 80x80 мм, стенка 3 мм
   *   "100x50x4x6000" → профиль 100x50x4, длина 6000 мм
   *
   * Разделители: x, × (U+00D7), х (русская), * (звёздочка)
   *
   * @throws {DimensionParseError} при невалидном формате
   */
  static parse(value: string, options?: { materialName?: string; densityGcm3?: number }): IParsedDimension {
    // 1. Предварительная очистка
    const trimmed = value.trim();
    if (!trimmed) {
      throw new DimensionParseError('Пустая строка', value);
    }

    // 2. Разделение по разделителям
    const parts = trimmed
      .split(/[xх×*]/)
      .map(p => p.trim())
      .map(p => {
        const n = parseFloat(p);
        return isNaN(n) ? null : n;
      });

    // 3. Проверка на нечисловые части
    const invalidIdx = parts.findIndex(p => p === null);
    if (invalidIdx !== -1) {
      throw new DimensionParseError(
        `Часть ${invalidIdx + 1} не является числом`,
        value,
      );
    }

    const numericParts = parts as number[];

    // 4. Валидация количества частей
    if (numericParts.length < 1) {
      throw new DimensionParseError('Должна быть хотя бы 1 числовая часть', value);
    }
    if (numericParts.length > 4) {
      throw new DimensionParseError('Максимум 4 числовые части', value);
    }

    // 5. Валидация положительности
    for (let i = 0; i < numericParts.length; i++) {
      if (numericParts[i] <= 0) {
        throw new DimensionParseError(
          `Часть ${i + 1} (${numericParts[i]}) должна быть положительной`,
          value,
        );
      }
    }

    // 6. Извлечение семантических полей
    let width: number | undefined;
    let height: number | undefined;
    let thickness = 1;
    let length: number | undefined;
    let axes: 1 | 2 | 3 | 4 = numericParts.length as 1 | 2 | 3 | 4;
    let formatLabel = '';
    const [a, b, c, d] = numericParts;

    switch (numericParts.length) {
      case 1:
        length = a;
        formatLabel = `Линейный: ${a} мм`;
        break;
      case 2:
        width = a;
        height = b;
        formatLabel = `Лист: ${a}×${b} мм`;
        break;
      case 3:
        width = a;
        height = b;
        thickness = c;
        formatLabel = `Профиль/труба: ${a}×${b}×${c} мм`;
        break;
      case 4:
        width = a;
        height = b;
        thickness = c;
        length = d;
        formatLabel = `Профиль: ${a}×${b}×${c}, L=${d} мм`;
        break;
    }

    // 7. Расчёт площади поверхности и объёма
    let surfaceAreaMm2 = 0;
    let volumeMm3 = 0;

    switch (numericParts.length) {
      case 1:
        // Линейный размер — объём = сечение 1 мм² * длина
        volumeMm3 = 1 * a;
        surfaceAreaMm2 = 2 * Math.PI * Math.sqrt(a / Math.PI) * a; // цилиндр: длина = a, радиус = sqrt(1/π) ~ условно
        // Для линейного размера площадь поверхности не имеет смысла; ставим 0
        surfaceAreaMm2 = 0;
        volumeMm3 = 1 * a; // условно: сечение 1 мм²
        break;
      case 2:
        // Лист: площадь поверхности = 2 * (a * b) (две стороны)
        surfaceAreaMm2 = 2 * a * b;
        volumeMm3 = a * b * 1; // толщина условно 1 мм
        break;
      case 3:
        // Прямоугольный профиль/труба
        // Площадь поверхности: 2*(a*b + a*c + b*c)
        surfaceAreaMm2 = 2 * (a * b + a * c + b * c);
        volumeMm3 = a * b * c;
        break;
      case 4:
        // Профиль заданной длины
        // Площадь сечения: 2*(a*b + a*c) (открытый профиль)
        surfaceAreaMm2 = 2 * (a * b + a * c) * d;
        volumeMm3 = a * b * d; // объём металла
        break;
    }

    // 8. Расчёт веса (если указана плотность)
    let weightG: number | undefined;
    let weightKg: number | undefined;

    const effectiveDensity = options?.densityGcm3
      ?? (options?.materialName ? MATERIAL_DENSITY[options.materialName] : undefined);

    if (effectiveDensity !== undefined) {
      // volumeMm3 → см³ (делим на 1000) → * density (г/см³) → граммы
      weightG = (volumeMm3 / 1000) * effectiveDensity;
      weightKg = weightG / 1000;
    }

    // 9. Сборка результата
    return {
      raw: value,
      parts: numericParts,
      normalized: numericParts.join('x'),
      width,
      height,
      thickness,
      length,
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

  /**
   * Валидирует строку без парсинга (для предварительной проверки на фронте).
   * Возвращает сообщение об ошибке или null если всё в порядке.
   */
  static validate(value: string): string | null {
    try {
      DimensionParser.parse(value);
      return null;
    } catch (e) {
      if (e instanceof DimensionParseError) return e.message;
      return 'Неизвестная ошибка парсинга';
    }
  }

  /**
   * Форматирует число с единицей измерения, подбирая подходящий префикс (мм, м).
   */
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
