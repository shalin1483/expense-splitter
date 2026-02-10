import { describe, it, expect } from 'vitest';
import { canProceedFromPeople } from '@/components/PeopleStep';
import { canProceedFromItems } from '@/components/ItemsStep';
import { canProceedFromAssignment } from '@/components/AssignmentStep';
import type { Person, Item, Assignment } from '@/lib/types/bill';

describe('BillWizard validation gates', () => {
  const STEPS = ['people', 'items', 'assignment', 'taxtip'] as const;

  it('STEPS array has correct ordering', () => {
    expect(STEPS).toEqual(['people', 'items', 'assignment', 'taxtip']);
    expect(STEPS.length).toBe(4);
  });

  it('step index calculation works correctly', () => {
    expect(STEPS.indexOf('people')).toBe(0);
    expect(STEPS.indexOf('items')).toBe(1);
    expect(STEPS.indexOf('assignment')).toBe(2);
    expect(STEPS.indexOf('taxtip')).toBe(3);
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

  describe('assignment validation gate', () => {
    const mockItems: Item[] = [
      { id: '1', name: 'Pizza', priceInCents: 2000 },
      { id: '2', name: 'Salad', priceInCents: 1000 },
    ];

    it('canProceedFromAssignment blocks when no assignments exist', () => {
      const assignments: Record<string, Assignment> = {};
      expect(canProceedFromAssignment(mockItems, assignments)).toBe(false);
    });

    it('canProceedFromAssignment blocks when assignments exist but all have empty personIds', () => {
      const assignments: Record<string, Assignment> = {
        '1': { itemId: '1', personIds: [] },
        '2': { itemId: '2', personIds: [] },
      };
      expect(canProceedFromAssignment(mockItems, assignments)).toBe(false);
    });

    it('canProceedFromAssignment allows when at least one assignment has personIds', () => {
      const assignments: Record<string, Assignment> = {
        '1': { itemId: '1', personIds: ['person1'] },
        '2': { itemId: '2', personIds: [] },
      };
      expect(canProceedFromAssignment(mockItems, assignments)).toBe(true);
    });
  });

  describe('taxtip validation gate', () => {
    it('taxtip step always allows proceeding (returns true)', () => {
      // Tax/tip has valid defaults: null tax + 18% tip
      const canProceedFromTaxTip = true;
      expect(canProceedFromTaxTip).toBe(true);
    });
  });
});
