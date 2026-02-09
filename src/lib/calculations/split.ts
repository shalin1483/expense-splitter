import type { Cents } from "../types/money";

/**
 * Splits a total amount equally among a number of people.
 *
 * Uses deterministic remainder distribution: any extra pennies from rounding
 * are given to the first N people (where N = total % numPeople).
 *
 * @example
 * ```ts
 * splitEqually(1200 as Cents, 3) // [400, 400, 400]
 * splitEqually(1000 as Cents, 3) // [334, 333, 333] - first person gets extra penny
 * ```
 *
 * @param total - The total amount to split (in cents)
 * @param numPeople - The number of people to split among
 * @returns Array of shares (in cents), guaranteed to sum to total
 * @throws Error if numPeople <= 0
 */
export function splitEqually(total: Cents, numPeople: number): Cents[] {
  if (numPeople <= 0) {
    throw new Error("Number of people must be greater than 0");
  }

  const baseShare = Math.floor(total / numPeople);
  const remainder = total % numPeople;

  const shares: Cents[] = [];
  for (let i = 0; i < numPeople; i++) {
    // First 'remainder' people get an extra cent
    const share = (i < remainder ? baseShare + 1 : baseShare) as Cents;
    shares.push(share);
  }

  return shares;
}
