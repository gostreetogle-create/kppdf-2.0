// ─── Document Engine: Universal Document Types ───────────────
// Frontend copy — канонический источник для Angular

/** Тип документооборотной сущности */
export type DocumentEntityType = 'kp' | 'contract' | 'invoice' | 'passport' | 'appendix' | 'spec';

/** Статус документа */
export type DocumentStatus = 'draft' | 'final' | 'archived';

/** Тип оверлея */
export type OverlayType = 'text' | 'table' | 'image' | 'qrcode' | 'barcode';

/** Стратегия переноса */
export type PageBreakMode = 'none' | 'auto' | 'always';

/** Выравнивание текста */
export type OverlayTextAlign = 'left' | 'center' | 'right';

/** Стилизация оверлея */
export interface IOverlayStyle {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  textAlign: OverlayTextAlign;
  color: string;
}

/** Колонка таблицы */
export interface ITableColumnDef {
  field: string;
  header: string;
  width: number;
  align: OverlayTextAlign;
  format?: string;
}

/** Оверлей */
export interface IOverlayDef {
  id: string;
  type: OverlayType;
  x: number;
  y: number;
  width: number;
  height: number;
  dataSource: string;
  style: IOverlayStyle;
  tableColumns?: ITableColumnDef[];
  pageBreak: PageBreakMode;
  visibilityCondition?: string;
  qrcodeData?: string;
}

/** Страница A4 */
export interface IDocumentPage {
  pageNumber: number;
  backgroundImage?: string;
  overlays: IOverlayDef[];
}

/** Шаблон документа */
export interface IDocumentTemplate {
  id: string;
  name: string;
  documentType: DocumentEntityType;
  description?: string;
  backgroundImage: string;
  pages: IDocumentPage[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Инстанс документа */
export interface IDocument {
  id: string;
  templateId: string;
  templateName: string;
  entityType: DocumentEntityType;
  entityId: string;
  data: Record<string, unknown>;
  status: DocumentStatus;
  pages: IDocumentPage[];
  createdAt?: string;
  finalizedAt?: string;
}

/** DTO */
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
