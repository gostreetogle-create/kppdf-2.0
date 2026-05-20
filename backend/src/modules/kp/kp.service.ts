import { KpModel, IKpDocument } from './kp.model';
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors';
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

/** Сгенерировать номер КП: КП-2026-0001 */
async function generateNumber(kpType: KpType): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = kpType === 'standard' ? 'КП' : kpType === 'response' ? 'КО' : 'КП';

  const last = await KpModel.findOne({
    'metadata.number': { $regex: `^${prefix}-${year}-` },
  })
    .sort({ 'metadata.number': -1 })
    .select('metadata.number');

  let seq = 1;
  if (last) {
    const parts = last.metadata.number.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
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
  if (!doc) throw new NotFoundError('Kp', id);
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
    throw new ValidationError('title, recipient, and companySnapshot are required');
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
  if (!existing) throw new NotFoundError('Kp', id);
  if (existing.status !== 'draft') {
    throw new ForbiddenError('Only draft KPs can be edited');
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
  if (!doc) throw new NotFoundError('Kp', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await KpModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Kp', id);
}

// ---- Status transitions ----

export async function changeStatus(id: string, newStatus: KpStatus, userId: string): Promise<IKp> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('Kp', id);

  const allowed = KP_STATUS_TRANSITIONS[doc.status as KpStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(`Cannot transition from '${doc.status}' to '${newStatus}'`);
  }

  const currentVersion = (doc.versions?.length ?? 0) + 1;

  const updated = await KpModel.findByIdAndUpdate(
    id,
    {
      $set: { status: newStatus },
      $push: {
        versions: {
          version: currentVersion,
          createdAt: new Date().toISOString(),
          status: newStatus,
          number: doc.metadata.number,
          title: doc.title,
          changedBy: userId,
        },
      },
    },
    { new: true },
  );

  if (!updated) throw new NotFoundError('Kp', id);
  return toJSON(updated);
}

// ---- Calculations ----

export async function recalculate(id: string): Promise<{ totalAmount: number; items: IKpItem[] }> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('Kp', id);

  const items = doc.items.map((item) => ({
    ...item,
    effectivePrice: item.effectivePrice ?? calcEffectivePrice(item),
  }));

  const totalAmount = calcTotal(items);
  return { totalAmount, items };
}
