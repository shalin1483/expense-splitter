import { z } from "zod";

/**
 * Zod validation schema for Person.
 * Validates that a person has an id and a non-empty name.
 */
export const PersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});

/**
 * Zod validation schema for Item.
 * Validates that an item has an id, non-empty name, and non-negative price in cents.
 */
export const ItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  priceInCents: z.number().int().nonnegative(),
});

/**
 * Zod validation schema for a single entry in a custom split.
 */
export const CustomSplitEntrySchema = z.object({
  personId: z.string(),
  amountInCents: z.number().int().nonnegative(),
});

/**
 * Zod validation schema for Assignment.
 * Validates item-to-people assignments with optional custom splits.
 */
export const AssignmentSchema = z.object({
  itemId: z.string(),
  personIds: z.array(z.string()),
  customSplit: z.array(CustomSplitEntrySchema).optional(),
});

/**
 * Zod validation schema for TaxInput.
 * Supports both rate-based and exact amount tax inputs.
 */
const TaxInputRateSchema = z.object({
  type: z.literal("rate"),
  rate: z.number().min(0).max(1),
});

const TaxInputExactSchema = z.object({
  type: z.literal("exact"),
  amount: z.number().int().nonnegative(),
});

export const TaxInputSchema = z.union([
  TaxInputRateSchema,
  TaxInputExactSchema,
]);

/**
 * Zod validation schema for complete BillData.
 * Used to validate persisted state when rehydrating from localStorage.
 */
export const BillDataSchema = z.object({
  people: z.array(PersonSchema),
  items: z.array(ItemSchema),
  assignments: z.record(z.string(), AssignmentSchema),
  taxInput: TaxInputSchema.nullable(),
  tipRate: z.number().min(0).max(1),
});

/**
 * Zod validation schema for SavedBill.
 * Extends BillDataSchema with id, timestamp, label, and totalInCents.
 * Used to validate persisted history when rehydrating from localStorage.
 */
export const SavedBillSchema = BillDataSchema.extend({
  id: z.string(),
  timestamp: z.number(),
  label: z.string().optional(),
  totalInCents: z.number().int().nonnegative(),
});
