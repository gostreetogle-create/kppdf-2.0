import { EntityStatusModel, IEntityStatusDocument } from './entity-status.model';
import { NotFoundError, ValidationError, ConflictError } from '../../shared/errors';

export async function getByEntityType(entityType: string): Promise<IEntityStatusDocument[]> {
  return EntityStatusModel.find({ entityType }).sort({ sortOrder: 1 });
}

export async function getInitial(entityType: string): Promise<IEntityStatusDocument | null> {
  return EntityStatusModel.findOne({ entityType, isInitial: true });
}

export async function create(
  data: Partial<IEntityStatusDocument>,
): Promise<IEntityStatusDocument> {
  const existing = await EntityStatusModel.findOne({
    entityType: data.entityType,
    statusId: data.statusId,
  });
  if (existing) {
    throw new ConflictError(
      `Статус '${data.statusId}' уже существует для сущности '${data.entityType}'`,
    );
  }

  // Если это первый isInitial для entityType — разрешаем
  // Если новый тоже isInitial — сбрасываем старый
  if (data.isInitial) {
    await EntityStatusModel.updateMany(
      { entityType: data.entityType, isInitial: true },
      { isInitial: false },
    );
  }

  return EntityStatusModel.create(data);
}

export async function update(
  entityType: string,
  statusId: string,
  data: Partial<IEntityStatusDocument>,
): Promise<IEntityStatusDocument> {
  const doc = await EntityStatusModel.findOne({ entityType, statusId });
  if (!doc) {
    throw new NotFoundError('Статус сущности', `${entityType}:${statusId}`);
  }

  // Меняем isInitial
  if (data.isInitial !== undefined && data.isInitial) {
    await EntityStatusModel.updateMany(
      { entityType, isInitial: true, _id: { $ne: doc._id } },
      { isInitial: false },
    );
  }

  Object.assign(doc, data);
  return doc.save();
}

export async function remove(entityType: string, statusId: string): Promise<void> {
  const doc = await EntityStatusModel.findOne({ entityType, statusId });
  if (!doc) {
    throw new NotFoundError('Статус сущности', `${entityType}:${statusId}`);
  }

  // В будущем здесь будет проверка countDocuments по сущностям
  // пока просто удаляем — UI будет предупреждать

  await doc.deleteOne();
}
