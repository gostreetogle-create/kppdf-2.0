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
