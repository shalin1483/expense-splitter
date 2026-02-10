import type { Cents } from "../types/money";
import type { Person, Item, Assignment, TaxInput } from "../types/bill";
import { splitEqually } from "./split";
import { calculateTax, distributeTax } from "./tax";
import { calculateTip, distributeTip } from "./tip";

/**
 * Details of a specific item assigned to a person.
 */
export interface PersonItemDetail {
  itemId: string;
  itemName: string;
  fullPriceInCents: Cents;    // Original item price
  shareInCents: Cents;         // What this person pays for this item
  splitCount: number;          // How many people share this item
  isCustomSplit: boolean;      // Whether custom split is used
}

/**
 * Complete financial breakdown for one person.
 */
export interface PersonBreakdown {
  personId: string;
  personName: string;
  items: PersonItemDetail[];
  itemsSubtotal: Cents;       // Sum of all item shares
  taxShare: Cents;
  tipShare: Cents;
  total: Cents;                // itemsSubtotal + taxShare + tipShare
}

/**
 * Complete bill summary with per-person breakdowns and totals.
 */
export interface BillSummary {
  personBreakdowns: PersonBreakdown[];
  billSubtotal: Cents;         // Sum of all item prices
  totalTax: Cents;
  totalTip: Cents;
  grandTotal: Cents;
}

/**
 * Computes per-person breakdowns from bill state.
 *
 * This is the critical wiring between Phase 1 calculation functions
 * and Phase 5 display. It derives all results from current state
 * with no stored calculations.
 *
 * @param people - All people at the table
 * @param items - All items from the receipt
 * @param assignments - Record mapping itemId to Assignment
 * @param taxInput - Tax configuration (null if no tax)
 * @param tipRate - Tip rate as decimal (e.g., 0.18 = 18%)
 * @returns Complete bill summary with per-person breakdowns
 */
export function computePersonTotals(
  people: Person[],
  items: Item[],
  assignments: Record<string, Assignment>,
  taxInput: TaxInput | null,
  tipRate: number
): BillSummary {
  // Build per-person item details
  const personBreakdowns: PersonBreakdown[] = people.map(person => {
    const personItems: PersonItemDetail[] = [];
    let itemsSubtotal = 0;

    // Find all items assigned to this person
    for (const item of items) {
      const assignment = assignments[item.id];
      if (!assignment || !assignment.personIds.includes(person.id)) {
        continue;
      }

      let shareInCents: Cents;
      const isCustomSplit = !!assignment.customSplit;

      if (assignment.customSplit) {
        // Use custom split amount for this person
        const customEntry = assignment.customSplit.find(
          entry => entry.personId === person.id
        );
        shareInCents = customEntry ? customEntry.amountInCents : (0 as Cents);
      } else {
        // Equal split: use splitEqually and find this person's share
        const shares = splitEqually(item.priceInCents, assignment.personIds.length);
        const personIndex = assignment.personIds.indexOf(person.id);
        shareInCents = shares[personIndex];
      }

      personItems.push({
        itemId: item.id,
        itemName: item.name,
        fullPriceInCents: item.priceInCents,
        shareInCents,
        splitCount: assignment.personIds.length,
        isCustomSplit,
      });

      itemsSubtotal += shareInCents;
    }

    return {
      personId: person.id,
      personName: person.name,
      items: personItems,
      itemsSubtotal: itemsSubtotal as Cents,
      taxShare: 0 as Cents,
      tipShare: 0 as Cents,
      total: itemsSubtotal as Cents,
    };
  });

  // Compute bill-level totals
  const billSubtotal = items.reduce(
    (sum, item) => sum + item.priceInCents,
    0
  ) as Cents;

  const totalTax = taxInput
    ? calculateTax(billSubtotal, taxInput)
    : (0 as Cents);

  const totalTip = calculateTip(billSubtotal, tipRate);

  // Distribute tax and tip across people
  const personSubtotals = personBreakdowns.map(p => p.itemsSubtotal);
  const hasAnySubtotal = personSubtotals.some(s => s > 0);

  let taxShares: Cents[];
  let tipShares: Cents[];

  if (hasAnySubtotal && totalTax > 0) {
    taxShares = distributeTax(totalTax, personSubtotals);
  } else {
    taxShares = personSubtotals.map(() => 0 as Cents);
  }

  if (hasAnySubtotal && totalTip > 0) {
    tipShares = distributeTip(totalTip, personSubtotals);
  } else {
    tipShares = personSubtotals.map(() => 0 as Cents);
  }

  // Apply tax and tip shares to each person
  personBreakdowns.forEach((breakdown, i) => {
    breakdown.taxShare = taxShares[i];
    breakdown.tipShare = tipShares[i];
    breakdown.total = (breakdown.itemsSubtotal + breakdown.taxShare + breakdown.tipShare) as Cents;
  });

  const grandTotal = personBreakdowns.reduce(
    (sum, breakdown) => sum + breakdown.total,
    0
  ) as Cents;

  return {
    personBreakdowns,
    billSubtotal,
    totalTax,
    totalTip,
    grandTotal,
  };
}
