import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedBill } from "../lib/types/bill";
import { SavedBillSchema } from "./schemas";
import { z } from "zod";

/**
 * History state shape.
 * Actions are grouped under 'actions' key to prevent re-renders when selecting them.
 */
interface HistoryState {
  bills: SavedBill[];
  actions: {
    saveBill: (
      bill: Omit<SavedBill, "id" | "timestamp">,
      label?: string
    ) => void;
    deleteBill: (id: string) => void;
    clearHistory: () => void;
    getBillById: (id: string) => SavedBill | undefined;
  };
}

/**
 * Initial state values.
 */
const initialState = {
  bills: [],
};

/**
 * Maximum number of bills to keep in history.
 * Prevents localStorage quota issues.
 */
const MAX_HISTORY_SIZE = 50;

/**
 * History store with persist middleware.
 * Automatically saves saved bills to localStorage and validates on rehydration.
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      actions: {
        saveBill: (
          bill: Omit<SavedBill, "id" | "timestamp">,
          label?: string
        ) => {
          const savedBill: SavedBill = {
            ...bill,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            label,
          };

          set((state) => ({
            bills: [savedBill, ...state.bills].slice(0, MAX_HISTORY_SIZE),
          }));
        },

        deleteBill: (id: string) => {
          set((state) => ({
            bills: state.bills.filter((bill) => bill.id !== id),
          }));
        },

        clearHistory: () => {
          set({ bills: [] });
        },

        getBillById: (id: string) => {
          return get().bills.find((bill) => bill.id === id);
        },
      },
    }),
    {
      name: "expense-splitter-history",
      version: 1,
      // Only persist bills, not actions
      partialize: (state) => ({
        bills: state.bills,
      }),
      // Validate persisted state on rehydration
      migrate: (persistedState: unknown, version: number) => {
        const result = z
          .object({
            bills: z.array(SavedBillSchema),
          })
          .safeParse(persistedState);

        if (!result.success) {
          console.warn(
            "Invalid persisted history state, resetting to defaults:",
            result.error
          );
          return initialState;
        }
        return result.data;
      },
      // Log errors during hydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating history store:", error);
        }
      },
    }
  )
);

/**
 * Selector hook for saved bills array.
 */
export const useSavedBills = () => useHistoryStore((state) => state.bills);

/**
 * Selector hook for history actions object.
 * Returns stable reference, never triggers re-render.
 */
export const useHistoryActions = () =>
  useHistoryStore((state) => state.actions);
