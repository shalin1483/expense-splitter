import { describe, it, expect } from 'vitest';
import { canProceedFromItems } from '@/components/ItemsStep';
import type { Item } from '@/lib/types/bill';

describe('canProceedFromItems', () => {
  it('returns false for empty array', () => {
    expect(canProceedFromItems([])).toBe(false);
  });

  it('returns true for 1 item', () => {
    const items: Item[] = [
      { id: '1', name: 'Pizza', priceInCents: 1299 },
    ];
    expect(canProceedFromItems(items)).toBe(true);
  });

  it('returns true for multiple items', () => {
    const items: Item[] = [
      { id: '1', name: 'Pizza', priceInCents: 1299 },
      { id: '2', name: 'Salad', priceInCents: 850 },
    ];
    expect(canProceedFromItems(items)).toBe(true);
  });
});

describe('price conversion edge cases', () => {
  it('handles $12.99 correctly (known floating-point pitfall)', () => {
    expect(Math.round(12.99 * 100)).toBe(1299);
  });

  it('handles $0.29 correctly', () => {
    expect(Math.round(0.29 * 100)).toBe(29);
  });

  it('handles $0.01 correctly', () => {
    expect(Math.round(0.01 * 100)).toBe(1);
  });

  it('handles $100.00 correctly', () => {
    expect(Math.round(100.00 * 100)).toBe(10000);
  });
});
