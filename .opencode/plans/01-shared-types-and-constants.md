# Шаг A1-A2: shared/types/ + shared/constants/

## Файлы для создания

### shared/types/kp.interface.ts

```typescript
export type KpStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type KpType = 'standard' | 'response' | 'special' | 'tender' | 'service';

export interface IKpItem {
  productId: string;
  code?: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  qty: number;
  imageUrl?: string;
  markupEnabled?: boolean;
  markupPercent?: number;
  discountEnabled?: boolean;
  discountPercent?: number;
  effectivePrice?: number;
}

export interface IKpRecipientSnapshot {
  name: string;
  shortName?: string;
  legalForm?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legalAddress?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bik?: string;
  checkingAccount?: string;
  correspondentAccount?: string;
}

export interface IKpMetadata {
  number: string;
  createdAt?: string;
  validityDays: number;
  prepaymentPercent: number;
  productionDays: number;
  tablePageBreakFirstPage?: number;
  tablePageBreakNextPages?: number;
  photoScalePercent?: number;
  showPhotoColumn?: boolean;
  defaultMarkupPercent?: number;
  defaultDiscountPercent?: number;
}

export interface IKpCompanySnapshot {
  companyId: string;
  companyName: string;
  templateKey: string;
  templateName: string;
  kpType: KpType;
  assets: {
    kpPage1: string;
    kpPage2?: string;
    passport?: string;
    appendix?: string;
  };
  texts: {
    headerNote?: string;
    introText?: string;
    footerText?: string;
    closingText?: string;
  };
  requisites?: {
    inn?: string;
    kpp?: string;
    ogrn?: string;
    phone?: string;
    email?: string;
  };
}

export interface IKpVersionMeta {
  version: number;
  createdAt: string;
  status: KpStatus;
  number: string;
  title: string;
}

export interface IKp {
  _id: string;
  title: string;
  status: KpStatus;
  kpType: KpType;
  counterpartyId?: string;
  companyId?: string;
  recipient: IKpRecipientSnapshot;
  metadata: IKpMetadata;
  companySnapshot: IKpCompanySnapshot;
  items: IKpItem[];
  conditions: string[];
  vatPercent: number;
  totalAmount?: number;
  versions?: IKpVersionMeta[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### shared/types/product.interface.ts

```typescript
export type ProductKind = 'ITEM' | 'SERVICE' | 'WORK';

export interface IProduct {
  _id: string;
  name: string;
  code?: string;
  description: string;
  price: number;
  unit: string;
  kind: ProductKind;
  images: string[];
  category?: string;
  subcategory?: string;
  specId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductSpecGroupParam {
  name: string;
  value: string;
}

export interface IProductSpecGroup {
  title: string;
  params: IProductSpecGroupParam[];
}

export interface IProductSpec {
  _id: string;
  productId: string;
  groups: IProductSpecGroup[];
  drawings: {
    viewFront?: string;
    viewSide?: string;
    viewTop?: string;
    view3D?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
```

### shared/types/counterparty.interface.ts

```typescript
export type CounterpartyLegalForm = 'ООО' | 'ИП' | 'АО' | 'ПАО' | 'МКУ' | 'Физлицо' | 'Другое';
export type CounterpartyRole = 'client' | 'supplier' | 'company';

export interface ICounterpartyBrandingTemplate {
  templateKey: string;
  templateName: string;
  kpType: string;
  isDefault: boolean;
  assets: {
    kpPage1: string;
    kpPage2?: string;
    passport?: string;
    appendix?: string;
  };
  texts: {
    headerNote?: string;
    introText?: string;
    footerText?: string;
    closingText?: string;
  };
  conditions: string[];
}

export interface ICounterparty {
  _id: string;
  name: string;
  shortName?: string;
  legalForm: CounterpartyLegalForm;
  roles: CounterpartyRole[];
  isOurCompany?: boolean;
  isDefaultInitiator?: boolean;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legalAddress?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bik?: string;
  checkingAccount?: string;
  correspondentAccount?: string;
  founderName?: string;
  founderNameShort?: string;
  brandingTemplates?: ICounterpartyBrandingTemplate[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### shared/types/user.interface.ts

```typescript
export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserPermissions {
  users: string[];
  kp: string[];
  products: string[];
  counterparties: string[];
  settings: string[];
  backups: string[];
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface ILoginResponse {
  user: IUser;
  tokens: IAuthTokens;
}
```

### shared/types/settings.interface.ts

```typescript
export interface ISetting {
  _id?: string;
  key: string;
  value: string | number | boolean | object;
  label: string;
  description?: string;
  group?: string;
  updatedAt?: string;
}

export interface ISettingsMap {
  kp_validity_days: number;
  kp_prepayment_percent: number;
  kp_production_days: number;
  kp_vat_percent: number;
  product_spec_templates_v1: string[];
  passport_warranty_text: string;
  passport_storage_text: string;
}
```

### shared/types/dictionary.interface.ts

```typescript
export type DictionaryKind = 'category' | 'subcategory' | 'unit' | 'kind';

export interface IDictionaryItem {
  _id?: string;
  kind: DictionaryKind;
  name: string;
  sort?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### shared/types/index.ts

```typescript
export type { KpStatus, KpType, IKpItem, IKpRecipientSnapshot, IKpMetadata, IKpCompanySnapshot, IKpVersionMeta, IKp } from './kp.interface';
export type { ProductKind, IProduct, IProductSpecGroupParam, IProductSpecGroup, IProductSpec } from './product.interface';
export type { CounterpartyLegalForm, CounterpartyRole, ICounterpartyBrandingTemplate, ICounterparty } from './counterparty.interface';
export type { UserRole, IUser, IUserPermissions, IAuthTokens, ILoginRequest, ILoginResponse } from './user.interface';
export type { ISetting, ISettingsMap } from './settings.interface';
export type { DictionaryKind, IDictionaryItem } from './dictionary.interface';
```

## Файлы для создания — constants

### shared/constants/kp-statuses.ts

```typescript
import type { KpStatus, KpType } from '../types/kp.interface';

export const KP_STATUS_TRANSITIONS: Record<KpStatus, KpStatus[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected'],
  accepted: [],
  rejected: ['draft'],
};

export const KP_STATUS_LABELS: Record<KpStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  accepted: 'Принят',
  rejected: 'Отклонён',
};

export const KP_TYPE_LABELS: Record<KpType, string> = {
  standard: 'КП',
  response: 'Ответ на письмо',
  special: 'Спецпредложение',
  tender: 'Для тендера',
  service: 'На услуги',
};

export function getNextStatuses(current: KpStatus): KpStatus[] {
  return KP_STATUS_TRANSITIONS[current] ?? [];
}
```

### shared/constants/permissions.ts

```typescript
import type { UserRole } from '../types/user.interface';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: ['*'],
  admin: ['kp.*', 'products.*', 'counterparties.*', 'settings.*', 'backups.*', 'users.*'],
  manager: ['kp.*', 'products.read', 'counterparties.read', 'settings.read'],
  viewer: ['kp.read', 'products.read', 'counterparties.read'],
};

export function can(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.some((p) => {
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2);
      return permission.startsWith(prefix);
    }
    return p === permission;
  });
}
```

## Что ещё нужно обновить

После создания shared/types/ — обновить существующий файл:

### src/app/entities/product/models/product.model.ts

Заменить `ProductKind` и `Product` на импорт из shared:

```typescript
export type { ProductKind, IProduct as Product } from '../../../../../shared/types/product.interface';
```

(или оставить локальные алиасы — решим позже)
