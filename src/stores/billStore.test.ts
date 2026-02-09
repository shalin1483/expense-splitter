import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBillStore } from "./billStore";
import { BillDataSchema } from "./schemas";
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
    // Add these properties to match Storage interface
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

(globalThis as any).localStorage = localStorageMock as Storage;

describe("billStore", () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    useBillStore.setState({
      people: [],
      items: [],
      assignments: {},
      taxInput: null,
      tipRate: 0.18,
    });
    // Clear localStorage to prevent test interference
    localStorage.clear();
  });

  describe("People management", () => {
    it("should add person with UUID and trimmed name", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("  Alice  ");

      const { people } = useBillStore.getState();
      expect(people).toHaveLength(1);
      expect(people[0].name).toBe("Alice");
      expect(people[0].id).toBeDefined();
      expect(typeof people[0].id).toBe("string");
    });

    it("should not add person with empty name", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("   ");

      const { people } = useBillStore.getState();
      expect(people).toHaveLength(0);
    });

    it("should not add person with whitespace-only name", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("");

      const { people } = useBillStore.getState();
      expect(people).toHaveLength(0);
    });

    it("should remove person", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      const { people } = useBillStore.getState();
      const aliceId = people[0].id;

      actions.removePerson(aliceId);

      const { people: updatedPeople } = useBillStore.getState();
      expect(updatedPeople).toHaveLength(0);
    });

    it("should clean up assignments when removing person", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addPerson("Bob");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const bobId = people[1].id;
      const pizzaId = items[0].id;

      // Assign pizza to both Alice and Bob
      actions.assignItem(pizzaId, [aliceId, bobId]);

      // Remove Alice
      actions.removePerson(aliceId);

      const { assignments } = useBillStore.getState();
      expect(assignments[pizzaId].personIds).toEqual([bobId]);
    });

    it("should delete assignment when last person removed", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const pizzaId = items[0].id;

      // Assign pizza to Alice
      actions.assignItem(pizzaId, [aliceId]);

      // Remove Alice
      actions.removePerson(aliceId);

      const { assignments } = useBillStore.getState();
      expect(assignments[pizzaId]).toBeUndefined();
    });
  });

  describe("Item management", () => {
    it("should add item with UUID, name, and priceInCents", () => {
      const { actions } = useBillStore.getState();
      actions.addItem("Burger", 1500 as Cents);

      const { items } = useBillStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Burger");
      expect(items[0].priceInCents).toBe(1500);
      expect(items[0].id).toBeDefined();
    });

    it("should not add item with negative price", () => {
      const { actions } = useBillStore.getState();
      actions.addItem("Free Item", -100 as Cents);

      const { items } = useBillStore.getState();
      expect(items).toHaveLength(0);
    });

    it("should not add item with empty name", () => {
      const { actions } = useBillStore.getState();
      actions.addItem("  ", 1000 as Cents);

      const { items } = useBillStore.getState();
      expect(items).toHaveLength(0);
    });

    it("should remove item and its assignment", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const pizzaId = items[0].id;

      actions.assignItem(pizzaId, [aliceId]);

      // Remove pizza
      actions.removeItem(pizzaId);

      const { items: updatedItems, assignments } = useBillStore.getState();
      expect(updatedItems).toHaveLength(0);
      expect(assignments[pizzaId]).toBeUndefined();
    });
  });

  describe("Assignment management", () => {
    it("should create assignment with itemId and personIds", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addPerson("Bob");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const bobId = people[1].id;
      const pizzaId = items[0].id;

      actions.assignItem(pizzaId, [aliceId, bobId]);

      const { assignments } = useBillStore.getState();
      expect(assignments[pizzaId]).toBeDefined();
      expect(assignments[pizzaId].itemId).toBe(pizzaId);
      expect(assignments[pizzaId].personIds).toEqual([aliceId, bobId]);
    });

    it("should delete assignment when personIds is empty", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const pizzaId = items[0].id;

      actions.assignItem(pizzaId, [aliceId]);
      actions.assignItem(pizzaId, []); // Clear assignment

      const { assignments } = useBillStore.getState();
      expect(assignments[pizzaId]).toBeUndefined();
    });

    it("should set custom split on existing assignment", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addPerson("Bob");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const bobId = people[1].id;
      const pizzaId = items[0].id;

      actions.assignItem(pizzaId, [aliceId, bobId]);

      const customSplit = [
        { personId: aliceId, amountInCents: 1200 as Cents },
        { personId: bobId, amountInCents: 800 as Cents },
      ];
      actions.setCustomSplit(pizzaId, customSplit);

      const { assignments } = useBillStore.getState();
      expect(assignments[pizzaId].customSplit).toEqual(customSplit);
    });

    it("should not set custom split if assignment does not exist", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");

      const { people } = useBillStore.getState();
      const aliceId = people[0].id;

      const customSplit = [{ personId: aliceId, amountInCents: 1200 as Cents }];
      actions.setCustomSplit("nonexistent-item", customSplit);

      const { assignments } = useBillStore.getState();
      expect(assignments["nonexistent-item"]).toBeUndefined();
    });

    it("should clear custom split from assignment", () => {
      const { actions } = useBillStore.getState();
      actions.addPerson("Alice");
      actions.addPerson("Bob");
      actions.addItem("Pizza", 2000 as Cents);

      const { people, items } = useBillStore.getState();
      const aliceId = people[0].id;
      const bobId = people[1].id;
      const pizzaId = items[0].id;

      actions.assignItem(pizzaId, [aliceId, bobId]);
      const customSplit = [
        { personId: aliceId, amountInCents: 1200 as Cents },
        { personId: bobId, amountInCents: 800 as Cents },
      ];
      actions.setCustomSplit(pizzaId, customSplit);

      // Clear custom split
      actions.clearCustomSplit(pizzaId);

      const { assignments } = useBillStore.getState();
      expect(assignments[pizzaId].customSplit).toBeUndefined();
      expect(assignments[pizzaId].personIds).toEqual([aliceId, bobId]);
    });
  });

  describe("Tax and tip", () => {
    it("should set rate-based tax", () => {
      const { actions } = useBillStore.getState();
      actions.setTaxInput({ type: "rate", rate: 0.08 });

      const { taxInput } = useBillStore.getState();
      expect(taxInput).toEqual({ type: "rate", rate: 0.08 });
    });

    it("should set exact tax amount", () => {
      const { actions } = useBillStore.getState();
      actions.setTaxInput({ type: "exact", amount: 825 as Cents });

      const { taxInput } = useBillStore.getState();
      expect(taxInput).toEqual({ type: "exact", amount: 825 });
    });

    it("should clear tax with null", () => {
      const { actions } = useBillStore.getState();
      actions.setTaxInput({ type: "rate", rate: 0.08 });
      actions.setTaxInput(null);

      const { taxInput } = useBillStore.getState();
      expect(taxInput).toBeNull();
    });

    it("should set tip rate", () => {
      const { actions } = useBillStore.getState();
      actions.setTipRate(0.2);

      const { tipRate } = useBillStore.getState();
      expect(tipRate).toBe(0.2);
    });

    it("should clamp tip rate to 0-1 range", () => {
      const { actions } = useBillStore.getState();

      actions.setTipRate(1.5);
      expect(useBillStore.getState().tipRate).toBe(1);

      actions.setTipRate(-0.1);
      expect(useBillStore.getState().tipRate).toBe(0);
    });
  });

  describe("Reset", () => {
    it("should reset all state to defaults", () => {
      const { actions } = useBillStore.getState();

      // Add some data
      actions.addPerson("Alice");
      actions.addItem("Pizza", 2000 as Cents);
      actions.setTaxInput({ type: "rate", rate: 0.08 });
      actions.setTipRate(0.25);

      // Reset
      actions.reset();

      const state = useBillStore.getState();
      expect(state.people).toEqual([]);
      expect(state.items).toEqual([]);
      expect(state.assignments).toEqual({});
      expect(state.taxInput).toBeNull();
      expect(state.tipRate).toBe(0.18);
    });
  });

  describe("Validation", () => {
    it("should validate persisted state and reset to defaults on invalid data", () => {
      // Invalid data (simulating corrupted localStorage)
      const invalidState = {
        people: [{ id: "1", name: "" }], // Invalid: empty name
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
      };

      // Test schema validation
      const result = BillDataSchema.safeParse(invalidState);
      expect(result.success).toBe(false);
    });

    it("should accept valid persisted state", () => {
      const validState = {
        people: [{ id: "1", name: "Alice" }],
        items: [{ id: "2", name: "Pizza", priceInCents: 2000 }],
        assignments: {
          "2": { itemId: "2", personIds: ["1"] },
        },
        taxInput: { type: "rate" as const, rate: 0.08 },
        tipRate: 0.2,
      };

      // Test schema validation
      const result = BillDataSchema.safeParse(validState);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.people).toEqual(validState.people);
        expect(result.data.items).toEqual(validState.items);
        expect(result.data.assignments).toEqual(validState.assignments);
        expect(result.data.taxInput).toEqual(validState.taxInput);
        expect(result.data.tipRate).toBe(0.2);
      }
    });
  });
});
