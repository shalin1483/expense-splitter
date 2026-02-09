import { describe, it, expect, beforeEach } from "vitest";
import { useBillStore } from "./billStore";
import { useHistoryStore } from "./historyStore";
import { BillDataSchema } from "./schemas";
import { splitEqually } from "../lib/calculations/split";
import { allocateProportionally } from "../lib/calculations/allocate";
import { calculateTax, distributeTax } from "../lib/calculations/tax";
import { calculateTip, distributeTip } from "../lib/calculations/tip";
import { toCents } from "../lib/types/money";
import type { Cents } from "../lib/types/money";

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Replace global localStorage with mock
(globalThis as any).localStorage = localStorageMock as Storage;

describe("Integration Tests", () => {
  beforeEach(() => {
    // Reset both stores between tests
    useBillStore.getState().actions.reset();
    useHistoryStore.setState({ bills: [] });
    localStorage.clear();
  });

  describe("Recalculation from state", () => {
    it("should correctly calculate per-person totals using Phase 1 functions", () => {
      const billActions = useBillStore.getState().actions;

      // Add 3 people
      billActions.addPerson("Alice");
      billActions.addPerson("Bob");
      billActions.addPerson("Charlie");

      const people = useBillStore.getState().people;
      const [alice, bob, charlie] = people;

      // Add 2 items
      billActions.addItem("Pizza", toCents(30.0));
      billActions.addItem("Salad", toCents(12.0));

      const items = useBillStore.getState().items;
      const [pizza, salad] = items;

      // Assign items: Pizza shared by all 3, Salad by Alice and Bob only
      billActions.assignItem(pizza.id, [alice.id, bob.id, charlie.id]);
      billActions.assignItem(salad.id, [alice.id, bob.id]);

      // Calculate subtotals using Phase 1 functions
      const pizzaSplit = splitEqually(pizza.priceInCents, 3);
      const saladSplit = splitEqually(salad.priceInCents, 2);

      const aliceSubtotal = pizzaSplit[0] + saladSplit[0];
      const bobSubtotal = pizzaSplit[1] + saladSplit[1];
      const charlieSubtotal = pizzaSplit[2];

      // Set rate-based tax (8%)
      billActions.setTaxInput({ type: "rate", rate: 0.08 });

      const subtotal = pizza.priceInCents + salad.priceInCents;
      const taxAmount = calculateTax(subtotal, { type: "rate", rate: 0.08 });
      const taxDistribution = distributeTax(taxAmount, [
        aliceSubtotal,
        bobSubtotal,
        charlieSubtotal,
      ]);

      // Set tip rate (18%)
      billActions.setTipRate(0.18);

      const tipAmount = calculateTip(subtotal, 0.18);
      const tipDistribution = distributeTip(tipAmount, [
        aliceSubtotal,
        bobSubtotal,
        charlieSubtotal,
      ]);

      // Calculate final totals
      const aliceTotal = aliceSubtotal + taxDistribution[0] + tipDistribution[0];
      const bobTotal = bobSubtotal + taxDistribution[1] + tipDistribution[1];
      const charlieTotal =
        charlieSubtotal + taxDistribution[2] + tipDistribution[2];

      const grandTotal = aliceTotal + bobTotal + charlieTotal;

      // Verify all amounts are integer cents
      expect(Number.isInteger(aliceTotal)).toBe(true);
      expect(Number.isInteger(bobTotal)).toBe(true);
      expect(Number.isInteger(charlieTotal)).toBe(true);
      expect(Number.isInteger(grandTotal)).toBe(true);

      // Verify totals sum correctly
      expect(grandTotal).toBe(subtotal + taxAmount + tipAmount);

      // Verify proportional distribution
      expect(aliceTotal).toBe(bobTotal); // Alice and Bob both have pizza + salad
      expect(aliceTotal).toBeGreaterThan(charlieTotal); // Alice/Bob have more than Charlie
      expect(bobTotal).toBeGreaterThan(charlieTotal); // Alice/Bob have more than Charlie
      expect(charlieTotal).toBeGreaterThan(0); // Charlie has pizza only
    });

    it("should handle exact tax amount in recalculation", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("Alice");
      billActions.addPerson("Bob");

      const people = useBillStore.getState().people;
      const [alice, bob] = people;

      billActions.addItem("Burger", toCents(15.0));

      const items = useBillStore.getState().items;
      const [burger] = items;

      billActions.assignItem(burger.id, [alice.id, bob.id]);

      const subtotal = burger.priceInCents;
      const burgerSplit = splitEqually(burger.priceInCents, 2);

      // Use exact tax amount
      const exactTax = toCents(2.5);
      billActions.setTaxInput({ type: "exact", amount: exactTax });

      const taxDistribution = distributeTax(exactTax, burgerSplit);

      const tipAmount = calculateTip(subtotal, 0.2);
      const tipDistribution = distributeTip(tipAmount, burgerSplit);

      const aliceTotal = burgerSplit[0] + taxDistribution[0] + tipDistribution[0];
      const bobTotal = burgerSplit[1] + taxDistribution[1] + tipDistribution[1];

      // Verify all amounts are integer cents
      expect(Number.isInteger(aliceTotal)).toBe(true);
      expect(Number.isInteger(bobTotal)).toBe(true);

      // Verify totals sum correctly
      expect(aliceTotal + bobTotal).toBe(subtotal + exactTax + tipAmount);
    });

    it("should use allocateProportionally for complex splits", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("Alice");
      billActions.addPerson("Bob");
      billActions.addPerson("Charlie");

      const people = useBillStore.getState().people;
      const [alice, bob, charlie] = people;

      billActions.addItem("Appetizer", toCents(20.0));
      billActions.addItem("Main1", toCents(30.0));
      billActions.addItem("Main2", toCents(25.0));

      const items = useBillStore.getState().items;
      const [appetizer, main1, main2] = items;

      // Complex assignment: different people for each item
      billActions.assignItem(appetizer.id, [alice.id, bob.id, charlie.id]);
      billActions.assignItem(main1.id, [alice.id, bob.id]);
      billActions.assignItem(main2.id, [charlie.id]);

      // Calculate subtotals
      const appetizerSplit = splitEqually(appetizer.priceInCents, 3);
      const main1Split = splitEqually(main1.priceInCents, 2);

      const subtotals = [
        appetizerSplit[0] + main1Split[0], // Alice
        appetizerSplit[1] + main1Split[1], // Bob
        appetizerSplit[2] + main2.priceInCents, // Charlie
      ];

      const subtotal = appetizer.priceInCents + main1.priceInCents + main2.priceInCents;

      // Distribute tax proportionally
      const taxAmount = calculateTax(subtotal, { type: "rate", rate: 0.08 });
      const taxDistribution = allocateProportionally(taxAmount, subtotals);

      // Distribute tip proportionally
      const tipAmount = calculateTip(subtotal, 0.18);
      const tipDistribution = allocateProportionally(tipAmount, subtotals);

      // Verify allocation adds up
      const totalTax = taxDistribution.reduce((sum, t) => sum + t, 0);
      const totalTip = tipDistribution.reduce((sum, t) => sum + t, 0);

      expect(totalTax).toBe(taxAmount);
      expect(totalTip).toBe(tipAmount);

      // Verify all are integer cents
      expect(taxDistribution.every((t) => Number.isInteger(t))).toBe(true);
      expect(tipDistribution.every((t) => Number.isInteger(t))).toBe(true);
    });
  });

  describe("Persistence round-trip", () => {
    it("should preserve data through JSON serialization", () => {
      const billActions = useBillStore.getState().actions;

      // Build a bill
      billActions.addPerson("Alice");
      billActions.addPerson("Bob");

      const people = useBillStore.getState().people;
      const [alice, bob] = people;

      billActions.addItem("Pizza", toCents(30.0));

      const items = useBillStore.getState().items;
      const [pizza] = items;

      billActions.assignItem(pizza.id, [alice.id, bob.id]);
      billActions.setTaxInput({ type: "rate", rate: 0.08 });
      billActions.setTipRate(0.18);

      // Get current state
      const originalState = useBillStore.getState();
      const billData = {
        people: originalState.people,
        items: originalState.items,
        assignments: originalState.assignments,
        taxInput: originalState.taxInput,
        tipRate: originalState.tipRate,
      };

      // Simulate persistence: JSON round-trip
      const serialized = JSON.stringify(billData);
      const parsed = JSON.parse(serialized);

      // Validate with schema
      const validationResult = BillDataSchema.safeParse(parsed);

      expect(validationResult.success).toBe(true);

      if (validationResult.success) {
        // Verify data is identical
        expect(validationResult.data.people).toEqual(billData.people);
        expect(validationResult.data.items).toEqual(billData.items);
        expect(validationResult.data.assignments).toEqual(billData.assignments);
        expect(validationResult.data.taxInput).toEqual(billData.taxInput);
        expect(validationResult.data.tipRate).toEqual(billData.tipRate);
      }
    });

    it("should reject invalid persisted state", () => {
      const invalidData = {
        people: [{ id: "p1" }], // Missing name field
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
      };

      const result = BillDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("Cascading cleanup", () => {
    it("should maintain consistency when removing person", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("Alice");
      billActions.addPerson("Bob");

      const people = useBillStore.getState().people;
      const [alice, bob] = people;

      billActions.addItem("Item1", toCents(10.0));
      billActions.addItem("Item2", toCents(20.0));

      const items = useBillStore.getState().items;
      const [item1, item2] = items;

      // Assign both items to both people
      billActions.assignItem(item1.id, [alice.id, bob.id]);
      billActions.assignItem(item2.id, [alice.id, bob.id]);

      // Remove Alice
      billActions.removePerson(alice.id);

      const state = useBillStore.getState();

      // Verify Alice removed from people
      expect(state.people).toHaveLength(1);
      expect(state.people[0].id).toBe(bob.id);

      // Verify Alice removed from assignments
      expect(state.assignments[item1.id].personIds).toEqual([bob.id]);
      expect(state.assignments[item2.id].personIds).toEqual([bob.id]);
    });

    it("should delete assignment when last person removed", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("Alice");

      const people = useBillStore.getState().people;
      const [alice] = people;

      billActions.addItem("Item1", toCents(10.0));

      const items = useBillStore.getState().items;
      const [item1] = items;

      billActions.assignItem(item1.id, [alice.id]);

      // Remove Alice
      billActions.removePerson(alice.id);

      const state = useBillStore.getState();

      // Verify assignment deleted
      expect(state.assignments[item1.id]).toBeUndefined();
    });

    it("should delete assignment when removing item", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("Alice");

      const people = useBillStore.getState().people;
      const [alice] = people;

      billActions.addItem("Item1", toCents(10.0));

      const items = useBillStore.getState().items;
      const [item1] = items;

      billActions.assignItem(item1.id, [alice.id]);

      // Remove item
      billActions.removeItem(item1.id);

      const state = useBillStore.getState();

      // Verify item removed
      expect(state.items).toHaveLength(0);

      // Verify assignment deleted
      expect(state.assignments[item1.id]).toBeUndefined();
    });

    it("should maintain consistency with multiple operations", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("Alice");
      billActions.addPerson("Bob");

      const people = useBillStore.getState().people;
      const [alice, bob] = people;

      billActions.addItem("Item1", toCents(10.0));
      billActions.addItem("Item2", toCents(20.0));

      const items = useBillStore.getState().items;
      const [item1, item2] = items;

      billActions.assignItem(item1.id, [alice.id, bob.id]);
      billActions.assignItem(item2.id, [alice.id, bob.id]);

      // Remove Alice
      billActions.removePerson(alice.id);

      // Remove Item1
      billActions.removeItem(item1.id);

      const state = useBillStore.getState();

      // Verify final state consistency
      expect(state.people).toHaveLength(1);
      expect(state.items).toHaveLength(1);
      expect(Object.keys(state.assignments)).toHaveLength(1);

      // Verify remaining assignment is correct
      expect(state.assignments[item2.id]).toBeDefined();
      expect(state.assignments[item2.id].personIds).toEqual([bob.id]);
    });
  });

  describe("Save bill to history workflow", () => {
    it("should save complete bill snapshot to history", () => {
      const billActions = useBillStore.getState().actions;
      const historyActions = useHistoryStore.getState().actions;

      // Build a complete bill
      billActions.addPerson("Alice");
      billActions.addPerson("Bob");

      const people = useBillStore.getState().people;
      const [alice, bob] = people;

      billActions.addItem("Pizza", toCents(30.0));

      const items = useBillStore.getState().items;
      const [pizza] = items;

      billActions.assignItem(pizza.id, [alice.id, bob.id]);
      billActions.setTaxInput({ type: "rate", rate: 0.08 });
      billActions.setTipRate(0.18);

      // Calculate total
      const subtotal = pizza.priceInCents;
      const taxAmount = calculateTax(subtotal, { type: "rate", rate: 0.08 });
      const tipAmount = calculateTip(subtotal, 0.18);
      const total = subtotal + taxAmount + tipAmount;

      // Save to history
      const billState = useBillStore.getState();
      historyActions.saveBill(
        {
          people: billState.people,
          items: billState.items,
          assignments: billState.assignments,
          taxInput: billState.taxInput,
          tipRate: billState.tipRate,
          totalInCents: total,
        },
        "Pizza Night"
      );

      // Reset bill store
      billActions.reset();

      // Verify billStore is empty
      const billStoreAfterReset = useBillStore.getState();
      expect(billStoreAfterReset.people).toHaveLength(0);
      expect(billStoreAfterReset.items).toHaveLength(0);
      expect(Object.keys(billStoreAfterReset.assignments)).toHaveLength(0);

      // Verify historyStore has the saved bill
      const history = useHistoryStore.getState().bills;
      expect(history).toHaveLength(1);
      expect(history[0].label).toBe("Pizza Night");
      expect(history[0].totalInCents).toBe(total);
      expect(history[0].people).toHaveLength(2);
      expect(history[0].items).toHaveLength(1);
    });

    it("should save multiple bills independently", () => {
      const billActions = useBillStore.getState().actions;
      const historyActions = useHistoryStore.getState().actions;

      // First bill
      billActions.addPerson("Alice");
      const [alice] = useBillStore.getState().people;
      billActions.addItem("Coffee", toCents(5.0));
      const [coffee] = useBillStore.getState().items;
      billActions.assignItem(coffee.id, [alice.id]);

      const total1 = toCents(5.0);
      historyActions.saveBill(
        {
          people: useBillStore.getState().people,
          items: useBillStore.getState().items,
          assignments: useBillStore.getState().assignments,
          taxInput: null,
          tipRate: 0,
          totalInCents: total1,
        },
        "Morning Coffee"
      );

      // Reset and create second bill
      billActions.reset();
      billActions.addPerson("Bob");
      const [bob] = useBillStore.getState().people;
      billActions.addItem("Lunch", toCents(15.0));
      const [lunch] = useBillStore.getState().items;
      billActions.assignItem(lunch.id, [bob.id]);

      const total2 = toCents(15.0);
      historyActions.saveBill(
        {
          people: useBillStore.getState().people,
          items: useBillStore.getState().items,
          assignments: useBillStore.getState().assignments,
          taxInput: null,
          tipRate: 0,
          totalInCents: total2,
        },
        "Business Lunch"
      );

      // Verify both bills in history
      const history = useHistoryStore.getState().bills;
      expect(history).toHaveLength(2);
      expect(history[0].label).toBe("Business Lunch"); // Most recent first
      expect(history[1].label).toBe("Morning Coffee");
    });
  });

  describe("Validation edge cases", () => {
    it("should reject empty person name", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addPerson("");
      billActions.addPerson("   ");

      const people = useBillStore.getState().people;
      expect(people).toHaveLength(0);
    });

    it("should reject negative item price", () => {
      const billActions = useBillStore.getState().actions;

      billActions.addItem("Invalid Item", -100);

      const items = useBillStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it("should clamp tip rate to 0-1 range", () => {
      const billActions = useBillStore.getState().actions;

      billActions.setTipRate(1.5);
      expect(useBillStore.getState().tipRate).toBe(1.0);

      billActions.setTipRate(-0.1);
      expect(useBillStore.getState().tipRate).toBe(0);

      billActions.setTipRate(0.18);
      expect(useBillStore.getState().tipRate).toBe(0.18);
    });

    it("should handle zero tip rate", () => {
      const billActions = useBillStore.getState().actions;

      billActions.setTipRate(0);

      const tipAmount = calculateTip(toCents(100.0), 0);
      expect(tipAmount).toBe(0);
    });

    it("should handle zero tax rate", () => {
      const billActions = useBillStore.getState().actions;

      billActions.setTaxInput({ type: "rate", rate: 0 });

      const taxAmount = calculateTax(toCents(100.0), { type: "rate", rate: 0 });
      expect(taxAmount).toBe(0);
    });

    it("should handle null tax input", () => {
      const billActions = useBillStore.getState().actions;

      billActions.setTaxInput({ type: "rate", rate: 0.08 });
      expect(useBillStore.getState().taxInput).not.toBeNull();

      billActions.setTaxInput(null);
      expect(useBillStore.getState().taxInput).toBeNull();
    });
  });
});
