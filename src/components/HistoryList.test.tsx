import { describe, it, expect } from 'vitest';
import { computePersonTotals } from '@/lib/calculations/personTotals';
import { formatCurrency } from '@/lib/types/money';
import type { SavedBill } from '@/lib/types/bill';
import type { Cents } from '@/lib/types/money';

describe('HistoryList logic', () => {
  it('displays empty state message when no bills', () => {
    const bills: SavedBill[] = [];

    // Empty state logic
    const shouldShowEmpty = bills.length === 0;
    expect(shouldShowEmpty).toBe(true);
  });

  it('formats saved bill info correctly', () => {
    const mockBill: SavedBill = {
      id: 'bill1',
      timestamp: new Date('2024-01-15T12:00:00Z').getTime(),
      people: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
      items: [
        { id: 'i1', name: 'Pizza', priceInCents: 1500 as Cents },
        { id: 'i2', name: 'Salad', priceInCents: 850 as Cents },
        { id: 'i3', name: 'Drinks', priceInCents: 1200 as Cents },
      ],
      assignments: {
        i1: { itemId: 'i1', personIds: ['p1', 'p2'] },
        i2: { itemId: 'i2', personIds: ['p2'] },
        i3: { itemId: 'i3', personIds: ['p1', 'p2'] },
      },
      taxInput: { type: 'rate' as const, rate: 0.085 },
      tipRate: 0.2,
      totalInCents: 4321 as Cents,
    };

    // Verify bill metadata formatting
    const formattedTotal = formatCurrency(mockBill.totalInCents);
    const peopleCount = mockBill.people.length;
    const itemsCount = mockBill.items.length;

    expect(formattedTotal).toBe('$43.21');
    expect(peopleCount).toBe(2);
    expect(itemsCount).toBe(3);
  });

  it('recomputes breakdown from saved bill for expandable view', () => {
    const mockBill: SavedBill = {
      id: 'bill1',
      timestamp: Date.now(),
      people: [{ id: 'p1', name: 'Alice' }],
      items: [{ id: 'i1', name: 'Burger', priceInCents: 1200 as Cents }],
      assignments: { i1: { itemId: 'i1', personIds: ['p1'] } },
      taxInput: { type: 'rate' as const, rate: 0.1 },
      tipRate: 0.18,
      totalInCents: 1526 as Cents,
    };

    // Recompute using computePersonTotals (as HistoryList does)
    const summary = computePersonTotals(
      mockBill.people,
      mockBill.items,
      mockBill.assignments,
      mockBill.taxInput,
      mockBill.tipRate
    );

    expect(summary.personBreakdowns).toHaveLength(1);
    expect(summary.personBreakdowns[0].personName).toBe('Alice');
    expect(summary.personBreakdowns[0].items).toHaveLength(1);
    expect(summary.grandTotal).toBeGreaterThan(0);
  });

  it('formats date timestamp correctly', () => {
    const timestamp = new Date('2024-01-15T12:00:00Z').getTime();

    const formatted = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(timestamp);

    // Should format with date and time
    expect(formatted).toContain('2024');
  });

  it('displays Clear All History button only when bills exist', () => {
    const emptyBills: SavedBill[] = [];
    const nonEmptyBills: SavedBill[] = [
      {
        id: 'bill1',
        timestamp: Date.now(),
        people: [{ id: 'p1', name: 'Alice' }],
        items: [{ id: 'i1', name: 'Burger', priceInCents: 1200 as Cents }],
        assignments: { i1: { itemId: 'i1', personIds: ['p1'] } },
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1416 as Cents,
      },
    ];

    const shouldShowClearButton = (bills: SavedBill[]) => bills.length > 0;

    expect(shouldShowClearButton(emptyBills)).toBe(false);
    expect(shouldShowClearButton(nonEmptyBills)).toBe(true);
  });
});
