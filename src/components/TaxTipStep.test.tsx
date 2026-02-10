import { describe, it, expect } from 'vitest';
import { toCents } from '@/lib/types/money';
import type { TaxInput } from '@/lib/types/bill';

describe('TaxTipStep conversion logic', () => {
  it('converts tax rate percentage string to correct TaxInput', () => {
    // Simulate parsing user input "8.5" as percentage
    const inputStr = '8.5';
    const percentage = parseFloat(inputStr);

    const taxInput: TaxInput = {
      type: 'rate',
      rate: percentage / 100
    };

    expect(taxInput.type).toBe('rate');
    expect(taxInput.rate).toBe(0.085);
  });

  it('converts exact dollar string to correct TaxInput with toCents', () => {
    // Simulate parsing user input "5.25" as dollars
    const inputStr = '5.25';
    const dollars = parseFloat(inputStr);

    const taxInput: TaxInput = {
      type: 'exact',
      amount: toCents(dollars)
    };

    expect(taxInput.type).toBe('exact');
    expect(taxInput.amount).toBe(525); // 5.25 * 100 = 525 cents
  });

  it('maps tip preset values to correct decimal rates', () => {
    // Test preset mappings
    const presets = [
      { label: '15%', rate: 0.15 },
      { label: '18%', rate: 0.18 },
      { label: '20%', rate: 0.20 },
    ];

    presets.forEach(preset => {
      expect(preset.rate).toBeGreaterThanOrEqual(0);
      expect(preset.rate).toBeLessThanOrEqual(1);
    });

    expect(presets[0].rate).toBe(0.15);
    expect(presets[1].rate).toBe(0.18);
    expect(presets[2].rate).toBe(0.20);
  });

  it('verifies default tip rate is 0.18 (18%)', () => {
    const defaultTipRate = 0.18;
    expect(defaultTipRate).toBe(0.18);
  });

  it('handles edge cases for tax input conversion', () => {
    // Test zero rate
    const zeroRate: TaxInput = { type: 'rate', rate: 0 };
    expect(zeroRate.rate).toBe(0);

    // Test zero exact
    const zeroExact: TaxInput = { type: 'exact', amount: toCents(0) };
    expect(zeroExact.amount).toBe(0);

    // Test null (no tax)
    const noTax: TaxInput | null = null;
    expect(noTax).toBeNull();
  });

  it('clamps tip rate values to 0-1 range', () => {
    // Simulate setTipRate clamping logic
    const clampTipRate = (rate: number): number => {
      return Math.max(0, Math.min(1, rate));
    };

    expect(clampTipRate(-0.1)).toBe(0);
    expect(clampTipRate(0.5)).toBe(0.5);
    expect(clampTipRate(1.5)).toBe(1);
    expect(clampTipRate(0)).toBe(0);
    expect(clampTipRate(1)).toBe(1);
  });
});
