import type { ISetting } from '../../../shared/types/settings.interface';

export type { ISetting };

export class Setting implements ISetting {
  _id?: string;
  key!: string;
  value!: string | number | boolean | unknown[];
  label!: string;
  description?: string;
  group?: string;
  updatedAt?: string;

  constructor(init: Partial<Setting>) {
    Object.assign(this, init);
  }
}
