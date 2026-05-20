export interface ISetting {
  _id?: string;
  key: string;
  value: string | number | boolean | unknown[];
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
