import type { Cents } from "../types/money";
import { allocateProportionally } from "./allocate";

/**
 * Tax input can be either a rate (percentage) or exact amount.
 *
 * - Rate: e.g., { type: 'rate', rate: 0.08 } represents 8% tax
 * - Exact: e.g., { type: 'exact', amount: 825 } represents $8.25 in tax
 */
export type TaxInput =
  | { type: "rate"; rate: number }
  | { type: "exact"; amount: Cents };

/**
 * Calculates the total tax amount based on either a rate or exact amount.
 *
 * For rate input: Multiplies the subtotal by the rate and rounds to nearest cent.
 * For exact input: Returns the exact amount specified.
 *
 * @param subtotal - The pre-tax subtotal in cents
 * @param input - Either a tax rate (decimal, e.g., 0.08 = 8%) or exact amount
 * @returns The calculated tax amount in cents
 *
 * @example
 * ```ts
 * // Calculate 8% tax on $100.00
 * calculateTax(10000 as Cents, { type: 'rate', rate: 0.08 })
 * // => 800 ($8.00)
 *
 * // Use exact tax amount
 * calculateTax(10000 as Cents, { type: 'exact', amount: 825 as Cents })
 * // => 825 ($8.25)
 * ```
 */
export function calculateTax(subtotal: Cents, input: TaxInput): Cents {
  if (input.type === "rate") {
    return Math.round(subtotal * input.rate) as Cents;
  } else {
    return input.amount;
  }
}

/**
 * Distributes a total tax amount proportionally across person subtotals.
 *
 * Uses the largest remainder method to ensure:
 * 1. Each person's tax share is proportional to their subtotal
 * 2. The sum of all tax shares exactly equals the total tax
 * 3. No pennies are lost or created
 *
 * @param totalTax - The total tax amount to distribute (in cents)
 * @param personSubtotals - Array of each person's subtotal (in cents)
 * @returns Array of tax shares for each person (in cents)
 *
 * @example
 * ```ts
 * // Distribute $3.00 tax across three equal $10 subtotals
 * distributeTax(300 as Cents, [1000, 1000, 1000] as Cents[])
 * // => [100, 100, 100]
 *
 * // Distribute $1.00 tax across unequal subtotals
 * distributeTax(100 as Cents, [5000, 3000, 2000] as Cents[])
 * // => [50, 30, 20]
 * ```
 */
export function distributeTax(
  totalTax: Cents,
  personSubtotals: Cents[]
): Cents[] {
  return allocateProportionally(totalTax, personSubtotals);
}
