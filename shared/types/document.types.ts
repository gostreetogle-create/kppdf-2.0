// ─── Document Engine: Universal Document Types ───────────────
// Этап H — универсальный редактор документов (КП, Договоры, Паспорта и т.д.)

/** Тип документооборотной сущности */
export type DocumentEntityType = 'kp' | 'contract' | 'invoice' | 'passport' | 'appendix' | 'spec';

/** Статус документа */
export type DocumentStatus = 'draft' | 'final' | 'archived';

// ─── Template Engine ─────────────────────────────────────────

/** Тип оверлея (блока на A4) */
export type OverlayType = 'text' | 'table' | 'image' | 'qrcode' | 'barcode';

/** Стратегия переноса на новую страницу */
export type PageBreakMode = 'none' | 'auto' | 'always';

/** Выравнивание текста в оверлее */
export type OverlayTextAlign = 'left' | 'center' | 'right';

/** Стилизация текстового оверлея */
export interface IOverlayStyle {
  fontSize: number;        // pt
  fontFamily: string;      // 'Roboto', 'Times New Roman', etc.
  bold: boolean;
  textAlign: OverlayTextAlign;
  color: string;           // hex: '#000000'
}

/** Описание колонки таблицы */
export interface ITableColumnDef {
  field: string;           // dataSource path, e.g. "name" or "price"
  header: string;          // display header
  width: number;           // mm
  align: OverlayTextAlign;
  format?: string;         // optional: 'currency', 'number', 'date'
}

/** Оверлей — блок данных на A4-листе */
export interface IOverlayDef {
  id: string;
  type: OverlayType;
  x: number;               // мм от левого края A4 (210×297 мм)
  y: number;               // мм от верхнего края A4
  width: number;           // мм ширина блока
  height: number;          // мм высота блока (auto для type=text, вычисляется)

  /** Путь к данным через Path Resolver:
   *  - "company.companyName"
   *  - "items[]"           — для type=table (весь массив)
   *  - "metadata.number"
   *  - "spec.has_ramp"     — для visibilityCondition
   */
  dataSource: string;

  style: IOverlayStyle;

  /** Параметры таблицы (только для type='table') */
  tableColumns?: ITableColumnDef[];

  /** Перенос страницы */
  pageBreak: PageBreakMode;

  /** Условная видимость: выражение типа "spec.has_ramp == true"
   *  Если пусто — блок всегда видим */
  visibilityCondition?: string;

  /** Для type='qrcode' — данные для кодирования */
  qrcodeData?: string;
}

/** Страница документа (A4) */
export interface IDocumentPage {
  pageNumber: number;
  backgroundImage?: string;    // URL фона для этой страницы (если отличается)
  overlays: IOverlayDef[];
}

/** Шаблон документа */
export interface IDocumentTemplate {
  id: string;
  name: string;               // "ООО СпортИнЮГ"
  documentType: DocumentEntityType;
  description?: string;
  backgroundImage: string;    // URL фонового изображения A4
  pages: IDocumentPage[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Document Instance ───────────────────────────────────────

/** Инстанс созданного документа (замороженный слепок) */
export interface IDocument {
  id: string;
  templateId: string;
  templateName: string;         // Snapshot на случай удаления шаблона

  entityType: DocumentEntityType;
  entityId: string;             // ID исходной сущности (КП, Договора...)

  /** Замороженные данные на момент создания/экспорта.
   *  Плоский Record, построенный Path Resolver'ом из entity */
  data: Record<string, unknown>;

  status: DocumentStatus;
  pages: IDocumentPage[];       // Перенесённые из шаблона + размноженные при overflow

  createdAt?: string;
  finalizedAt?: string;         // Дата заморозки (экспорта в PDF)
}

// ─── Path Resolver ───────────────────────────────────────────

/** Результат работы резолвера данных */
export interface IResolvedData {
  /** Плоский словарь: "company.name" → "ООО СпортИнЮГ"
   *  "items[0].name" → "Станок фрезерный"
   *  "items" → [...] (для таблиц) */
  data: Record<string, unknown>;

  /** Ошибки резолвинга (если поле не найдено) */
  errors: Array<{ path: string; message: string }>;
}

// ─── Create/Update DTO ───────────────────────────────────────

export interface CreateDocumentTemplateDto {
  name: string;
  documentType: DocumentEntityType;
  backgroundImage: string;
  pages: IDocumentPage[];
  isDefault?: boolean;
  description?: string;
}

export interface CreateDocumentDto {
  templateId: string;
  entityType: DocumentEntityType;
  entityId: string;
}

export interface UpdateDocumentDto {
  status?: DocumentStatus;
  data?: Record<string, unknown>;
  pages?: IDocumentPage[];
}
