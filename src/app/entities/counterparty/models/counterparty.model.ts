import type { ICounterparty, ICounterpartyBrandingTemplate } from '../../../shared/types/counterparty.interface';

export type { ICounterparty, ICounterpartyBrandingTemplate };

export type CounterpartyLegalForm = 'ООО' | 'ИП' | 'АО' | 'ПАО' | 'МКУ' | 'Физлицо' | 'Другое';
export type CounterpartyRole = 'client' | 'supplier' | 'company';

export class Counterparty implements ICounterparty {
  _id!: string;
  name!: string;
  shortName?: string;
  legalForm!: CounterpartyLegalForm;
  roles!: CounterpartyRole[];
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
  isActive!: boolean;
  createdAt?: string;
  updatedAt?: string;

  get id(): string {
    return this._id;
  }

  constructor(init: Partial<Counterparty>) {
    Object.assign(this, init);
  }
}
