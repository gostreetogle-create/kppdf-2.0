import { DocumentModel, IDocumentDocument } from './document.model';
import { DocumentTemplateModel } from '../document-template/document-template.model';
import { NotFoundError, ValidationError, ConflictError } from '../../shared/errors';
import type { IDocument, CreateDocumentDto, IDocumentTemplate } from '@shared/types/document.types';

function toJSON(doc: IDocumentDocument): IDocument {
  return {
    id: doc._id.toString(),
    templateId: doc.templateId,
    templateName: doc.templateName,
    entityType: doc.entityType,
    entityId: doc.entityId,
    data: doc.data as Record<string, unknown>,
    status: doc.status,
    pages: doc.pages,
    createdAt: (doc as any).createdAt?.toISOString(),
    finalizedAt: doc.finalizedAt,
  };
}

/**
 * Path Resolver: строит плоский Record<string, any> из любого entity
 * Корневой уровень с маппингом:
 *   company -> companySnapshot / company реквизиты
 *   recipient -> recipient
 *   items -> items[] (для таблиц)
 *   metadata -> metadata
 */
function resolveData(entityType: string, entity: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Копируем плоские поля
  for (const [key, value] of Object.entries(entity)) {
    if (key === '_id' || key === 'id') continue;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Вложенные объекты разворачиваем: companySnapshot.name → company.name
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (typeof subValue !== 'object' || subValue === null || Array.isArray(subValue)) {
          result[`${key}.${subKey}`] = subValue;
        } else if (key === 'companySnapshot') {
          // assets и texts дополнительно разворачиваем
          for (const [deepKey, deepValue] of Object.entries(subValue as Record<string, unknown>)) {
            result[`${key}.${subKey}.${deepKey}`] = deepValue;
          }
        }
      }
    } else if (Array.isArray(value)) {
      result[key] = value; // items целиком для таблиц
    } else {
      result[key] = value;
    }
  }

  // Спец-маппинг для КП
  if (entityType === 'kp') {
    // companySnapshot -> company
    const snap = entity['companySnapshot'] as Record<string, unknown> | undefined;
    if (snap) {
      result['company.name'] = snap['companyName'] ?? '';
      result['company.inn'] = (snap['companySnapshot'] as any)?.requisites?.inn ?? '';
      result['company.phone'] = (snap['companySnapshot'] as any)?.requisites?.phone ?? '';
      result['company.email'] = (snap['companySnapshot'] as any)?.requisites?.email ?? '';
    }
    // recipient -> client
    const recipient = entity['recipient'] as Record<string, unknown> | undefined;
    if (recipient) {
      result['client.name'] = recipient['name'] ?? '';
      result['client.inn'] = recipient['inn'] ?? '';
    }
  }

  return result;
}

/** Создать новый документ из шаблона + entity */
export async function create(data: CreateDocumentDto): Promise<IDocument> {
  if (!data.templateId) throw new ValidationError('templateId обязателен');
  if (!data.entityId) throw new ValidationError('entityId обязателен');

  // Загружаем шаблон (нужен для pages/background)
  const template = await DocumentTemplateModel.findById(data.templateId);
  if (!template) throw new NotFoundError('Шаблон документа', data.templateId);

  // Загружаем entity
  const entity = await loadEntity(data.entityType, data.entityId);
  if (!entity) throw new NotFoundError('Сущность', data.entityId);

  // Резолвим данные
  const resolved = resolveData(data.entityType, entity as Record<string, unknown>);

  // Копируем pages из шаблона, замораживаем backgroundImage
  const pages = template.pages.map((p) => ({
    pageNumber: p.pageNumber,
    backgroundImage: p.backgroundImage ?? template.backgroundImage,
    overlays: p.overlays.map((o) => ({ ...o })),
  }));

  const doc = await DocumentModel.create({
    templateId: data.templateId,
    templateName: template.name,
    entityType: data.entityType,
    entityId: data.entityId,
    data: resolved,
    status: 'draft',
    pages,
  });

  return toJSON(doc);
}

/** Получить документ по ID */
export async function getById(id: string): Promise<IDocument> {
  const doc = await DocumentModel.findById(id);
  if (!doc) throw new NotFoundError('Документ', id);
  return toJSON(doc);
}

/** Получить все документы (с фильтром по типу) */
export async function getAll(entityType?: string): Promise<IDocument[]> {
  const filter = entityType ? { entityType } : {};
  const docs = await DocumentModel.find(filter).sort({ createdAt: -1 });
  return docs.map(toJSON);
}

/** Обновить данные документа (до заморозки) */
export async function updateData(id: string, data: Record<string, unknown>): Promise<IDocument> {
  const doc = await DocumentModel.findById(id);
  if (!doc) throw new NotFoundError('Документ', id);
  if (doc.status !== 'draft') throw new ConflictError('Нельзя редактировать замороженный документ');

  // Мержим новые данные
  doc.data = { ...(doc.data as Record<string, unknown>), ...data };
  await doc.save();
  return toJSON(doc);
}

/** Заморозить документ (финальный статус, нельзя редактировать) */
export async function finalize(id: string): Promise<IDocument> {
  const doc = await DocumentModel.findById(id);
  if (!doc) throw new NotFoundError('Документ', id);
  if (doc.status !== 'draft') throw new ConflictError('Документ уже заморожен');

  doc.status = 'final';
  doc.finalizedAt = new Date().toISOString();
  await doc.save();
  return toJSON(doc);
}

/** Удалить документ */
export async function remove(id: string): Promise<void> {
  const doc = await DocumentModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Документ', id);
}

// ─── Вспомогательное ─────────────────────────────────────────

async function loadEntity(entityType: string, entityId: string): Promise<unknown | null> {
  switch (entityType) {
    case 'kp': {
      const { KpModel } = await import('../kp/kp.model');
      return KpModel.findById(entityId).lean();
    }
    case 'contract': {
      const { OrderModel } = await import('../order/order.model');
      return OrderModel.findById(entityId).lean();
    }
    case 'spec': {
      const { ProductSpecModel } = await import('../../../schemas/product-spec.schema');
      return ProductSpecModel.findById(entityId).lean();
    }
    default:
      return null;
  }
}
