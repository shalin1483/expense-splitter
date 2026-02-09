import { describe, expect, it } from "vitest";
import { allocateProportionally } from "./allocate";
import type { Cents } from "../types/money";

describe("allocateProportionally", () => {
  it("allocates equally when subtotals are equal", () => {
    const result = allocateProportionally(
      300 as Cents,
      [1000, 1000, 1000] as Cents[]
    );
    expect(result).toEqual([100, 100, 100]);
  });

  it("allocates proportionally", () => {
    const result = allocateProportionally(
      100 as Cents,
      [5000, 3000, 2000] as Cents[]
    );
    expect(result).toEqual([50, 30, 20]);
  });

  it("handles remainder distribution with largest remainder method", () => {
    const result = allocateProportionally(
      100 as Cents,
      [3333, 3333, 3334] as Cents[]
    );
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("handles single person", () => {
    const result = allocateProportionally(500 as Cents, [1000] as Cents[]);
    expect(result).toEqual([500]);
  });

  it("allocates with unequal proportions", () => {
    const result = allocateProportionally(
      1000 as Cents,
      [6000, 3000, 1000] as Cents[]
    );
    expect(result).toEqual([600, 300, 100]);
  });

  it("handles tricky remainder case", () => {
    const result = allocateProportionally(10 as Cents, [1, 1, 1] as Cents[]);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBe(10);
  });

  it("maintains sum invariant for all cases", () => {
    const testCases: Array<[Cents, Cents[]]> = [
      [300 as Cents, [1000, 1000, 1000] as Cents[]],
      [100 as Cents, [5000, 3000, 2000] as Cents[]],
      [100 as Cents, [3333, 3333, 3334] as Cents[]],
      [500 as Cents, [1000] as Cents[]],
      [1000 as Cents, [6000, 3000, 1000] as Cents[]],
      [10 as Cents, [1, 1, 1] as Cents[]],
      [999 as Cents, [1234, 5678, 9012] as Cents[]],
      [50 as Cents, [100, 200, 300, 400] as Cents[]],
    ];

    testCases.forEach(([amount, subtotals]) => {
      const shares = allocateProportionally(amount, subtotals);
      const sum = shares.reduce((a, b) => a + b, 0);
      expect(sum).toBe(amount);
    });
  });

  it("throws error when subtotals array is empty", () => {
    expect(() => allocateProportionally(100 as Cents, [] as Cents[])).toThrow();
  });

  it("throws error when all subtotals are zero", () => {
    expect(() =>
      allocateProportionally(100 as Cents, [0, 0] as Cents[])
    ).toThrow();
  });

  it("throws error when total of subtotals is zero", () => {
    expect(() =>
      allocateProportionally(100 as Cents, [0, 0, 0] as Cents[])
    ).toThrow();
  });
});
