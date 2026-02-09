import type { Cents } from "../types/money";

/**
 * Allocates an amount proportionally across subtotals using the largest remainder method.
 *
 * This algorithm ensures that:
 * 1. Each person's share is proportional to their subtotal
 * 2. The sum of all shares exactly equals the amount to allocate
 * 3. No pennies are lost or created due to rounding
 *
 * The largest remainder method works by:
 * 1. Calculate exact proportional shares (may have decimal places)
 * 2. Floor each share to get base allocation
 * 3. Calculate remaining pennies to distribute
 * 4. Give extra pennies to people with largest remainders
 *
 * @example
 * ```ts
 * // Allocate $3.00 tax across three equal $10 subtotals
 * allocateProportionally(300 as Cents, [1000, 1000, 1000] as Cents[])
 * // => [100, 100, 100]
 *
 * // Allocate $1.00 tip across unequal subtotals
 * allocateProportionally(100 as Cents, [5000, 3000, 2000] as Cents[])
 * // => [50, 30, 20]
 * ```
 *
 * @param amount - The total amount to allocate (in cents)
 * @param subtotals - Array of subtotals to allocate proportionally across
 * @returns Array of allocated shares (in cents), guaranteed to sum to amount
 * @throws Error if subtotals is empty or all subtotals are zero
 */
export function allocateProportionally(
  amount: Cents,
  subtotals: Cents[]
): Cents[] {
  if (subtotals.length === 0) {
    throw new Error("Subtotals array cannot be empty");
  }

  const total = subtotals.reduce((sum, subtotal) => sum + subtotal, 0);

  if (total === 0) {
    throw new Error("Total of subtotals cannot be zero");
  }

  // Calculate exact proportional shares
  const exactShares = subtotals.map((subtotal) => (subtotal / total) * amount);

  // Floor each share to get base allocation
  const floored = exactShares.map((share) => Math.floor(share));

  // Calculate how many cents we still need to distribute
  const distributed = floored.reduce((sum, share) => sum + share, 0);
  const remaining = amount - distributed;

  // Calculate remainders for each share
  const remainders = exactShares.map((exact, i) => ({
    index: i,
    remainder: exact - floored[i],
  }));

  // Sort by remainder descending (largest remainders first)
  remainders.sort((a, b) => b.remainder - a.remainder);

  // Give +1 cent to people with largest remainders
  for (let i = 0; i < remaining; i++) {
    floored[remainders[i].index]++;
  }

  return floored as Cents[];
}
