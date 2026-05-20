import { SettingModel, ISettingDocument } from './settings.model';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { ISetting, ISettingsMap } from '@shared/types/settings.interface';

function toJSON(doc: ISettingDocument): ISetting {
  return {
    _id: doc._id.toString(),
    key: doc.key,
    value: doc.value,
    label: doc.label,
    description: doc.description,
    group: doc.group,
    updatedAt: (doc as any).updatedAt?.toISOString(),
  };
}

export async function getAll(): Promise<ISetting[]> {
  const docs = await SettingModel.find().sort({ group: 1, key: 1 });
  return docs.map(toJSON);
}

export async function getByGroup(group: string): Promise<ISetting[]> {
  const docs = await SettingModel.find({ group }).sort({ key: 1 });
  return docs.map(toJSON);
}

export async function getByKey(key: string): Promise<ISetting> {
  const doc = await SettingModel.findOne({ key });
  if (!doc) throw new NotFoundError('Setting', key);
  return toJSON(doc);
}

export async function getMap(): Promise<ISettingsMap> {
  const docs = await SettingModel.find();
  const map: any = {};
  for (const doc of docs) {
    map[doc.key] = doc.value;
  }
  return map as ISettingsMap;
}

export async function upsert(data: { key: string; value: unknown; label?: string; description?: string; group?: string }): Promise<ISetting> {
  if (!data.key) throw new ValidationError('key is required');

  const doc = await SettingModel.findOneAndUpdate(
    { key: data.key },
    {
      $set: {
        value: data.value,
        ...(data.label && { label: data.label }),
        ...(data.description && { description: data.description }),
        ...(data.group && { group: data.group }),
      },
    },
    { upsert: true, new: true },
  );

  return toJSON(doc);
}

export async function remove(key: string): Promise<void> {
  const doc = await SettingModel.findOneAndDelete({ key });
  if (!doc) throw new NotFoundError('Setting', key);
}

/** Начальная инициализация настроек по умолчанию */
export async function seedDefaults(): Promise<void> {
  const defaults: Array<{ key: string; value: unknown; label: string; group: string }> = [
    { key: 'kp_validity_days', value: 30, label: 'Срок действия КП (дней)', group: 'kp' },
    { key: 'kp_prepayment_percent', value: 50, label: 'Предоплата по умолчанию (%)', group: 'kp' },
    { key: 'kp_production_days', value: 30, label: 'Срок производства (дней)', group: 'kp' },
    { key: 'kp_vat_percent', value: 20, label: 'НДС по умолчанию (%)', group: 'kp' },
    { key: 'passport_warranty_text', value: 'Гарантия 12 месяцев с даты отгрузки', label: 'Текст гарантии (паспорт)', group: 'passport' },
    { key: 'passport_storage_text', value: 'Хранить в сухом месте при t от +5 до +40°C', label: 'Текст условий хранения (паспорт)', group: 'passport' },
  ];

  for (const s of defaults) {
    await SettingModel.findOneAndUpdate(
      { key: s.key },
      { $setOnInsert: s },
      { upsert: true },
    );
  }

  console.log('[Seed] Default settings created');
}
