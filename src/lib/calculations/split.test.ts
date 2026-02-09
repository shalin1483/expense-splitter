import { describe, expect, it } from "vitest";
import { splitEqually } from "./split";
import type { Cents } from "../types/money";

describe("splitEqually", () => {
  it("splits evenly when divisible", () => {
    const result = splitEqually(1200 as Cents, 3);
    expect(result).toEqual([400, 400, 400]);
  });

  it("distributes remainder to first N people", () => {
    const result = splitEqually(1000 as Cents, 3);
    expect(result).toEqual([334, 333, 333]);
  });

  it("handles single person", () => {
    const result = splitEqually(1250 as Cents, 1);
    expect(result).toEqual([1250]);
  });

  it("splits between two people with remainder", () => {
    const result = splitEqually(1001 as Cents, 2);
    expect(result).toEqual([501, 500]);
  });

  it("handles large group", () => {
    const result = splitEqually(100 as Cents, 7);
    expect(result).toHaveLength(7);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("maintains sum invariant for all cases", () => {
    const testCases: Array<[Cents, number]> = [
      [1200 as Cents, 3],
      [1000 as Cents, 3],
      [1250 as Cents, 1],
      [1001 as Cents, 2],
      [100 as Cents, 7],
      [9999 as Cents, 13],
      [50 as Cents, 4],
    ];

    testCases.forEach(([total, numPeople]) => {
      const shares = splitEqually(total, numPeople);
      const sum = shares.reduce((a, b) => a + b, 0);
      expect(sum).toBe(total);
    });
  });

  it("throws error when numPeople is zero", () => {
    expect(() => splitEqually(1000 as Cents, 0)).toThrow();
  });

  it("throws error when numPeople is negative", () => {
    expect(() => splitEqually(1000 as Cents, -1)).toThrow();
  });
});
