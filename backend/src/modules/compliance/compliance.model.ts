import { Schema, model } from 'mongoose';

/** Результат проверки соответствия */
export interface IComplianceCheck {
  _id?: string;
  dealId: string;
  specId: string;
  status: 'pending' | 'passed' | 'failed' | 'partial';
  checkedAt?: Date;
  checkedBy?: string;
  results: {
    attrCode: string;
    attrName: string;
    expected: string;
    actual: string;
    operator: string;
    status: 'match' | 'deviation' | 'pending';
    severity: 'error' | 'warning';
    message?: string;
  }[];
}

const ComplianceCheckSchema = new Schema<IComplianceCheck>(
  {
    dealId: { type: String, required: true, index: true },
    specId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'partial'],
      default: 'pending',
    },
    checkedAt: Date,
    checkedBy: String,
    results: [{
      attrCode: { type: String, required: true },
      attrName: { type: String, required: true },
      expected: { type: String, required: true },
      actual: { type: String, required: true },
      operator: { type: String, required: true },
      status: { type: String, enum: ['match', 'deviation', 'pending'], default: 'pending' },
      severity: { type: String, enum: ['error', 'warning'], default: 'error' },
      message: String,
    }],
  },
  { timestamps: true },
);

export const ComplianceCheckModel = model<IComplianceCheck>('ComplianceCheck', ComplianceCheckSchema);
