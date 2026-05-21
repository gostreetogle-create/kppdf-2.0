import { WorkTypeModel, IWorkTypeDocument } from './work-type.model';

export async function getAll(): Promise<IWorkTypeDocument[]> {
  return WorkTypeModel.find().sort({ section: 1, sortOrder: 1 });
}

export async function create(data: Partial<IWorkTypeDocument>): Promise<IWorkTypeDocument> {
  return WorkTypeModel.create(data);
}

export async function update(name: string, data: Partial<IWorkTypeDocument>): Promise<IWorkTypeDocument> {
  const doc = await WorkTypeModel.findOne({ name });
  if (!doc) throw new Error('WorkType not found');
  Object.assign(doc, data);
  return doc.save();
}

export async function remove(name: string): Promise<void> {
  await WorkTypeModel.deleteOne({ name });
}
