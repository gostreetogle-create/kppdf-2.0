# Шаг A7: Модуль KP (самый важный)

```
backend/src/modules/kp/
├── kp.model.ts              # Mongoose schema
├── kp.service.ts            # CRUD + статусы + нумерация
├── kp.calculation.service.ts # effectivePrice, totals, vat
├── kp.pdf.service.ts        # Puppeteer PDF генерация
├── kp.controller.ts
├── kp.routes.ts            # /api/kp
├── kp.errors.ts
├── kp.seed.ts              # Демо-данные
└── kp.utils.ts             # helper функции
```

### kp.model.ts

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import type { IKp, KpStatus, KpType } from '@shared/types/kp.interface';

export interface IKpDocument extends Omit<IKp, '_id'>, Document {}

const recipientSchema = new Schema({
  name: { type: String, required: true },
  shortName: String,
  legalForm: String,
  inn: String,
  kpp: String,
  ogrn: String,
  legalAddress: String,
  phone: String,
  email: String,
  bankName: String,
  bik: String,
  checkingAccount: String,
  correspondentAccount: String,
}, { _id: false });

const itemSchema = new Schema({
  productId: { type: String, required: true },
  code: String,
  name: { type: String, required: true },
  description: { type: String, default: '' },
  unit: { type: String, default: 'шт' },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  imageUrl: String,
  markupEnabled: { type: Boolean, default: false },
  markupPercent: { type: Number, default: 0 },
  discountEnabled: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0 },
  effectivePrice: { type: Number },
}, { _id: false });

const companySnapshotSchema = new Schema({
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  templateKey: { type: String, required: true },
  templateName: { type: String, required: true },
  kpType: { type: String, required: true },
  assets: {
    kpPage1: { type: String, default: '' },
    kpPage2: String,
    passport: String,
    appendix: String,
  },
  texts: {
    headerNote: String,
    introText: String,
    footerText: String,
    closingText: String,
  },
  requisites: {
    inn: String,
    kpp: String,
    ogrn: String,
    phone: String,
    email: String,
  },
}, { _id: false });

const versionMetaSchema = new Schema({
  version: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, required: true },
  number: { type: String, required: true },
  title: { type: String, required: true },
}, { _id: false });

const kpSchema = new Schema<IKpDocument>(
  {
    title: { type: String, required: true },
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
    kpType: { type: String, enum: ['standard', 'response', 'special', 'tender', 'service'], default: 'standard' },
    counterpartyId: { type: String },
    companyId: { type: String },
    recipient: { type: recipientSchema, required: true },
    metadata: {
      number: { type: String, required: true },
      validityDays: { type: Number, default: 30 },
      prepaymentPercent: { type: Number, default: 50 },
      productionDays: { type: Number, default: 14 },
      tablePageBreakFirstPage: { type: Number, default: 4 },
      tablePageBreakNextPages: { type: Number, default: 10 },
      photoScalePercent: { type: Number, default: 150 },
      showPhotoColumn: { type: Boolean, default: true },
      defaultMarkupPercent: { type: Number, default: 0 },
      defaultDiscountPercent: { type: Number, default: 0 },
    },
    companySnapshot: { type: companySnapshotSchema, required: true },
    items: [itemSchema],
    conditions: [{ type: String }],
    vatPercent: { type: Number, default: 20 },
    totalAmount: { type: Number },
    versions: [versionMetaSchema],
    createdBy: { type: String },
  },
  { timestamps: true },
);

kpSchema.index({ 'metadata.number': 1 });
kpSchema.index({ status: 1, createdAt: -1 });

export const KpModel = mongoose.model<IKpDocument>('Kp', kpSchema);
```

### kp.service.ts

```typescript
import { KpModel } from './kp.model';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { getNextStatuses } from '../../../shared/constants/kp-statuses';
import type { IKp, KpStatus } from '@shared/types/kp.interface';

function toJSON(doc: any): IKp {
  const obj = doc.toObject();
  obj._id = doc._id.toString();
  return obj;
}

async function generateNumber(kpType: string): Promise<string> {
  const prefix = kpType === 'response' ? 'ПИСЬМО' : 'КП';
  const last = await KpModel.findOne({
    'metadata.number': { $regex: `^${prefix}-\\d+$`, $options: '' },
  }).sort({ 'metadata.number': -1 });

  let nextSerial = 1;
  if (last) {
    const match = last.metadata.number.match(/(\d+)$/);
    if (match) nextSerial = parseInt(match[1], 10) + 1;
  }

  return `${prefix}-${String(nextSerial).padStart(3, '0')}`;
}

export async function getAll(filter?: { status?: string }): Promise<IKp[]> {
  const query: any = {};
  if (filter?.status) query.status = filter.status;

  const docs = await KpModel.find(query).sort({ createdAt: -1 });
  return docs.map(toJSON);
}

export async function getById(id: string): Promise<IKp> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('KP', id);
  return toJSON(doc);
}

export async function create(data: Partial<IKp>): Promise<IKp> {
  const number = await generateNumber(data.kpType || 'standard');

  const doc = await KpModel.create({
    ...data,
    title: data.title || `КП №${number}`,
    metadata: {
      ...data.metadata,
      number,
    },
  });

  return toJSON(doc);
}

export async function update(id: string, data: Partial<IKp>): Promise<IKp> {
  const existing = await KpModel.findById(id);
  if (!existing) throw new NotFoundError('KP', id);
  if (existing.status !== 'draft') throw new ValidationError('Only drafts can be edited');

  // Если данные содержат items — пересчитать totalAmount
  if (data.items) {
    data.totalAmount = data.items.reduce((sum, item) => {
      const effective = item.effectivePrice ?? item.price;
      return sum + effective * item.qty;
    }, 0);
  }

  const doc = await KpModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new NotFoundError('KP', id);
  return toJSON(doc);
}

export async function changeStatus(id: string, newStatus: KpStatus): Promise<IKp> {
  const doc = await KpModel.findById(id);
  if (!doc) throw new NotFoundError('KP', id);

  const allowed = getNextStatuses(doc.status as KpStatus);
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(
      `Cannot change status from '${doc.status}' to '${newStatus}'. Allowed: ${allowed.join(', ')}`,
    );
  }

  doc.status = newStatus;
  await doc.save();
  return toJSON(doc);
}

export async function remove(id: string): Promise<void> {
  const doc = await KpModel.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('KP', id);
}
```

### kp.calculation.service.ts

```typescript
export interface KpCalculationInput {
  price: number;
  qty: number;
  vatPercent: number;
  markupEnabled?: boolean;
  markupPercent?: number;
  discountEnabled?: boolean;
  discountPercent?: number;
}

export interface KpCalculationResult {
  effectiveUnitPrice: number;
  lineSum: number;
  vatAmount: number;
}

export function calculateItem(input: KpCalculationInput): KpCalculationResult {
  let effectiveUnitPrice = input.price;

  if (input.markupEnabled && input.markupPercent) {
    effectiveUnitPrice = Math.round(effectiveUnitPrice * (1 + input.markupPercent / 100));
  }
  if (input.discountEnabled && input.discountPercent) {
    effectiveUnitPrice = Math.round(effectiveUnitPrice * (1 - input.discountPercent / 100));
  }

  const lineSum = effectiveUnitPrice * input.qty;
  const vatAmount = Math.round(lineSum * input.vatPercent / (100 + input.vatPercent));

  return { effectiveUnitPrice, lineSum, vatAmount };
}

export function calculateTotals(
  items: KpCalculationInput[],
): { total: number; totalVat: number; items: KpCalculationResult[] } {
  const results = items.map(calculateItem);
  const total = results.reduce((sum, r) => sum + r.lineSum, 0);
  const totalVat = results.reduce((sum, r) => sum + r.vatAmount, 0);
  return { total, totalVat, items: results };
}
```

### kp.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import * as kpService from './kp.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await kpService.getAll({ status: req.query.status as string });
    res.json(list);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kp = await kpService.getById(req.params.id);
    res.json(kp);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kp = await kpService.create(req.body);
    res.status(201).json(kp);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kp = await kpService.update(req.params.id, req.body);
    res.json(kp);
  } catch (err) { next(err); }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kp = await kpService.changeStatus(req.params.id, req.body.status);
    res.json(kp);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await kpService.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
```

### kp.routes.ts

```typescript
import { Router } from 'express';
import * as kpController from './kp.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', kpController.getAll);
router.get('/:id', kpController.getById);
router.post('/', kpController.create);
router.patch('/:id', kpController.update);
router.patch('/:id/status', kpController.changeStatus);
router.delete('/:id', kpController.remove);

export default router;
```
