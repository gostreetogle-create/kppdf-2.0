import { KpModel, IKpDocument } from './kp.model';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '../../shared/errors';
import { KP_STATUS_TRANSITIONS } from '@shared/constants/kp-statuses';
import type { IKp, KpStatus, KpType, IKpItem } from '@shared/types/kp.interface';

/** Рассчитать effectivePrice для позиции с учётом наценки/скидки */
function calcEffectivePrice(item: IKpItem): number {
  let effective = item.price;

  if (item.markupEnabled && item.markupPercent) {
    effective += effective * (item.markupPercent / 100);
  }
  if (item.discountEnabled && item.discountPercent) {
    effective -= effective * (item.discountPercent / 100);
  }

  return Math.round(effective * 100) / 100;
}

/** Рассчитать сумму по всем позициям */
function calcTotal(items: IKpItem[]): number {
  return items.reduce((sum, item) => {
    const ep = item.effectivePrice ?? calcEffectivePrice(item);
    return sum + ep * item.qty;
  }, 0);
}

/** Сгенерировать номер КП: КП-001, КП-002 и т.д. */
async function generateNumber(_kpType: KpType): Promise<string> {
  const prefix = 'КП';

  const last = await KpModel.findOne({
    'metadata.number': { $regex: `^${prefix}-\\d+$` },
  })
    .sort({ createdAt: -1 })
    .select('metadata.number');

  let seq = 1;
  if (last) {
    const parts = last.metadata.number.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

/** Публичный метод — получить следующий номер не создавая КП */
export async function generateNextNumber(kpType: KpType): Promise<string> {
  return generateNumber(kpType);
}

function toJSON(doc: IKpDocument): IKp {
  return doc.toJSON() as unknown as IKp;
}

// ---- CRUD ----

export async function getAll(filters?: {
  status?: KpStatus;
  counterpartyId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: IKp[]; total: number }> {
  const query: any = {};

  if (filters?.status) query.status = filters.status;
  if (filters?.counterpartyId) query.counterpartyId = filters.counterpartyId;
  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { 'metadata.number': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const total = await KpModel.countDocuments(query);
  const docs = await KpModel.find(query)
    .sort({ createdAt: -1 })
    .skip(filters?.offset ?? 0)
    .limit(filters?.limit ?? 50);

  return { data: docs.map(toJSON), total };
}

export async function getById(id: string): Promise<IKp> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('КП', id);
  return toJSON(doc);
}

export async function create(data: {
  title: string;
  kpType: KpType;
  counterpartyId?: string;
  companyId?: string;
  recipient: IKp['recipient'];
  companySnapshot: IKp['companySnapshot'];
  items: IKpItem[];
  conditions?: string[];
  vatPercent?: number;
  createdBy: string;
}): Promise<IKp> {
  if (!data.title || !data.recipient || !data.companySnapshot) {
    throw new ValidationError('title, recipient и companySnapshot обязательны для заполнения');
  }

  const number = await generateNumber(data.kpType || 'standard');

  const processedItems = data.items.map((item) => ({
    ...item,
    effectivePrice: item.effectivePrice ?? calcEffectivePrice(item),
  }));

  const totalAmount = calcTotal(processedItems);

  const doc = await KpModel.create({
    title: data.title,
    status: 'draft',
    kpType: data.kpType || 'standard',
    counterpartyId: data.counterpartyId,
    companyId: data.companyId,
    recipient: data.recipient,
    metadata: {
      number,
      createdAt: new Date().toISOString(),
      validityDays: 30,
      prepaymentPercent: 50,
      productionDays: 30,
      tablePageBreakFirstPage: 17,
      tablePageBreakNextPages: 22,
      photoScalePercent: 30,
      showPhotoColumn: true,
    },
    companySnapshot: data.companySnapshot,
    items: processedItems,
    conditions: data.conditions ?? [],
    vatPercent: data.vatPercent ?? 0,
    totalAmount,
    createdBy: data.createdBy,
    versions: [
      {
        version: 1,
        createdAt: new Date().toISOString(),
        status: 'draft',
        number,
        title: data.title,
      },
    ],
  });

  return toJSON(doc);
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    counterpartyId: string;
    companyId: string;
    recipient: IKp['recipient'];
    companySnapshot: IKp['companySnapshot'];
    items: IKpItem[];
    conditions: string[];
    vatPercent: number;
  }>,
): Promise<IKp> {
  const existing = await KpModel.findById(id);
  if (!existing) throw new NotFoundError('КП', id);
  if (existing.status !== 'draft') {
    throw new ForbiddenError('Редактировать можно только черновики КП');
  }

  const updateData: any = { ...data };

  if (data.items) {
    const processedItems = data.items.map((item) => ({
      ...item,
      effectivePrice: item.effectivePrice ?? calcEffectivePrice(item),
    }));
    updateData.items = processedItems;
    updateData.totalAmount = calcTotal(processedItems);
  }

  const doc = await KpModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('КП', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await KpModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('КП', id);
}

// ---- Status transitions ----

export async function changeStatus(id: string, newStatus: KpStatus, userId: string): Promise<IKp> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('КП', id);

  const currentStatus = doc.status as KpStatus;
  const allowed = KP_STATUS_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(`Невозможно перевести из статуса '${currentStatus}' в '${newStatus}'`);
  }

  const newVersion = {
    version: (doc.versions?.length ?? 0) + 1,
    createdAt: new Date().toISOString(),
    status: newStatus,
    number: doc.metadata.number,
    title: doc.title,
    changedBy: userId,
  };

  // Атомарное обновление с OCC: обновляем ТОЛЬКО если статус не изменился
  const updated = await KpModel.findOneAndUpdate(
    { _id: id, status: currentStatus },
    {
      $set: { status: newStatus },
      $push: { versions: newVersion },
    },
    { new: true },
  );

  if (!updated) {
    throw new ConflictError('Статус уже изменён другим пользователем. Обновите страницу и повторите.');
  }

  return toJSON(updated);
}

// ---- Calculations ----

export async function recalculate(id: string): Promise<{ totalAmount: number; items: IKpItem[] }> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('КП', id);

  const items = doc.items.map((item) => ({
    ...item,
    effectivePrice: item.effectivePrice ?? calcEffectivePrice(item),
  }));

  const totalAmount = calcTotal(items);
  return { totalAmount, items };
}
