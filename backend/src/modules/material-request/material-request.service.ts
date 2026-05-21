import { MaterialRequestModel, IMaterialRequestDocument } from './material-request.model';

export async function getByOrder(orderId: string): Promise<IMaterialRequestDocument[]> {
  return MaterialRequestModel.find({ orderId }).sort({ neededAt: 1 });
}

export async function getByOrderItem(orderItemId: string): Promise<IMaterialRequestDocument[]> {
  return MaterialRequestModel.find({ orderItemId }).sort({ neededAt: 1 });
}

export async function create(data: Partial<IMaterialRequestDocument>): Promise<IMaterialRequestDocument> {
  return MaterialRequestModel.create(data);
}

export async function update(id: string, data: Partial<IMaterialRequestDocument>): Promise<IMaterialRequestDocument> {
  const doc = await MaterialRequestModel.findById(id);
  if (!doc) throw new Error('MaterialRequest not found');
  Object.assign(doc, data);
  return doc.save();
}

export async function approve(id: string, approvedQuantity: number, approvedBy: string): Promise<IMaterialRequestDocument> {
  const doc = await MaterialRequestModel.findById(id);
  if (!doc) throw new Error('MaterialRequest not found');
  doc.approvedQuantity = approvedQuantity;
  doc.approvedBy = approvedBy;
  doc.statusId = 'approved';
  return doc.save();
}

export async function remove(id: string): Promise<void> {
  await MaterialRequestModel.findByIdAndDelete(id);
}
