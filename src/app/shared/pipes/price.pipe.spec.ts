import { PricePipe } from './price.pipe';

describe('PricePipe', () => {
  let pipe: PricePipe;

  beforeEach(() => {
    pipe = new PricePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format number as RUB currency', () => {
    const result = pipe.transform(1500);
    expect(result).toMatch(/1[\u00a0 ]500/);
    expect(result).toContain('₽');
  });

  it('should format zero', () => {
    const result = pipe.transform(0);
    expect(result).toMatch(/0[,\\.]?/);
  });

  it('should format large numbers', () => {
    const result = pipe.transform(1234567.89);
    expect(result).toMatch(/1[\u00a0 ]234[\u00a0 ]567/);
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
