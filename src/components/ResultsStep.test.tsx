import { describe, it, expect } from 'vitest';
import { computePersonTotals } from '@/lib/calculations/personTotals';
import type { Person, Item, Assignment } from '@/lib/types/bill';
import type { Cents } from '@/lib/types/money';
import { formatCurrency } from '@/lib/types/money';

describe('ResultsStep logic', () => {
  it('computes correct person totals for basic bill', () => {
    const people: Person[] = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];

    const items: Item[] = [
      { id: 'i1', name: 'Burger', priceInCents: 1200 as Cents },
      { id: 'i2', name: 'Salad', priceInCents: 800 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: 'i1', personIds: ['p1'] },
      i2: { itemId: 'i2', personIds: ['p2'] },
    };

    const summary = computePersonTotals(people, items, assignments, null, 0.18);

    expect(summary.personBreakdowns).toHaveLength(2);
    expect(summary.personBreakdowns[0].personName).toBe('Alice');
    expect(summary.personBreakdowns[1].personName).toBe('Bob');
  });

  it('shows empty state when no items assigned', () => {
    const people: Person[] = [
      { id: 'p1', name: 'Alice' },
    ];

    const items: Item[] = [
      { id: 'i1', name: 'Burger', priceInCents: 1200 as Cents },
    ];

    const assignments: Record<string, Assignment> = {};

    const summary = computePersonTotals(people, items, assignments, null, 0.18);

    const hasAssignments = summary.personBreakdowns.some(p => p.items.length > 0);
    expect(hasAssignments).toBe(false);
  });

  it('displays expandable breakdown with item details', () => {
    const people: Person[] = [
      { id: 'p1', name: 'Alice' },
    ];

    const items: Item[] = [
      { id: 'i1', name: 'Burger', priceInCents: 1200 as Cents },
      { id: 'i2', name: 'Fries', priceInCents: 400 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: 'i1', personIds: ['p1'] },
      i2: { itemId: 'i2', personIds: ['p1'] },
    };

    const taxInput = { type: 'rate' as const, rate: 0.1 };
    const summary = computePersonTotals(people, items, assignments, taxInput, 0.18);

    const alice = summary.personBreakdowns[0];

    // Alice has 2 items
    expect(alice.items).toHaveLength(2);
    expect(alice.items[0].itemName).toBe('Burger');
    expect(alice.items[1].itemName).toBe('Fries');

    // Check split indicators
    expect(alice.items[0].isCustomSplit).toBe(false);
    expect(alice.items[0].splitCount).toBe(1);

    // Total includes items + tax + tip
    expect(alice.total).toBe(alice.itemsSubtotal + alice.taxShare + alice.tipShare);
  });

  it('formats currency correctly for display', () => {
    expect(formatCurrency(1250 as Cents)).toBe('$12.50');
    expect(formatCurrency(0 as Cents)).toBe('$0.00');
    expect(formatCurrency(999 as Cents)).toBe('$9.99');
  });
});
