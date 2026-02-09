import type { Cents } from "../types/money";
import { allocateProportionally } from "./allocate";

/**
 * Calculates the tip amount based on a percentage rate.
 *
 * Note: Tip is calculated on the pre-tax subtotal, which is the most common
 * convention in restaurants. The subtotal parameter should be the sum of all
 * items before tax is applied.
 *
 * @param subtotal - The pre-tax subtotal in cents
 * @param rate - The tip rate as a decimal (e.g., 0.18 = 18%, 0.20 = 20%)
 * @returns The calculated tip amount in cents
 *
 * @example
 * ```ts
 * // Calculate 18% tip on $100.00
 * calculateTip(10000 as Cents, 0.18)
 * // => 1800 ($18.00)
 *
 * // Calculate 20% tip on $50.00
 * calculateTip(5000 as Cents, 0.20)
 * // => 1000 ($10.00)
 * ```
 */
export function calculateTip(subtotal: Cents, rate: number): Cents {
  return Math.round(subtotal * rate) as Cents;
}

/**
 * Distributes a total tip amount proportionally across person subtotals.
 *
 * Uses the largest remainder method to ensure:
 * 1. Each person's tip share is proportional to their subtotal
 * 2. The sum of all tip shares exactly equals the total tip
 * 3. No pennies are lost or created
 *
 * Note: The personSubtotals should be pre-tax amounts, matching the convention
 * that tip is calculated on the subtotal before tax.
 *
 * @param totalTip - The total tip amount to distribute (in cents)
 * @param personSubtotals - Array of each person's pre-tax subtotal (in cents)
 * @returns Array of tip shares for each person (in cents)
 *
 * @example
 * ```ts
 * // Distribute $6.00 tip across three equal $20 subtotals
 * distributeTip(600 as Cents, [2000, 2000, 2000] as Cents[])
 * // => [200, 200, 200]
 *
 * // Distribute $10.00 tip across unequal subtotals
 * distributeTip(1000 as Cents, [5000, 3000, 2000] as Cents[])
 * // => [500, 300, 200]
 * ```
 */
export function distributeTip(
  totalTip: Cents,
  personSubtotals: Cents[]
): Cents[] {
  return allocateProportionally(totalTip, personSubtotals);
}
