import type { Cents } from "./money";
import type { TaxInput } from "../calculations/tax";

/**
 * Represents a person at the table who will be splitting the bill.
 */
export interface Person {
  id: string;
  name: string;
}

/**
 * Represents a line item from the receipt.
 * All prices are stored in integer cents to avoid floating-point precision errors.
 */
export interface Item {
  id: string;
  name: string;
  priceInCents: Cents;
}

/**
 * Custom split amounts for a shared item.
 * Used when people want to split an item unevenly (e.g., one person ate more).
 * Each entry specifies how much a specific person pays for that item.
 */
export type CustomSplit = Array<{
  personId: string;
  amountInCents: Cents;
}>;

/**
 * Represents which people share a specific item.
 *
 * - itemId: The ID of the item being assigned
 * - personIds: Array of person IDs who share this item
 * - customSplit: Optional custom split override. If not provided, item is split equally.
 *
 * Supports requirement ITEM-04 for custom split amounts.
 */
export interface Assignment {
  itemId: string;
  personIds: string[];
  customSplit?: CustomSplit;
}

/**
 * Complete bill state that gets persisted to localStorage.
 *
 * - people: All people at the table
 * - items: All items from the receipt
 * - assignments: Maps itemId -> Assignment for O(1) lookup
 * - taxInput: Tax configuration (null if not yet configured)
 * - tipRate: Tip percentage as decimal (e.g., 0.18 = 18%)
 */
export interface BillData {
  people: Person[];
  items: Item[];
  assignments: Record<string, Assignment>;
  taxInput: TaxInput | null;
  tipRate: number;
}

/**
 * Represents a completed bill saved to history.
 *
 * - id: Unique identifier for the saved bill
 * - timestamp: When the bill was saved (Date.now())
 * - label: Optional user-provided label (e.g., "Dinner at Luigi's")
 * - totalInCents: Cached grand total for display in history list
 * - All BillData fields: Complete snapshot of the bill state
 */
export interface SavedBill extends BillData {
  id: string;
  timestamp: number;
  label?: string;
  totalInCents: Cents;
}

// Re-export TaxInput for convenience
export type { TaxInput };
