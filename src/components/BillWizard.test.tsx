import { describe, it, expect } from 'vitest';
import { canProceedFromPeople } from '@/components/PeopleStep';
import { canProceedFromItems } from '@/components/ItemsStep';
import type { Person, Item } from '@/lib/types/bill';

describe('BillWizard validation gates', () => {
  const STEPS = ['people', 'items'] as const;

  it('STEPS array has correct ordering', () => {
    expect(STEPS).toEqual(['people', 'items']);
    expect(STEPS.length).toBe(2);
  });

  it('step index calculation works correctly', () => {
    expect(STEPS.indexOf('people')).toBe(0);
    expect(STEPS.indexOf('items')).toBe(1);
  });

  describe('combined validation scenarios', () => {
    it('0 people, 0 items: cannot proceed from people', () => {
      const people: Person[] = [];
      const items: Item[] = [];

      expect(canProceedFromPeople(people)).toBe(false);
      expect(canProceedFromItems(items)).toBe(false);
    });

    it('2 people, 0 items: can proceed from people, not from items', () => {
      const people: Person[] = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const items: Item[] = [];

      expect(canProceedFromPeople(people)).toBe(true);
      expect(canProceedFromItems(items)).toBe(false);
    });

    it('2 people, 1 item: can proceed from both steps', () => {
      const people: Person[] = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const items: Item[] = [
        { id: '1', name: 'Pizza', priceInCents: 1299 },
      ];

      expect(canProceedFromPeople(people)).toBe(true);
      expect(canProceedFromItems(items)).toBe(true);
    });

    it('1 person, 1 item: cannot proceed from people (blocks even if items exist)', () => {
      const people: Person[] = [
        { id: '1', name: 'Alice' },
      ];
      const items: Item[] = [
        { id: '1', name: 'Pizza', priceInCents: 1299 },
      ];

      expect(canProceedFromPeople(people)).toBe(false);
      expect(canProceedFromItems(items)).toBe(true);
    });
  });
});
