import { RoleModel, IRoleDocument } from './role.model';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors';

export async function getAll(): Promise<IRoleDocument[]> {
  return RoleModel.find().sort({ sortOrder: 1 });
}

export async function getByName(name: string): Promise<IRoleDocument | null> {
  return RoleModel.findOne({ name });
}

export async function create(data: Partial<IRoleDocument>): Promise<IRoleDocument> {
  const existing = await RoleModel.findOne({ name: data.name });
  if (existing) {
    throw new ConflictError(`Роль '${data.name}' уже существует`);
  }
  return RoleModel.create(data);
}

export async function update(name: string, data: Partial<IRoleDocument>): Promise<IRoleDocument> {
  const doc = await RoleModel.findOne({ name });
  if (!doc) {
    throw new NotFoundError('Роль', name);
  }
  if (doc.isSystem) {
    // Системные роли можно менять частично (label, permissions), но не name
    if (data.name && data.name !== name) {
      throw new ValidationError('Нельзя переименовать системную роль');
    }
  }
  Object.assign(doc, data);
  return doc.save();
}

export async function remove(name: string): Promise<void> {
  const doc = await RoleModel.findOne({ name });
  if (!doc) {
    throw new NotFoundError('Роль', name);
  }
  if (doc.isSystem) {
    throw new ValidationError('Нельзя удалить системную роль');
  }
  await doc.deleteOne();
}
