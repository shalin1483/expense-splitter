import { describe, it, expect } from 'vitest';
import { Cents, toCents, toDollars, formatCurrency } from './money';

describe('toCents', () => {
  it('converts 12.50 to 1250 cents', () => {
    expect(toCents(12.50)).toBe(1250);
  });

  it('converts 0 to 0 cents', () => {
    expect(toCents(0)).toBe(0);
  });

  it('converts 0.01 to 1 cent', () => {
    expect(toCents(0.01)).toBe(1);
  });

  it('converts 99.99 to 9999 cents', () => {
    expect(toCents(99.99)).toBe(9999);
  });

  it('rounds 10.005 to 1001 cents (half-up)', () => {
    expect(toCents(10.005)).toBe(1001);
  });

  it('converts 100 to 10000 cents', () => {
    expect(toCents(100)).toBe(10000);
  });
});

describe('toDollars', () => {
  it('converts 1250 cents to 12.5 dollars', () => {
    expect(toDollars(1250)).toBe(12.5);
  });

  it('converts 0 cents to 0 dollars', () => {
    expect(toDollars(0)).toBe(0);
  });

  it('converts 1 cent to 0.01 dollars', () => {
    expect(toDollars(1)).toBe(0.01);
  });

  it('converts 9999 cents to 99.99 dollars', () => {
    expect(toDollars(9999)).toBe(99.99);
  });
});

describe('formatCurrency', () => {
  it('formats 1250 cents as $12.50', () => {
    expect(formatCurrency(1250)).toBe('$12.50');
  });

  it('formats 0 cents as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats 1 cent as $0.01', () => {
    expect(formatCurrency(1)).toBe('$0.01');
  });

  it('formats 10000 cents as $100.00', () => {
    expect(formatCurrency(10000)).toBe('$100.00');
  });

  it('formats 999 cents as $9.99', () => {
    expect(formatCurrency(999)).toBe('$9.99');
  });
});

describe('roundtrip conversion', () => {
  it('toDollars(toCents(12.50)) equals 12.5', () => {
    expect(toDollars(toCents(12.50))).toBe(12.5);
  });

  it('toCents(toDollars(1250)) equals 1250', () => {
    const cents: Cents = 1250;
    expect(toCents(toDollars(cents))).toBe(1250);
  });
});
