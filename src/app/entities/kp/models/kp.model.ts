import type { IKp, KpStatus, KpType, IKpItem, IKpMetadata, IKpCompanySnapshot, IKpRecipientSnapshot, IKpVersionMeta } from '../../../shared/types/kp.interface';

export type { IKp, KpStatus, KpType, IKpItem, IKpMetadata, IKpCompanySnapshot, IKpRecipientSnapshot, IKpVersionMeta };

export class Kp implements IKp {
  _id!: string;
  title!: string;
  status!: KpStatus;
  kpType!: KpType;
  counterpartyId?: string;
  companyId?: string;
  recipient!: IKpRecipientSnapshot;
  metadata!: IKpMetadata;
  companySnapshot!: IKpCompanySnapshot;
  items!: IKpItem[];
  conditions!: string[];
  vatPercent!: number;
  totalAmount?: number;
  versions?: IKpVersionMeta[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;

  get id(): string { return this._id; }

  constructor(init: Partial<Kp>) {
    Object.assign(this, init);
  }
}
