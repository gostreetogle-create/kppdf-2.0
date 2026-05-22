import { DocumentTemplateModel, IDocumentTemplateDocument } from './document-template.model';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { IDocumentTemplate, CreateDocumentTemplateDto } from '@shared/types/document.types';

function toJSON(doc: IDocumentTemplateDocument): IDocumentTemplate {
  return {
    id: doc._id.toString(),
    name: doc.name,
    documentType: doc.documentType,
    description: doc.description,
    backgroundImage: doc.backgroundImage,
    pages: doc.pages,
    isDefault: doc.isDefault,
    createdAt: (doc as any).createdAt?.toISOString(),
    updatedAt: (doc as any).updatedAt?.toISOString(),
  };
}

export async function getAll(): Promise<IDocumentTemplate[]> {
  const docs = await DocumentTemplateModel.find().sort({ documentType: 1, name: 1 });
  return docs.map(toJSON);
}

export async function getByType(documentType: string): Promise<IDocumentTemplate[]> {
  const docs = await DocumentTemplateModel.find({ documentType }).sort({ name: 1 });
  return docs.map(toJSON);
}

export async function getById(id: string): Promise<IDocumentTemplate> {
  const doc = await DocumentTemplateModel.findById(id);
  if (!doc) throw new NotFoundError('Шаблон документа', id);
  return toJSON(doc);
}

export async function create(data: CreateDocumentTemplateDto): Promise<IDocumentTemplate> {
  if (!data.name) throw new ValidationError('Название шаблона обязательно');
  if (!data.backgroundImage) throw new ValidationError('Фоновое изображение обязательно');

  // Если isDefault — сбросить у других шаблонов этого типа
  if (data.isDefault) {
    await DocumentTemplateModel.updateMany(
      { documentType: data.documentType, isDefault: true },
      { $set: { isDefault: false } },
    );
  }

  const doc = await DocumentTemplateModel.create({
    name: data.name,
    documentType: data.documentType,
    backgroundImage: data.backgroundImage,
    pages: data.pages ?? [{ pageNumber: 1, overlays: [] }],
    isDefault: data.isDefault ?? false,
    description: data.description,
  });

  return toJSON(doc);
}

export async function update(id: string, data: Partial<CreateDocumentTemplateDto>): Promise<IDocumentTemplate> {
  const doc = await DocumentTemplateModel.findById(id);
  if (!doc) throw new NotFoundError('Шаблон документа', id);

  if (data.name !== undefined) doc.name = data.name;
  if (data.documentType !== undefined) doc.documentType = data.documentType;
  if (data.backgroundImage !== undefined) doc.backgroundImage = data.backgroundImage;
  if (data.description !== undefined) doc.description = data.description;
  if (data.pages !== undefined) doc.pages = data.pages;

  if (data.isDefault === true) {
    await DocumentTemplateModel.updateMany(
      { documentType: doc.documentType, isDefault: true, _id: { $ne: doc._id } },
      { $set: { isDefault: false } },
    );
    doc.isDefault = true;
  } else if (data.isDefault === false) {
    doc.isDefault = false;
  }

  await doc.save();
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await DocumentTemplateModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Шаблон документа', id);
}
