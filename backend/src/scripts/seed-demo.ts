import '../core/config';
import mongoose from 'mongoose';
import { config } from '../core/config';
import { UserModel } from '../modules/auth/auth.model';
import { ProductModel } from '../modules/product/product.model';
import { CounterpartyModel } from '../modules/counterparty/counterparty.model';
import { SettingModel } from '../modules/settings/settings.model';
import { RoleModel } from '../modules/role/role.model';
import { WorkTypeModel } from '../modules/work-type/work-type.model';
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

  // 1.5. Roles
  const roleCount = await RoleModel.countDocuments();
  if (roleCount === 0) {
    await RoleModel.insertMany([
      { name: 'director', label: 'Директор', description: 'Полный доступ ко всем функциям', permissions: [
        'order.view','order.create','order.edit','order.delete','order.status',
        'product.view','product.create','product.edit','product.delete',
        'counterparty.view','counterparty.create','counterparty.edit','counterparty.delete',
        'kp.view','kp.create','kp.edit','kp.delete','kp.accept',
        'task.view','task.create','task.edit','task.complete',
        'material.view','material.request','material.approve',
        'settings.view','settings.edit','statuses.edit','roles.edit',
      ], isSystem: true, sortOrder: 10 },
      { name: 'admin', label: 'Администратор', description: 'Управление системой без удаления', permissions: [
        'order.view','order.create','order.edit','order.status',
        'product.view','product.create','product.edit','product.delete',
        'counterparty.view','counterparty.create','counterparty.edit','counterparty.delete',
        'kp.view','kp.create','kp.edit','kp.delete','kp.accept',
        'task.view','task.create','task.edit','task.complete',
        'material.view','material.request','material.approve',
        'settings.view','settings.edit','statuses.edit',
      ], isSystem: true, sortOrder: 20 },
      { name: 'manager', label: 'Менеджер', description: 'Работа с заказами и КП', permissions: [
        'order.view','order.create','order.edit',
        'product.view','product.create','product.edit',
        'counterparty.view','counterparty.create','counterparty.edit',
        'kp.view','kp.create','kp.edit','kp.accept',
        'task.view','task.create','task.edit',
        'material.view','material.request',
        'settings.view',
      ], isSystem: true, sortOrder: 30 },
      { name: 'viewer', label: 'Наблюдатель', description: 'Только просмотр', permissions: [
        'order.view','product.view','counterparty.view','kp.view','task.view','material.view','settings.view',
      ], isSystem: true, sortOrder: 40 },
    ]);
    console.log('[Seed] Roles created');
  }

  // 1.6. EntityStatuses — Статусы для всех типов сущностей
  const { EntityStatusModel } = await import('../modules/entity-status/entity-status.model');

  // Статусы заказов
  if ((await EntityStatusModel.countDocuments({ entityType: 'ORDER' })) === 0) {
    await EntityStatusModel.insertMany([
      { entityType: 'ORDER', statusId: 'draft',             label: 'Черновик',              color: '#9ca3af', isInitial: true,  isFinal: false, sortOrder: 10 },
      { entityType: 'ORDER', statusId: 'sent',              label: 'Отправлен',             color: '#60a5fa', isInitial: false, isFinal: false, sortOrder: 20 },
      { entityType: 'ORDER', statusId: 'confirmed',         label: 'Подтверждён',           color: '#34d399', isInitial: false, isFinal: false, sortOrder: 30 },
      { entityType: 'ORDER', statusId: 'in_production',     label: 'В производстве',        color: '#fbbf24', isInitial: false, isFinal: false, sortOrder: 40 },
      { entityType: 'ORDER', statusId: 'completed',         label: 'Выполнен',              color: '#22c55e', isInitial: false, isFinal: true,  sortOrder: 50 },
      { entityType: 'ORDER', statusId: 'cancelled',         label: 'Отменён',               color: '#ef4444', isInitial: false, isFinal: true,  sortOrder: 60 },
    ]);
    console.log('[Seed] Order statuses created');
  }

  // Статусы КП
  if ((await EntityStatusModel.countDocuments({ entityType: 'KP' })) === 0) {
    await EntityStatusModel.insertMany([
      { entityType: 'KP', statusId: 'draft',       label: 'Черновик',      color: '#9ca3af', isInitial: true,  isFinal: false, sortOrder: 10 },
      { entityType: 'KP', statusId: 'sent',        label: 'Отправлено',    color: '#60a5fa', isInitial: false, isFinal: false, sortOrder: 20 },
      { entityType: 'KP', statusId: 'approved',    label: 'Согласовано',   color: '#34d399', isInitial: false, isFinal: false, sortOrder: 30 },
      { entityType: 'KP', statusId: 'rejected',    label: 'Отклонено',     color: '#ef4444', isInitial: false, isFinal: true,  sortOrder: 40 },
      { entityType: 'KP', statusId: 'converted',   label: 'Преобразован в заказ', color: '#8b5cf6', isInitial: false, isFinal: true, sortOrder: 50 },
    ]);
    console.log('[Seed] KP statuses created');
  }

  // Статусы позиций заказа
  if ((await EntityStatusModel.countDocuments({ entityType: 'ORDER_ITEM' })) === 0) {
    await EntityStatusModel.insertMany([
      { entityType: 'ORDER_ITEM', statusId: 'pending',      label: 'Ожидает',          color: '#9ca3af', isInitial: true,  isFinal: false, sortOrder: 10 },
      { entityType: 'ORDER_ITEM', statusId: 'in_progress',  label: 'В работе',         color: '#fbbf24', isInitial: false, isFinal: false, sortOrder: 20 },
      { entityType: 'ORDER_ITEM', statusId: 'completed',    label: 'Готово',           color: '#22c55e', isInitial: false, isFinal: true,  sortOrder: 30 },
      { entityType: 'ORDER_ITEM', statusId: 'cancelled',    label: 'Отменена',         color: '#ef4444', isInitial: false, isFinal: true,  sortOrder: 40 },
    ]);
    console.log('[Seed] OrderItem statuses created');
  }

  // Статусы производственных заданий
  if ((await EntityStatusModel.countDocuments({ entityType: 'WORK_TASK' })) === 0) {
    await EntityStatusModel.insertMany([
      { entityType: 'WORK_TASK', statusId: 'new',           label: 'Новое',            color: '#9ca3af', isInitial: true,  isFinal: false, sortOrder: 10 },
      { entityType: 'WORK_TASK', statusId: 'assigned',      label: 'Назначено',        color: '#60a5fa', isInitial: false, isFinal: false, sortOrder: 20 },
      { entityType: 'WORK_TASK', statusId: 'in_progress',   label: 'В работе',         color: '#fbbf24', isInitial: false, isFinal: false, sortOrder: 30 },
      { entityType: 'WORK_TASK', statusId: 'completed',     label: 'Выполнено',        color: '#22c55e', isInitial: false, isFinal: true,  sortOrder: 40 },
      { entityType: 'WORK_TASK', statusId: 'cancelled',     label: 'Отменено',         color: '#ef4444', isInitial: false, isFinal: true,  sortOrder: 50 },
    ]);
    console.log('[Seed] WorkTask statuses created');
  }

  // Статусы заявок на материалы
  if ((await EntityStatusModel.countDocuments({ entityType: 'MATERIAL_REQUEST' })) === 0) {
    await EntityStatusModel.insertMany([
      { entityType: 'MATERIAL_REQUEST', statusId: 'new',        label: 'Новая',           color: '#9ca3af', isInitial: true,  isFinal: false, sortOrder: 10 },
      { entityType: 'MATERIAL_REQUEST', statusId: 'approved',   label: 'Согласована',     color: '#34d399', isInitial: false, isFinal: false, sortOrder: 20 },
      { entityType: 'MATERIAL_REQUEST', statusId: 'ordered',    label: 'Заказано',        color: '#60a5fa', isInitial: false, isFinal: false, sortOrder: 30 },
      { entityType: 'MATERIAL_REQUEST', statusId: 'received',   label: 'Получено',        color: '#22c55e', isInitial: false, isFinal: true,  sortOrder: 40 },
      { entityType: 'MATERIAL_REQUEST', statusId: 'cancelled',  label: 'Отменена',        color: '#ef4444', isInitial: false, isFinal: true,  sortOrder: 50 },
    ]);
    console.log('[Seed] MaterialRequest statuses created');
  }

  // Статусы товаров
  if ((await EntityStatusModel.countDocuments({ entityType: 'PRODUCT' })) === 0) {
    await EntityStatusModel.insertMany([
      { entityType: 'PRODUCT', statusId: 'active',     label: 'Активен',         color: '#22c55e', isInitial: true,  isFinal: false, sortOrder: 10 },
      { entityType: 'PRODUCT', statusId: 'archived',   label: 'В архиве',        color: '#9ca3af', isInitial: false, isFinal: false, sortOrder: 20 },
      { entityType: 'PRODUCT', statusId: 'discontinued', label: 'Снят с производства', color: '#ef4444', isInitial: false, isFinal: true, sortOrder: 30 },
    ]);
    console.log('[Seed] Product statuses created');
  }

  // 1.75. WorkTypes
  const wtCount = await WorkTypeModel.countDocuments();
  if (wtCount === 0) {
    await WorkTypeModel.insertMany([
      { name: 'welding', label: 'Сварка', section: 'work', icon: 'pi pi-wrench', sortOrder: 10, color: '#6366f1' },
      { name: 'assembly', label: 'Сборка', section: 'work', icon: 'pi pi-cog', sortOrder: 20, color: '#8b5cf6' },
      { name: 'painting', label: 'Покраска', section: 'work', icon: 'pi pi-palette', sortOrder: 30, color: '#ec4899' },
      { name: 'electrical', label: 'Электромонтаж', section: 'task', icon: 'pi pi-bolt', sortOrder: 10, color: '#14b8a6' },
      { name: 'design', label: 'Проектирование', section: 'task', icon: 'pi pi-pencil', sortOrder: 20, color: '#f97316' },
      { name: 'drafting', label: 'Разработка КД', section: 'drawing', icon: 'pi pi-file-pdf', sortOrder: 10, color: '#0ea5e9' },
    ]);
    console.log('[Seed] WorkTypes created');
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

  // 4. Settings (с upsert — всегда обновляем, если ключ уже есть)
  const defaultSettings = [
    { key: 'kp_validity_days', value: 30, label: 'Срок действия КП (дней)', group: 'kp' },
    { key: 'kp_prepayment_percent', value: 50, label: 'Предоплата по умолчанию (%)', group: 'kp' },
    { key: 'kp_production_days', value: 30, label: 'Срок производства (дней)', group: 'kp' },
    { key: 'kp_vat_percent', value: 20, label: 'НДС по умолчанию (%)', group: 'kp' },
    { key: 'passport_warranty_text', value: 'Гарантия 12 месяцев с даты отгрузки', label: 'Текст гарантии (паспорт)', group: 'passport' },
    { key: 'passport_storage_text', value: 'Хранить в сухом месте при t от +5 до +40°C', label: 'Текст условий хранения (паспорт)', group: 'passport' },
    { key: 'product_units', value: '["шт","м","кг","л","усл.","компл","м²","м³","уп.","пач.","рул.","лист"]', label: 'Единицы измерения товаров', group: 'product' },
    { key: 'product_categories', value: '[{"id":"oborudovanie","name":"Оборудование","subcategories":[{"id":"stanki","name":"Станки"},{"id":"instrument","name":"Инструмент"},{"id":"izmeritelnoe","name":"Измерительное"},{"id":"kompressory","name":"Компрессоры"},{"id":"nasosy","name":"Насосы"},{"id":"prochee-oborud","name":"Прочее"}]},{"id":"raskhodnye-materialy","name":"Расходные материалы","subcategories":[{"id":"kantselyariya","name":"Канцелярия"},{"id":"khoztovary","name":"Хозтовары"},{"id":"smazochnye","name":"Смазочные материалы"},{"id":"filtry","name":"Фильтры"},{"id":"prochee-raskh","name":"Прочее"}]},{"id":"uslugi","name":"Услуги","subcategories":[{"id":"montazh","name":"Монтаж"},{"id":"naladka","name":"Наладка"},{"id":"remont","name":"Ремонт"},{"id":"obsluzhivanie","name":"Обслуживание"},{"id":"konsultatsiya","name":"Консультация"},{"id":"prochee-usl","name":"Прочее"}]},{"id":"programmnoe-obespechenie","name":"Программное обеспечение","subcategories":[{"id":"litsenzii","name":"Лицензии"},{"id":"podpiski","name":"Подписки"},{"id":"razrabotka","name":"Разработка"},{"id":"integratsiya","name":"Интеграция"},{"id":"prochee-po","name":"Прочее"}]},{"id":"prochee","name":"Прочее","subcategories":[{"id":"prochee-proch","name":"Прочее"}]}]', label: 'Категории товаров', group: 'product' },
  ];
  for (const s of defaultSettings) {
    await SettingModel.updateOne({ key: s.key }, { $set: s }, { upsert: true });
  }
  console.log('[Seed] Settings synced');

  await mongoose.disconnect();
  console.log('[Seed] Done! Логины: admin/admin123, manager/manager123');
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
