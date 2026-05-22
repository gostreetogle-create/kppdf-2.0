import { CounterpartyModel, ICounterpartyDocument } from './counterparty.model';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { ICounterparty, CounterpartyRole } from '@shared/types/counterparty.interface';

function toJSON(doc: ICounterpartyDocument): ICounterparty {
  return doc.toJSON() as unknown as ICounterparty;
}

export async function getAll(filters?: {
  role?: CounterpartyRole;
  isOurCompany?: boolean;
  isActive?: boolean;
  search?: string;
}): Promise<ICounterparty[]> {
  const query: any = {};

  if (filters?.role) query.roles = filters.role;
  if (filters?.isOurCompany !== undefined) query.isOurCompany = filters.isOurCompany;
  if (filters?.isActive !== undefined) query.isActive = filters.isActive;
  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { inn: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const docs = await CounterpartyModel.find(query).sort({ name: 1 });
  return docs.map(toJSON);
}

export async function getById(id: string): Promise<ICounterparty> {
  const doc = await CounterpartyModel.findById(id);
  if (!doc) throw new NotFoundError('Контрагент', id);
  return toJSON(doc);
}

export async function create(data: Omit<ICounterparty, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICounterparty> {
  if (!data.name || !data.legalForm) {
    throw new ValidationError('name и legalForm обязательны для заполнения');
  }
  const doc = await CounterpartyModel.create(data);
  return toJSON(doc);
}

export async function update(id: string, data: Partial<Omit<ICounterparty, '_id' | 'createdAt' | 'updatedAt'>>): Promise<ICounterparty> {
  const doc = await CounterpartyModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('Контрагент', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await CounterpartyModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Контрагент', id);
}

export async function getOurCompanies(): Promise<ICounterparty[]> {
  const docs = await CounterpartyModel.find({ isOurCompany: true, isActive: true });
  return docs.map(toJSON);
}

export async function getDefaultInitiator(): Promise<ICounterparty | null> {
  const doc = await CounterpartyModel.findOne({ isDefaultInitiator: true, isActive: true });
  return doc ? toJSON(doc) : null;
}
