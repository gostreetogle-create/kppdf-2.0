import { WorkTaskModel, IWorkTaskDocument } from './work-task.model';

export async function getByOrderItem(orderItemId: string): Promise<IWorkTaskDocument[]> {
  return WorkTaskModel.find({ orderItemId }).sort({ startDate: 1 });
}

export async function getByOrder(orderItemIds: string[]): Promise<IWorkTaskDocument[]> {
  return WorkTaskModel.find({ orderItemId: { $in: orderItemIds } }).sort({ startDate: 1 });
}

export async function create(data: Partial<IWorkTaskDocument>): Promise<IWorkTaskDocument> {
  return WorkTaskModel.create(data);
}

export async function update(id: string, data: Partial<IWorkTaskDocument>): Promise<IWorkTaskDocument> {
  const doc = await WorkTaskModel.findById(id);
  if (!doc) throw new Error('Производственное задание не найдено');
  Object.assign(doc, data);
  return doc.save();
}

export async function remove(id: string): Promise<void> {
  await WorkTaskModel.findByIdAndDelete(id);
}
