import { describe, expect, it } from "vitest";
import { computePersonTotals } from "./personTotals";
import type { Person, Item, Assignment } from "../types/bill";
import type { Cents } from "../types/money";

describe("computePersonTotals", () => {
  it("computes basic 2-person bill with equal split", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Burger", priceInCents: 1200 as Cents },
      { id: "i2", name: "Salad", priceInCents: 800 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: "i1", personIds: ["p1"] },
      i2: { itemId: "i2", personIds: ["p2"] },
    };

    const taxInput = { type: "rate" as const, rate: 0.1 }; // 10%
    const tipRate = 0.2; // 20%

    const summary = computePersonTotals(people, items, assignments, taxInput, tipRate);

    // Bill subtotal: 1200 + 800 = 2000
    expect(summary.billSubtotal).toBe(2000);

    // Tax: 10% of 2000 = 200
    expect(summary.totalTax).toBe(200);

    // Tip: 20% of 2000 = 400
    expect(summary.totalTip).toBe(400);

    // Alice: Burger (1200) + tax (120) + tip (240) = 1560
    const alice = summary.personBreakdowns.find(p => p.personId === "p1");
    expect(alice).toBeDefined();
    expect(alice!.itemsSubtotal).toBe(1200);
    expect(alice!.taxShare).toBe(120);
    expect(alice!.tipShare).toBe(240);
    expect(alice!.total).toBe(1560);

    // Bob: Salad (800) + tax (80) + tip (160) = 1040
    const bob = summary.personBreakdowns.find(p => p.personId === "p2");
    expect(bob).toBeDefined();
    expect(bob!.itemsSubtotal).toBe(800);
    expect(bob!.taxShare).toBe(80);
    expect(bob!.tipShare).toBe(160);
    expect(bob!.total).toBe(1040);

    // Grand total should equal sum of person totals
    expect(summary.grandTotal).toBe(1560 + 1040);
  });

  it("handles shared item with equal split", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
      { id: "p3", name: "Charlie" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Pizza", priceInCents: 1800 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: "i1", personIds: ["p1", "p2", "p3"] },
    };

    const summary = computePersonTotals(people, items, assignments, null, 0.18);

    // Pizza split 3 ways: 1800 / 3 = 600 each
    expect(summary.personBreakdowns[0].itemsSubtotal).toBe(600);
    expect(summary.personBreakdowns[1].itemsSubtotal).toBe(600);
    expect(summary.personBreakdowns[2].itemsSubtotal).toBe(600);

    // Verify splitEqually is used correctly (no tax, so just check subtotals)
    const totalSubtotals = summary.personBreakdowns.reduce(
      (sum, p) => sum + p.itemsSubtotal,
      0
    );
    expect(totalSubtotals).toBe(1800);
  });

  it("handles custom split amounts", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Shared Appetizer", priceInCents: 1000 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: {
        itemId: "i1",
        personIds: ["p1", "p2"],
        customSplit: [
          { personId: "p1", amountInCents: 600 as Cents },
          { personId: "p2", amountInCents: 400 as Cents },
        ],
      },
    };

    const summary = computePersonTotals(people, items, assignments, null, 0);

    const alice = summary.personBreakdowns.find(p => p.personId === "p1");
    const bob = summary.personBreakdowns.find(p => p.personId === "p2");

    expect(alice!.itemsSubtotal).toBe(600);
    expect(alice!.items[0].isCustomSplit).toBe(true);

    expect(bob!.itemsSubtotal).toBe(400);
    expect(bob!.items[0].isCustomSplit).toBe(true);
  });

  it("handles no assignments (empty bill)", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Burger", priceInCents: 1200 as Cents },
    ];

    const assignments: Record<string, Assignment> = {};

    const summary = computePersonTotals(people, items, assignments, null, 0.18);

    // All people have zero totals
    expect(summary.personBreakdowns[0].itemsSubtotal).toBe(0);
    expect(summary.personBreakdowns[0].total).toBe(0);
    expect(summary.personBreakdowns[0].items).toHaveLength(0);

    expect(summary.personBreakdowns[1].itemsSubtotal).toBe(0);
    expect(summary.personBreakdowns[1].total).toBe(0);
    expect(summary.personBreakdowns[1].items).toHaveLength(0);

    // Bill subtotal still includes unassigned items
    expect(summary.billSubtotal).toBe(1200);
  });

  it("handles mixed assigned and unassigned items", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Assigned Item", priceInCents: 1000 as Cents },
      { id: "i2", name: "Unassigned Item", priceInCents: 500 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: "i1", personIds: ["p1"] },
      // i2 is not assigned
    };

    const taxInput = { type: "rate" as const, rate: 0.1 };
    const tipRate = 0.2;

    const summary = computePersonTotals(people, items, assignments, taxInput, tipRate);

    // Bill subtotal includes both items
    expect(summary.billSubtotal).toBe(1500);

    // Tax and tip calculated on full bill (1500)
    expect(summary.totalTax).toBe(150); // 10% of 1500
    expect(summary.totalTip).toBe(300); // 20% of 1500

    // Alice only pays for assigned item (1000) but gets full tax/tip
    // since she's the only person with items
    expect(summary.personBreakdowns[0].itemsSubtotal).toBe(1000);
    expect(summary.personBreakdowns[0].items).toHaveLength(1);
    expect(summary.personBreakdowns[0].items[0].itemName).toBe("Assigned Item");
    expect(summary.personBreakdowns[0].taxShare).toBe(150);
    expect(summary.personBreakdowns[0].tipShare).toBe(300);
  });

  it("maintains sum invariant: grand total equals sum of person totals", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
      { id: "p3", name: "Charlie" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Item 1", priceInCents: 1234 as Cents },
      { id: "i2", name: "Item 2", priceInCents: 5678 as Cents },
      { id: "i3", name: "Item 3", priceInCents: 999 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: "i1", personIds: ["p1", "p2"] },
      i2: { itemId: "i2", personIds: ["p2"] },
      i3: { itemId: "i3", personIds: ["p1", "p2", "p3"] },
    };

    const taxInput = { type: "exact" as const, amount: 825 as Cents };
    const tipRate = 0.18;

    const summary = computePersonTotals(people, items, assignments, taxInput, tipRate);

    // Sum of all person totals
    const sumOfPersonTotals = summary.personBreakdowns.reduce(
      (sum, p) => sum + p.total,
      0
    );

    // Should equal grand total
    expect(sumOfPersonTotals).toBe(summary.grandTotal);

    // Grand total should equal subtotal + tax + tip
    expect(summary.grandTotal).toBe(
      summary.billSubtotal + summary.totalTax + summary.totalTip
    );
  });

  it("handles person with no items assigned", () => {
    const people: Person[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];

    const items: Item[] = [
      { id: "i1", name: "Burger", priceInCents: 1200 as Cents },
    ];

    const assignments: Record<string, Assignment> = {
      i1: { itemId: "i1", personIds: ["p1"] },
      // Bob has no items
    };

    const summary = computePersonTotals(people, items, assignments, null, 0.18);

    const bob = summary.personBreakdowns.find(p => p.personId === "p2");
    expect(bob).toBeDefined();
    expect(bob!.itemsSubtotal).toBe(0);
    expect(bob!.items).toHaveLength(0);
    expect(bob!.taxShare).toBe(0);
    expect(bob!.tipShare).toBe(0);
    expect(bob!.total).toBe(0);
  });
});
