/**
 * Money type and conversion utilities.
 *
 * Uses integer cents internally to avoid floating-point precision errors.
 * All money values in the application should be stored and calculated as Cents.
 */

/**
 * Represents a monetary value in integer cents.
 * Example: $12.50 is represented as 1250 cents.
 */
export type Cents = number;

/**
 * Converts a dollar amount to integer cents.
 *
 * @param dollars - The dollar amount (can include decimal places)
 * @returns The equivalent value in integer cents
 *
 * @example
 * toCents(12.50) // returns 1250
 * toCents(0.01)  // returns 1
 */
export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100);
}

/**
 * Converts integer cents to a dollar amount.
 *
 * @param cents - The value in integer cents
 * @returns The equivalent dollar amount as a number
 *
 * @example
 * toDollars(1250) // returns 12.5
 * toDollars(1)    // returns 0.01
 */
export function toDollars(cents: Cents): number {
  return cents / 100;
}

/**
 * Formats integer cents as a currency display string.
 *
 * @param cents - The value in integer cents
 * @returns A formatted string with dollar sign and two decimal places
 *
 * @example
 * formatCurrency(1250)  // returns "$12.50"
 * formatCurrency(0)     // returns "$0.00"
 */
export function formatCurrency(cents: Cents): string {
  return `$${(cents / 100).toFixed(2)}`;
}
