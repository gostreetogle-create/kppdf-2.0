import { ProductKindLabelPipe } from './product-kind-label.pipe';
import { ProductKind } from '../../models/product.model';

describe('ProductKindLabelPipe', () => {
  let pipe: ProductKindLabelPipe;

  beforeEach(() => {
    pipe = new ProductKindLabelPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Товар" for ITEM', () => {
    expect(pipe.transform('ITEM')).toBe('Товар');
  });

  it('should return "Услуга" for SERVICE', () => {
    expect(pipe.transform('SERVICE')).toBe('Услуга');
  });

  it('should return "Работа" for WORK', () => {
    expect(pipe.transform('WORK')).toBe('Работа');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return unknown value as-is if not in labels', () => {
    const result = pipe.transform('UNKNOWN' as ProductKind);
    expect(result).toBe('UNKNOWN');
  });
});
