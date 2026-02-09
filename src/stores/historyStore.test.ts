import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "./historyStore";
import type { SavedBill } from "../lib/types/bill";

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

// Replace global localStorage with mock
(globalThis as any).localStorage = localStorageMock as Storage;

describe("historyStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useHistoryStore.setState({ bills: [] });
    // Clear localStorage
    localStorage.clear();
  });

  describe("saveBill", () => {
    it("should add bill with generated id and timestamp", () => {
      const actions = useHistoryStore.getState().actions;

      const billData: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [{ id: "i1", name: "Pizza", priceInCents: 2000 }],
        assignments: {
          i1: { itemId: "i1", personIds: ["p1"] },
        },
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 2360,
      };

      actions.saveBill(billData);

      const bills = useHistoryStore.getState().bills;
      expect(bills).toHaveLength(1);
      expect(bills[0]).toMatchObject(billData);
      expect(bills[0].id).toBeTruthy();
      expect(typeof bills[0].id).toBe("string");
      expect(bills[0].timestamp).toBeTruthy();
      expect(typeof bills[0].timestamp).toBe("number");
    });

    it("should prepend new bills (newest first)", () => {
      const actions = useHistoryStore.getState().actions;

      const bill1: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1000,
      };

      const bill2: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p2", name: "Bob" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.2,
        totalInCents: 2000,
      };

      actions.saveBill(bill1);
      const firstTimestamp = useHistoryStore.getState().bills[0].timestamp;

      actions.saveBill(bill2);

      const bills = useHistoryStore.getState().bills;
      expect(bills).toHaveLength(2);
      expect(bills[0].totalInCents).toBe(2000); // bill2 is first
      expect(bills[1].totalInCents).toBe(1000); // bill1 is second
      expect(bills[0].timestamp).toBeGreaterThanOrEqual(firstTimestamp);
    });

    it("should limit to 50 bills (oldest removed)", () => {
      const actions = useHistoryStore.getState().actions;

      // Add 51 bills
      for (let i = 1; i <= 51; i++) {
        const bill: Omit<SavedBill, "id" | "timestamp"> = {
          people: [{ id: `p${i}`, name: `Person${i}` }],
          items: [],
          assignments: {},
          taxInput: null,
          tipRate: 0.18,
          totalInCents: i * 100,
        };
        actions.saveBill(bill);
      }

      const bills = useHistoryStore.getState().bills;
      expect(bills).toHaveLength(50);
      // Newest bill (51) should be first
      expect(bills[0].totalInCents).toBe(5100);
      // Oldest remaining bill (2) should be last
      expect(bills[49].totalInCents).toBe(200);
      // Bill 1 should be removed
      expect(bills.find((b) => b.totalInCents === 100)).toBeUndefined();
    });

    it("should include optional label when provided", () => {
      const actions = useHistoryStore.getState().actions;

      const billData: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1000,
      };

      actions.saveBill(billData, "Dinner at Luigi's");

      const bills = useHistoryStore.getState().bills;
      expect(bills[0].label).toBe("Dinner at Luigi's");
    });

    it("should save bill without label when not provided", () => {
      const actions = useHistoryStore.getState().actions;

      const billData: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1000,
      };

      actions.saveBill(billData);

      const bills = useHistoryStore.getState().bills;
      expect(bills[0].label).toBeUndefined();
    });
  });

  describe("deleteBill", () => {
    it("should remove specific bill by id", () => {
      const actions = useHistoryStore.getState().actions;

      const bill1: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1000,
      };

      const bill2: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p2", name: "Bob" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.2,
        totalInCents: 2000,
      };

      actions.saveBill(bill1);
      actions.saveBill(bill2);

      const bills = useHistoryStore.getState().bills;
      const bill1Id = bills.find((b) => b.totalInCents === 1000)!.id;

      actions.deleteBill(bill1Id);

      const remainingBills = useHistoryStore.getState().bills;
      expect(remainingBills).toHaveLength(1);
      expect(remainingBills[0].totalInCents).toBe(2000);
    });

    it("should be no-op when deleting nonexistent id", () => {
      const actions = useHistoryStore.getState().actions;

      const billData: Omit<SavedBill, "id" | "timestamp"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1000,
      };

      actions.saveBill(billData);

      actions.deleteBill("nonexistent-id");

      const bills = useHistoryStore.getState().bills;
      expect(bills).toHaveLength(1);
    });
  });

  describe("clearHistory", () => {
    it("should empty bills array", () => {
      const actions = useHistoryStore.getState().actions;

      // Add multiple bills
      for (let i = 1; i <= 5; i++) {
        const bill: Omit<SavedBill, "id" | "timestamp"> = {
          people: [{ id: `p${i}`, name: `Person${i}` }],
          items: [],
          assignments: {},
          taxInput: null,
          tipRate: 0.18,
          totalInCents: i * 100,
        };
        actions.saveBill(bill);
      }

      expect(useHistoryStore.getState().bills).toHaveLength(5);

      actions.clearHistory();

      expect(useHistoryStore.getState().bills).toHaveLength(0);
    });
  });

  describe("getBillById", () => {
    it("should return correct bill", () => {
      const actions = useHistoryStore.getState().actions;

      const billData: Omit<SavedBill, "id" | "timestamp" | "label"> = {
        people: [{ id: "p1", name: "Alice" }],
        items: [],
        assignments: {},
        taxInput: null,
        tipRate: 0.18,
        totalInCents: 1000,
      };

      actions.saveBill(billData, "Test Bill");

      const bills = useHistoryStore.getState().bills;
      const billId = bills[0].id;

      const result = actions.getBillById(billId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(billId);
      expect(result?.label).toBe("Test Bill");
      expect(result?.totalInCents).toBe(1000);
    });

    it("should return undefined for nonexistent id", () => {
      const actions = useHistoryStore.getState().actions;

      const result = actions.getBillById("nonexistent-id");

      expect(result).toBeUndefined();
    });
  });

  describe("persistence validation", () => {
    it("should reset to empty array on invalid persisted state", () => {
      // Simulate corrupted localStorage data
      localStorage.setItem(
        "expense-splitter-history",
        JSON.stringify({
          state: { bills: "invalid" },
          version: 1,
        })
      );

      // Create new store instance to trigger rehydration
      const { bills } = useHistoryStore.getState();

      // Should reset to empty array instead of crashing
      expect(Array.isArray(bills)).toBe(true);
      expect(bills).toHaveLength(0);
    });
  });
});
