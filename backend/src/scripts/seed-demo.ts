import '../core/config';
import mongoose from 'mongoose';
import { config } from '../core/config';
import { UserModel } from '../modules/auth/auth.model';
import { ProductModel } from '../modules/product/product.model';
import { CounterpartyModel } from '../modules/counterparty/counterparty.model';
import { SettingModel } from '../modules/settings/settings.model';
import bcrypt from 'bcryptjs';

async function seed(): Promise<void> {
  await mongoose.connect(config.mongo.uri);
  console.log('[Seed] Connected to MongoDB');

  // 1. Users
  const adminExists = await UserModel.findOne({ username: 'admin' });
  if (!adminExists) {
    await UserModel.create({
      username: 'admin',
      email: 'admin@kppdf.local',
      displayName: 'Главный администратор',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'owner',
      isActive: true,
    });
    console.log('[Seed] Admin created');
  }

  const mgrExists = await UserModel.findOne({ username: 'manager' });
  if (!mgrExists) {
    await UserModel.create({
      username: 'manager',
      email: 'manager@kppdf.local',
      displayName: 'Менеджер',
      passwordHash: await bcrypt.hash('manager123', 12),
      role: 'manager',
      isActive: true,
    });
    console.log('[Seed] Manager created');
  }

  // 2. Products
  const productCount = await ProductModel.countDocuments();
  if (productCount === 0) {
    await ProductModel.insertMany([
      { name: 'Шкаф металлический', code: 'ШМ-01', description: 'Шкаф для инструментов', price: 45000, unit: 'шт', kind: 'ITEM', images: [], isActive: true },
      { name: 'Стеллаж полочный', code: 'СП-02', description: 'Стеллаж 2м', price: 28000, unit: 'шт', kind: 'ITEM', images: [], isActive: true },
      { name: 'Монтаж оборудования', code: 'МОНТ-01', description: 'Шеф-монтаж', price: 150000, unit: 'усл', kind: 'SERVICE', images: [], isActive: true },
      { name: 'Разработка КД', code: 'КД-01', description: 'Конструкторская документация', price: 80000, unit: 'компл', kind: 'WORK', images: [], isActive: true },
    ]);
    console.log('[Seed] Products created');
  }

  // 3. Counterparties
  const cpCount = await CounterpartyModel.countDocuments();
  if (cpCount === 0) {
    await CounterpartyModel.insertMany([
      {
        name: 'ООО "ТехноСтрой"',
        shortName: 'ТехноСтрой',
        legalForm: 'ООО',
        roles: ['client'],
        inn: '7701123456',
        kpp: '770101001',
        ogrn: '1027700123456',
        legalAddress: 'г. Москва, ул. Строителей, д. 10',
        phone: '+7 (495) 123-45-67',
        email: 'info@technostroy.ru',
        isActive: true,
      },
      {
        name: 'АО "МеталлИнвест"',
        shortName: 'МеталлИнвест',
        legalForm: 'АО',
        roles: ['client'],
        inn: '7702123456',
        kpp: '770201001',
        ogrn: '1027700654321',
        legalAddress: 'г. Москва, ул. Заводская, д. 5',
        phone: '+7 (495) 765-43-21',
        email: 'sales@metallinvest.ru',
        isActive: true,
      },
      {
        name: 'ООО "КППДФ"',
        shortName: 'КППДФ',
        legalForm: 'ООО',
        roles: ['company'],
        isOurCompany: true,
        isDefaultInitiator: true,
        inn: '7703123456',
        kpp: '770301001',
        ogrn: '1027700987654',
        legalAddress: 'г. Москва, ул. Программная, д. 42',
        phone: '+7 (495) 333-22-11',
        email: 'hello@kppdf.ru',
        bankName: 'АО "Банк Программный"',
        bik: '044525999',
        checkingAccount: '40702810123450000001',
        correspondentAccount: '30101810123450000001',
        isActive: true,
      },
    ]);
    console.log('[Seed] Counterparties created');
  }

  // 4. Settings
  const settingCount = await SettingModel.countDocuments();
  if (settingCount === 0) {
    await SettingModel.insertMany([
      { key: 'kp_validity_days', value: 30, label: 'Срок действия КП (дней)', group: 'kp' },
      { key: 'kp_prepayment_percent', value: 50, label: 'Предоплата по умолчанию (%)', group: 'kp' },
      { key: 'kp_production_days', value: 30, label: 'Срок производства (дней)', group: 'kp' },
      { key: 'kp_vat_percent', value: 20, label: 'НДС по умолчанию (%)', group: 'kp' },
      { key: 'passport_warranty_text', value: 'Гарантия 12 месяцев с даты отгрузки', label: 'Текст гарантии (паспорт)', group: 'passport' },
      { key: 'passport_storage_text', value: 'Хранить в сухом месте при t от +5 до +40°C', label: 'Текст условий хранения (паспорт)', group: 'passport' },
    ]);
    console.log('[Seed] Settings created');
  }

  await mongoose.disconnect();
  console.log('[Seed] Done! Логины: admin/admin123, manager/manager123');
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
