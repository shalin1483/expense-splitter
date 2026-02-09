import { describe, it, expect } from 'vitest';
import { canProceedFromPeople } from './PeopleStep';

describe('canProceedFromPeople', () => {
  it('returns false for empty array', () => {
    expect(canProceedFromPeople([])).toBe(false);
  });

  it('returns false for 1 person', () => {
    expect(canProceedFromPeople([{ id: '1', name: 'Alice' }])).toBe(false);
  });

  it('returns true for 2 people', () => {
    expect(
      canProceedFromPeople([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ])
    ).toBe(true);
  });

  it('returns true for 3+ people', () => {
    expect(
      canProceedFromPeople([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
      ])
    ).toBe(true);
  });
});
