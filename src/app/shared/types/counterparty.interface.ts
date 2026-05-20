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
