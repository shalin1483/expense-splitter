import { describe, it, expect } from "vitest";
import { calculateTip, distributeTip } from "./tip";
import type { Cents } from "../types/money";

describe("calculateTip", () => {
  it("calculates 18% tip on $100.00", () => {
    const result = calculateTip(10000 as Cents, 0.18);
    expect(result).toBe(1800);
  });

  it("calculates 20% tip on $100.00", () => {
    const result = calculateTip(10000 as Cents, 0.2);
    expect(result).toBe(2000);
  });

  it("calculates 15% tip on $50.00", () => {
    const result = calculateTip(5000 as Cents, 0.15);
    expect(result).toBe(750);
  });

  it("handles rounding correctly (18% on $33.33)", () => {
    const result = calculateTip(3333 as Cents, 0.18);
    expect(result).toBe(600); // 3333 * 0.18 = 599.94, rounds to 600
  });

  it("returns 0 for zero tip rate", () => {
    const result = calculateTip(10000 as Cents, 0);
    expect(result).toBe(0);
  });

  it("returns 0 for zero subtotal", () => {
    const result = calculateTip(0 as Cents, 0.2);
    expect(result).toBe(0);
  });

  it("calculates custom 22% tip on $87.50", () => {
    const result = calculateTip(8750 as Cents, 0.22);
    expect(result).toBe(1925);
  });
});

describe("distributeTip", () => {
  it("distributes tip equally across equal subtotals", () => {
    const result = distributeTip(600 as Cents, [
      2000, 2000, 2000,
    ] as Cents[]);
    expect(result).toEqual([200, 200, 200]);
  });

  it("distributes tip proportionally across unequal subtotals", () => {
    const result = distributeTip(1000 as Cents, [
      5000, 3000, 2000,
    ] as Cents[]);
    expect(result.reduce((sum, val) => sum + val, 0)).toBe(1000);
  });

  it("guarantees sum of distributed tip equals total tip (sum invariant)", () => {
    const testCases = [
      { tip: 600 as Cents, subtotals: [2000, 2000, 2000] as Cents[] },
      { tip: 1000 as Cents, subtotals: [5000, 3000, 2000] as Cents[] },
      { tip: 1800 as Cents, subtotals: [4500, 3000, 1500, 1000] as Cents[] },
    ];

    testCases.forEach(({ tip, subtotals }) => {
      const result = distributeTip(tip, subtotals);
      const sum = result.reduce((acc, val) => acc + val, 0);
      expect(sum).toBe(tip);
    });
  });
});
