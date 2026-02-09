import { describe, it, expect } from "vitest";
import { calculateTax, distributeTax } from "./tax";
import type { Cents } from "../types/money";

describe("calculateTax", () => {
  it("calculates tax from rate input (8% on $100.00)", () => {
    const result = calculateTax(10000 as Cents, { type: "rate", rate: 0.08 });
    expect(result).toBe(800);
  });

  it("calculates tax from rate input (8.75% on $12.50)", () => {
    const result = calculateTax(1250 as Cents, {
      type: "rate",
      rate: 0.0875,
    });
    expect(result).toBe(109); // 1250 * 0.0875 = 109.375, rounds to 109
  });

  it("returns 0 when subtotal is 0 with rate input", () => {
    const result = calculateTax(0 as Cents, { type: "rate", rate: 0.08 });
    expect(result).toBe(0);
  });

  it("calculates tax from exact input (passes through exact amount)", () => {
    const result = calculateTax(10000 as Cents, {
      type: "exact",
      amount: 825 as Cents,
    });
    expect(result).toBe(825);
  });

  it("returns 0 with exact input of 0", () => {
    const result = calculateTax(5000 as Cents, {
      type: "exact",
      amount: 0 as Cents,
    });
    expect(result).toBe(0);
  });
});

describe("distributeTax", () => {
  it("distributes tax equally across equal subtotals", () => {
    const result = distributeTax(300 as Cents, [
      1000, 1000, 1000,
    ] as Cents[]);
    expect(result).toEqual([100, 100, 100]);
  });

  it("distributes tax proportionally across unequal subtotals", () => {
    const result = distributeTax(100 as Cents, [
      5000, 3000, 2000,
    ] as Cents[]);
    expect(result.reduce((sum, val) => sum + val, 0)).toBe(100);
  });

  it("guarantees sum of distributed tax equals total tax (sum invariant)", () => {
    const testCases = [
      { tax: 300 as Cents, subtotals: [1000, 1000, 1000] as Cents[] },
      { tax: 100 as Cents, subtotals: [5000, 3000, 2000] as Cents[] },
      { tax: 825 as Cents, subtotals: [4000, 3000, 2000, 1000] as Cents[] },
    ];

    testCases.forEach(({ tax, subtotals }) => {
      const result = distributeTax(tax, subtotals);
      const sum = result.reduce((acc, val) => acc + val, 0);
      expect(sum).toBe(tax);
    });
  });
});
