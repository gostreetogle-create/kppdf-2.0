# Шаг A5-A6: Модули Product + Counterparty

## Product module

```
backend/src/modules/product/
├── product.model.ts       # Mongoose schema
├── product.service.ts     # CRUD + поиск
├── product.controller.ts
├── product.routes.ts      # /api/products
└── product.errors.ts
```

### product.model.ts

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import type { IProduct, ProductKind } from '@shared/types/product.interface';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: 'шт' },
    kind: { type: String, enum: ['ITEM', 'SERVICE', 'WORK'], default: 'ITEM' },
    images: [{ type: String }],
    category: { type: String },
    subcategory: { type: String },
    specId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', code: 1 });
productSchema.index({ kind: 1, isActive: 1 });

export const ProductModel = mongoose.model<IProductDocument>('Product', productSchema);
```

### product.service.ts

```typescript
import { ProductModel } from './product.model';
import { NotFoundError } from '../../shared/errors';
import type { IProduct } from '@shared/types/product.interface';

function toJSON(doc: any): IProduct {
  return { ...doc.toObject(), _id: doc._id.toString() };
}

export async function getAll(filter?: { kind?: string; isActive?: boolean; search?: string }): Promise<IProduct[]> {
  const query: any = {};
  if (filter?.kind) query.kind = filter.kind;
  if (filter?.isActive !== undefined) query.isActive = filter.isActive;
  if (filter?.search) query.$text = { $search: filter.search };

  const docs = await ProductModel.find(query).sort({ createdAt: -1 });
  return docs.map(toJSON);
}

export async function getById(id: string): Promise<IProduct> {
  const doc = await ProductModel.findById(id);
  if (!doc) throw new NotFoundError('Product', id);
  return toJSON(doc);
}

export async function create(data: Partial<IProduct>): Promise<IProduct> {
  const doc = await ProductModel.create(data);
  return toJSON(doc);
}

export async function update(id: string, data: Partial<IProduct>): Promise<IProduct> {
  const doc = await ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('Product', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await ProductModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Product', id);
}
```

### product.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { kind, search, isActive } = req.query;
    const products = await productService.getAll({
      kind: kind as string,
      search: search as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.getById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
```

### product.routes.ts

```typescript
import { Router } from 'express';
import * as productController from './product.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { requirePermission } from '../../shared/middleware/permission.guard';

const router = Router();
router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', requirePermission('products.*'), productController.create);
router.patch('/:id', requirePermission('products.*'), productController.update);
router.delete('/:id', requirePermission('products.*'), productController.remove);

export default router;
```

---

## Counterparty module

```
backend/src/modules/counterparty/
├── counterparty.model.ts
├── counterparty.service.ts
├── counterparty.controller.ts
├── counterparty.routes.ts  # /api/counterparties
└── counterparty.errors.ts
```

### counterparty.model.ts

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import type { ICounterparty, CounterpartyLegalForm, CounterpartyRole } from '@shared/types/counterparty.interface';

export interface ICounterpartyDocument extends Omit<ICounterparty, '_id'>, Document {}

const brandingTemplateSchema = new Schema({
  templateKey: { type: String, required: true },
  templateName: { type: String, required: true },
  kpType: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  assets: {
    kpPage1: { type: String, default: '' },
    kpPage2: { type: String },
    passport: { type: String },
    appendix: { type: String },
  },
  texts: {
    headerNote: { type: String },
    introText: { type: String },
    footerText: { type: String },
    closingText: { type: String },
  },
  conditions: [{ type: String }],
});

const counterpartySchema = new Schema<ICounterpartyDocument>(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    legalForm: { type: String, enum: ['ООО', 'ИП', 'АО', 'ПАО', 'МКУ', 'Физлицо', 'Другое'], default: 'ООО' },
    roles: [{ type: String, enum: ['client', 'supplier', 'company'] }],
    isOurCompany: { type: Boolean, default: false },
    isDefaultInitiator: { type: Boolean, default: false },
    inn: { type: String, trim: true },
    kpp: { type: String, trim: true },
    ogrn: { type: String, trim: true },
    legalAddress: { type: String },
    phone: { type: String },
    email: { type: String },
    bankName: { type: String },
    bik: { type: String },
    checkingAccount: { type: String },
    correspondentAccount: { type: String },
    founderName: { type: String },
    founderNameShort: { type: String },
    brandingTemplates: [brandingTemplateSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

counterpartySchema.index({ name: 'text', inn: 1 });
counterpartySchema.index({ roles: 1 });

export const CounterpartyModel = mongoose.model<ICounterpartyDocument>('Counterparty', counterpartySchema);
```

### counterparty.service.ts

```typescript
import { CounterpartyModel } from './counterparty.model';
import { NotFoundError } from '../../shared/errors';
import type { ICounterparty } from '@shared/types/counterparty.interface';

function toJSON(doc: any): ICounterparty {
  return { ...doc.toObject(), _id: doc._id.toString() };
}

export async function getAll(filter?: { role?: string; isActive?: boolean; search?: string }): Promise<ICounterparty[]> {
  const query: any = {};
  if (filter?.role) query.roles = filter.role;
  if (filter?.isActive !== undefined) query.isActive = filter.isActive;
  if (filter?.search) query.$text = { $search: filter.search };

  const docs = await CounterpartyModel.find(query).sort({ name: 1 });
  return docs.map(toJSON);
}

export async function getById(id: string): Promise<ICounterparty> {
  const doc = await CounterpartyModel.findById(id);
  if (!doc) throw new NotFoundError('Counterparty', id);
  return toJSON(doc);
}

export async function getOurCompanies(): Promise<ICounterparty[]> {
  const docs = await CounterpartyModel.find({ roles: 'company', isActive: true });
  return docs.map(toJSON);
}

export async function create(data: Partial<ICounterparty>): Promise<ICounterparty> {
  if (!data.shortName) data.shortName = data.name;
  const doc = await CounterpartyModel.create(data);
  return toJSON(doc);
}

export async function update(id: string, data: Partial<ICounterparty>): Promise<ICounterparty> {
  const doc = await CounterpartyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('Counterparty', id);
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await CounterpartyModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Counterparty', id);
}
```

### counterparty.controller.ts (аналогично product.controller.ts)

### counterparty.routes.ts (аналогично product.routes.ts)
