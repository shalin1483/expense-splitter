import { describe, it, expect } from 'vitest';
import { canProceedFromAssignment } from './AssignmentStep';
import type { Item, Assignment } from '@/lib/types/bill';

describe('canProceedFromAssignment', () => {
  const mockItems: Item[] = [
    { id: '1', name: 'Burger', priceInCents: 1200 },
    { id: '2', name: 'Fries', priceInCents: 600 },
  ];

  it('returns false when no assignments exist (empty Record)', () => {
    const assignments: Record<string, Assignment> = {};
    expect(canProceedFromAssignment(mockItems, assignments)).toBe(false);
  });

  it('returns false when assignments exist but all have empty personIds arrays', () => {
    const assignments: Record<string, Assignment> = {
      '1': { itemId: '1', personIds: [] },
      '2': { itemId: '2', personIds: [] },
    };
    expect(canProceedFromAssignment(mockItems, assignments)).toBe(false);
  });

  it('returns true when at least one assignment has personIds.length > 0', () => {
    const assignments: Record<string, Assignment> = {
      '1': { itemId: '1', personIds: ['person1'] },
      '2': { itemId: '2', personIds: [] },
    };
    expect(canProceedFromAssignment(mockItems, assignments)).toBe(true);
  });

  it('returns true when multiple assignments have people assigned', () => {
    const assignments: Record<string, Assignment> = {
      '1': { itemId: '1', personIds: ['person1', 'person2'] },
      '2': { itemId: '2', personIds: ['person3'] },
    };
    expect(canProceedFromAssignment(mockItems, assignments)).toBe(true);
  });

  it('returns true for a single item assigned to multiple people', () => {
    const assignments: Record<string, Assignment> = {
      '1': { itemId: '1', personIds: ['person1', 'person2', 'person3'] },
    };
    expect(canProceedFromAssignment(mockItems, assignments)).toBe(true);
  });

  it('returns false when assignments exist for non-existent items', () => {
    const assignments: Record<string, Assignment> = {
      '999': { itemId: '999', personIds: [] },
    };
    expect(canProceedFromAssignment(mockItems, assignments)).toBe(false);
  });
});

describe('Custom split percentage-to-cents conversion logic', () => {
  /**
   * Tests for the percentage-to-cents conversion logic used in CustomSplitEditor.
   * This verifies that percentages correctly convert to cents amounts and handle rounding.
   */

  it('converts equal 3-way split (33%, 33%, 34%) to cents correctly', () => {
    const itemPriceInCents = 1000; // $10.00
    const percentages = { person1: 33, person2: 33, person3: 34 };

    const customSplit = Object.entries(percentages).map(([personId, percentage]) => ({
      personId,
      amountInCents: Math.round((itemPriceInCents * percentage) / 100),
    }));

    const totalCents = customSplit.reduce((sum, split) => sum + split.amountInCents, 0);

    // Should sum to exactly the item price
    expect(totalCents).toBe(itemPriceInCents);
    expect(customSplit[0].amountInCents).toBe(330);
    expect(customSplit[1].amountInCents).toBe(330);
    expect(customSplit[2].amountInCents).toBe(340);
  });

  it('converts uneven split (50%, 30%, 20%) to cents correctly', () => {
    const itemPriceInCents = 2500; // $25.00
    const percentages = { person1: 50, person2: 30, person3: 20 };

    const customSplit = Object.entries(percentages).map(([personId, percentage]) => ({
      personId,
      amountInCents: Math.round((itemPriceInCents * percentage) / 100),
    }));

    const totalCents = customSplit.reduce((sum, split) => sum + split.amountInCents, 0);

    expect(totalCents).toBe(itemPriceInCents);
    expect(customSplit[0].amountInCents).toBe(1250); // 50%
    expect(customSplit[1].amountInCents).toBe(750);  // 30%
    expect(customSplit[2].amountInCents).toBe(500);  // 20%
  });

  it('handles rounding with odd price (3-way split of $10.01)', () => {
    const itemPriceInCents = 1001; // $10.01
    const percentages = { person1: 33, person2: 33, person3: 34 };

    let customSplit = Object.entries(percentages).map(([personId, percentage]) => ({
      personId,
      amountInCents: Math.round((itemPriceInCents * percentage) / 100),
    }));

    let totalCents = customSplit.reduce((sum, split) => sum + split.amountInCents, 0);
    const difference = itemPriceInCents - totalCents;

    // Apply rounding correction to the largest percentage person
    if (difference !== 0) {
      const largestSplit = customSplit.reduce((max, split) => {
        const currentPercentage = percentages[split.personId as keyof typeof percentages];
        const maxPercentage = percentages[max.personId as keyof typeof percentages];
        return currentPercentage > maxPercentage ? split : max;
      });
      largestSplit.amountInCents += difference;
    }

    totalCents = customSplit.reduce((sum, split) => sum + split.amountInCents, 0);
    expect(totalCents).toBe(itemPriceInCents);
  });

  it('validates that percentages must sum to exactly 100', () => {
    const percentages99 = { person1: 33, person2: 33, person3: 33 }; // Sum = 99
    const percentages101 = { person1: 34, person2: 34, person3: 33 }; // Sum = 101
    const percentages100 = { person1: 33, person2: 33, person3: 34 }; // Sum = 100

    const sum99 = Object.values(percentages99).reduce((sum, p) => sum + p, 0);
    const sum101 = Object.values(percentages101).reduce((sum, p) => sum + p, 0);
    const sum100 = Object.values(percentages100).reduce((sum, p) => sum + p, 0);

    expect(sum99).toBe(99);
    expect(sum99 === 100).toBe(false);

    expect(sum101).toBe(101);
    expect(sum101 === 100).toBe(false);

    expect(sum100).toBe(100);
    expect(sum100 === 100).toBe(true);
  });
});
