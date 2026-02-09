import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Person, Item, Assignment, TaxInput, CustomSplit } from "../lib/types/bill";
import type { Cents } from "../lib/types/money";
import { BillDataSchema } from "./schemas";

/**
 * Bill state shape.
 * Actions are grouped under 'actions' key to prevent re-renders when selecting them.
 */
interface BillState {
  people: Person[];
  items: Item[];
  assignments: Record<string, Assignment>;
  taxInput: TaxInput | null;
  tipRate: number;
  actions: {
    addPerson: (name: string) => void;
    removePerson: (id: string) => void;
    addItem: (name: string, priceInCents: Cents) => void;
    removeItem: (id: string) => void;
    assignItem: (itemId: string, personIds: string[]) => void;
    setCustomSplit: (itemId: string, customSplit: CustomSplit) => void;
    clearCustomSplit: (itemId: string) => void;
    setTaxInput: (input: TaxInput | null) => void;
    setTipRate: (rate: number) => void;
    reset: () => void;
  };
}

/**
 * Initial state values.
 */
const initialState = {
  people: [],
  items: [],
  assignments: {},
  taxInput: null,
  tipRate: 0.18,
};

/**
 * Main bill store with persist middleware.
 * Automatically saves state to localStorage and validates on rehydration.
 */
export const useBillStore = create<BillState>()(
  persist(
    (set) => ({
      ...initialState,
      actions: {
        addPerson: (name: string) => {
          const trimmedName = name.trim();
          if (!trimmedName) return; // No-op for empty names

          set((state) => ({
            people: [
              ...state.people,
              {
                id: crypto.randomUUID(),
                name: trimmedName,
              },
            ],
          }));
        },

        removePerson: (id: string) => {
          set((state) => {
            // Remove person from people array
            const people = state.people.filter((p) => p.id !== id);

            // Clean up assignments: remove person from all assignment personIds arrays
            const assignments = { ...state.assignments };
            for (const itemId in assignments) {
              const assignment = assignments[itemId];
              const personIds = assignment.personIds.filter((pId) => pId !== id);

              // If assignment becomes empty, delete it
              if (personIds.length === 0) {
                delete assignments[itemId];
              } else {
                assignments[itemId] = { ...assignment, personIds };
              }
            }

            return { people, assignments };
          });
        },

        addItem: (name: string, priceInCents: Cents) => {
          const trimmedName = name.trim();
          if (!trimmedName || priceInCents < 0) return; // No-op for invalid inputs

          set((state) => ({
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                name: trimmedName,
                priceInCents,
              },
            ],
          }));
        },

        removeItem: (id: string) => {
          set((state) => {
            // Remove item from items array
            const items = state.items.filter((i) => i.id !== id);

            // Remove assignment for this item
            const assignments = { ...state.assignments };
            delete assignments[id];

            return { items, assignments };
          });
        },

        assignItem: (itemId: string, personIds: string[]) => {
          set((state) => {
            const assignments = { ...state.assignments };

            // If personIds is empty, delete the assignment
            if (personIds.length === 0) {
              delete assignments[itemId];
            } else {
              // Create or update assignment
              assignments[itemId] = {
                itemId,
                personIds,
              };
            }

            return { assignments };
          });
        },

        setCustomSplit: (itemId: string, customSplit: CustomSplit) => {
          set((state) => {
            // Only set custom split if assignment exists
            const assignment = state.assignments[itemId];
            if (!assignment) return state;

            const assignments = {
              ...state.assignments,
              [itemId]: {
                ...assignment,
                customSplit,
              },
            };

            return { assignments };
          });
        },

        clearCustomSplit: (itemId: string) => {
          set((state) => {
            const assignment = state.assignments[itemId];
            if (!assignment) return state;

            const assignments = {
              ...state.assignments,
              [itemId]: {
                itemId: assignment.itemId,
                personIds: assignment.personIds,
                // customSplit is omitted
              },
            };

            return { assignments };
          });
        },

        setTaxInput: (input: TaxInput | null) => {
          set({ taxInput: input });
        },

        setTipRate: (rate: number) => {
          // Clamp to 0-1 range
          const clampedRate = Math.max(0, Math.min(1, rate));
          set({ tipRate: clampedRate });
        },

        reset: () => {
          set(initialState);
        },
      },
    }),
    {
      name: "expense-splitter-bill",
      version: 1,
      // Only persist state, not actions
      partialize: (state) => ({
        people: state.people,
        items: state.items,
        assignments: state.assignments,
        taxInput: state.taxInput,
        tipRate: state.tipRate,
      }),
      // Validate persisted state on rehydration
      migrate: (persistedState: unknown, version: number) => {
        const result = BillDataSchema.safeParse(persistedState);
        if (!result.success) {
          console.warn(
            "Invalid persisted bill state, resetting to defaults:",
            result.error
          );
          return initialState;
        }
        return result.data;
      },
      // Log errors during hydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating bill store:", error);
        }
      },
    }
  )
);

/**
 * Selector hook for people array.
 */
export const usePeople = () => useBillStore((state) => state.people);

/**
 * Selector hook for items array.
 */
export const useItems = () => useBillStore((state) => state.items);

/**
 * Selector hook for assignments record.
 */
export const useAssignments = () => useBillStore((state) => state.assignments);

/**
 * Selector hook for tax input.
 */
export const useTaxInput = () => useBillStore((state) => state.taxInput);

/**
 * Selector hook for tip rate.
 */
export const useTipRate = () => useBillStore((state) => state.tipRate);

/**
 * Selector hook for actions object.
 * Returns stable reference, never triggers re-render.
 */
export const useBillActions = () => useBillStore((state) => state.actions);
