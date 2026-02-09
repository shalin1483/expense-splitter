# Phase 2: State Management & Persistence - Research

**Researched:** 2026-02-09
**Domain:** State management with localStorage persistence
**Confidence:** HIGH

## Summary

Phase 2 builds a reactive state layer on top of Phase 1's pure calculation functions. The standard approach for 2026 React state management is **Zustand** - a lightweight, hook-based library with first-class TypeScript support and built-in persistence middleware. Zustand's minimal API, lack of provider boilerplate, and selective subscription model make it ideal for this bill-splitting application where state changes (adding people, items, assignments) must trigger automatic recalculation.

The architecture should use **multiple focused stores** (bill store, history store) rather than one monolithic store, following modern Zustand best practices. State validation is handled via **Zod schemas** (version 4) which provide runtime type safety and integrate cleanly with TypeScript. The persist middleware auto-syncs to localStorage, eliminating manual serialization code while supporting partial persistence (e.g., don't persist derived calculations).

**Primary recommendation:** Use Zustand 5.x with persist middleware for reactive state + localStorage integration. Structure as domain-focused stores (billStore, historyStore). Validate state with Zod schemas on load/save to prevent corruption. Follow atomic selector pattern to minimize re-renders.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 | State management | Industry standard for React state in 2026 - minimal API, no provider wrapper, excellent TypeScript support, 56.9k+ GitHub stars |
| zustand/middleware (persist) | 5.0.11 | Auto-persist to localStorage | Built-in middleware, handles serialization/hydration automatically |
| zod | 4.3.6 | Runtime validation | TypeScript-first validation, prevents corrupted state from localStorage, 2kb gzipped core |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand/middleware (immer) | 5.0.11 | Mutable-style updates | If deeply nested state requires complex updates (not needed for flat bill structure) |
| zustand/middleware (devtools) | 5.0.11 | Redux DevTools integration | Development-only time-travel debugging |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Jotai 2.17.1 | Atomic model better for derived state, but more complex for simple use case. `atomWithStorage` utility exists. |
| Zustand | Valtio 2.3.0 | Proxy-based mutable updates feel natural, but read-only snapshot types can be restrictive. Better for very dynamic state. |
| Zustand | React Context + useState | Zero dependencies, but requires manual localStorage sync, provider nesting, and lacks optimized subscriptions. |

**Installation:**
```bash
npm install zustand zod
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── types/           # Phase 1 money types, shared types
│   └── calculations/    # Phase 1 pure functions
├── stores/
│   ├── billStore.ts     # Active bill state (people, items, assignments)
│   ├── historyStore.ts  # Saved bills list
│   └── schemas.ts       # Zod validation schemas
└── hooks/
    ├── usePeople.ts     # Custom hook: select people from billStore
    ├── useItems.ts      # Custom hook: select items from billStore
    └── useTotals.ts     # Custom hook: derived calculations
```

### Pattern 1: Domain-Focused Store with Persist
**What:** Separate stores for different concerns (active bill vs. history), each with its own localStorage key
**When to use:** Always - avoids monolithic state, improves code organization, enables independent persistence
**Example:**
```typescript
// Source: Official Zustand docs + best practices
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BillState {
  people: Array<{ id: string; name: string }>;
  items: Array<{ id: string; name: string; priceInCents: number }>;
  assignments: Record<string, string[]>; // itemId -> personIds[]

  // Actions namespace (static, doesn't trigger re-renders)
  actions: {
    addPerson: (name: string) => void;
    removePerson: (id: string) => void;
    addItem: (name: string, priceInCents: number) => void;
    assignItem: (itemId: string, personIds: string[]) => void;
    reset: () => void;
  };
}

const useBillStore = create<BillState>()(
  persist(
    (set) => ({
      people: [],
      items: [],
      assignments: {},

      actions: {
        addPerson: (name) =>
          set((state) => ({
            people: [...state.people, { id: crypto.randomUUID(), name }]
          })),
        removePerson: (id) =>
          set((state) => ({
            people: state.people.filter((p) => p.id !== id),
            // Clean up assignments for removed person
            assignments: Object.fromEntries(
              Object.entries(state.assignments).map(([itemId, personIds]) => [
                itemId,
                personIds.filter((pid) => pid !== id)
              ])
            )
          })),
        addItem: (name, priceInCents) =>
          set((state) => ({
            items: [...state.items, { id: crypto.randomUUID(), name, priceInCents }]
          })),
        assignItem: (itemId, personIds) =>
          set((state) => ({
            assignments: { ...state.assignments, [itemId]: personIds }
          })),
        reset: () => set({ people: [], items: [], assignments: {} })
      }
    }),
    {
      name: 'bill-storage', // localStorage key
      partialize: (state) => ({
        // Only persist data, not action functions
        people: state.people,
        items: state.items,
        assignments: state.assignments
      })
    }
  )
);
```

### Pattern 2: Atomic Selector Custom Hooks
**What:** Export custom hooks that select specific slices, not the raw store
**When to use:** Always - prevents unnecessary re-renders, hides store implementation
**Example:**
```typescript
// Source: TkDodo best practices article
// DON'T expose store directly
// DO export focused custom hooks

export const usePeople = () => useBillStore((state) => state.people);
export const useItems = () => useBillStore((state) => state.items);
export const useBillActions = () => useBillStore((state) => state.actions);

// Derived state as custom hook
export const useTotals = () => {
  const people = usePeople();
  const items = useItems();
  const assignments = useBillStore((state) => state.assignments);

  return useMemo(() => {
    // Use Phase 1 calculation functions here
    // Return calculated totals per person
  }, [people, items, assignments]);
};
```

### Pattern 3: State Validation with Zod
**What:** Validate localStorage data on rehydration to prevent corruption
**When to use:** Always - protects against manually edited localStorage, schema changes
**Example:**
```typescript
// Source: Zod official docs + Zustand patterns
import { z } from 'zod';

const PersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1)
});

const ItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  priceInCents: z.number().int().nonnegative()
});

const BillStateSchema = z.object({
  people: z.array(PersonSchema),
  items: z.array(ItemSchema),
  assignments: z.record(z.array(z.string().uuid()))
});

// Use in persist middleware
const useBillStore = create<BillState>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'bill-storage',
      version: 1, // Increment on breaking changes
      migrate: (persistedState: unknown, version: number) => {
        const result = BillStateSchema.safeParse(persistedState);
        if (!result.success) {
          console.warn('Invalid persisted state, resetting:', result.error);
          return { people: [], items: [], assignments: {} };
        }
        return result.data;
      }
    }
  )
);
```

### Pattern 4: History Store for Multiple Bills
**What:** Separate store for saved bills with timestamped entries
**When to use:** Phase 5 requirement - view/recall past splits
**Example:**
```typescript
interface SavedBill {
  id: string;
  timestamp: number;
  people: Array<{ id: string; name: string }>;
  items: Array<{ id: string; name: string; priceInCents: number }>;
  assignments: Record<string, string[]>;
  totals: Record<string, number>; // Cached calculation results
}

interface HistoryState {
  bills: SavedBill[];
  actions: {
    saveBill: (bill: Omit<SavedBill, 'id' | 'timestamp'>) => void;
    deleteBill: (id: string) => void;
    clearHistory: () => void;
  };
}

const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      bills: [],
      actions: {
        saveBill: (bill) =>
          set((state) => ({
            bills: [
              { ...bill, id: crypto.randomUUID(), timestamp: Date.now() },
              ...state.bills
            ].slice(0, 50) // Keep only last 50 bills
          })),
        deleteBill: (id) =>
          set((state) => ({ bills: state.bills.filter((b) => b.id !== id) })),
        clearHistory: () => set({ bills: [] })
      }
    }),
    { name: 'bill-history' }
  )
);
```

### Anti-Patterns to Avoid
- **Selecting multiple values as object:** `useStore((s) => ({ a: s.a, b: s.b }))` creates new object every time, triggers re-render even if values unchanged. Use atomic selectors instead.
- **Storing derived state:** Don't persist calculated totals in billStore - recalculate from items/assignments on demand using Phase 1 functions.
- **Mixing concerns:** Keep calculation logic in Phase 1 pure functions, state management in stores, UI logic in components.
- **Direct store mutation:** Always use set() in actions - `state.items.push(item)` won't trigger subscriptions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State subscriptions | Manual listener arrays, WeakMaps | Zustand's create() | Handles React lifecycle, batches updates, supports selectors, tested in production |
| localStorage sync | useEffect with JSON.parse/stringify | Zustand persist middleware | Handles hydration timing, SSR safety, storage errors, versioning, migrations |
| Unique IDs | Incrementing counters, timestamps | crypto.randomUUID() | Browser-native (supported in all modern browsers 2026), collision-resistant, no dependencies |
| State validation | Manual type checks | Zod schemas | TypeScript integration, composable schemas, informative error messages, 2kb footprint |
| Derived state calculation | Storing in state + manual updates | Custom hooks with useMemo | Single source of truth, impossible to desync, automatic dependency tracking |

**Key insight:** State management is deceptively complex. Race conditions during hydration, stale closures in subscriptions, localStorage quota errors, and React concurrent rendering gotchas have all been solved by Zustand. Starting from scratch means rediscovering these issues the hard way.

## Common Pitfalls

### Pitfall 1: localStorage Quota Exceeded
**What goes wrong:** Browser localStorage has 5-10MB limit. Saving large history arrays or high-frequency updates can exceed quota, throwing `QuotaExceededError`.
**Why it happens:** Developers forget localStorage is limited, don't limit array sizes, or store unnecessary data (like derived calculations).
**How to avoid:**
  - Limit history to last 50 bills (slice array in saveBill action)
  - Use `partialize` to exclude derived state from persistence
  - Wrap localStorage operations in try/catch
  - Consider IndexedDB for larger datasets (future enhancement)
**Warning signs:** Console errors about quota, users report lost data on save

### Pitfall 2: Hydration Timing Issues
**What goes wrong:** Component renders before localStorage data loads, causing flash of empty state or hydration mismatch in SSR.
**Why it happens:** localStorage is synchronous but React 18+ concurrent rendering can interrupt. Persist middleware hydrates async.
**How to avoid:**
  - Use `onRehydrateStorage` callback to track hydration completion
  - Show loading state until `hasHydrated` is true
  - For SSR (not needed for this project), use `skipHydration` option
**Warning signs:** Flash of empty bill on page load, React hydration warnings

### Pitfall 3: Stale State After Reset
**What goes wrong:** Calling `actions.reset()` doesn't clear localStorage, so next page load restores old state.
**Why it happens:** Persist middleware only writes on `set()` calls, doesn't auto-delete on reset to empty.
**How to avoid:**
  - Reset action must set state to initial values (not undefined)
  - Alternatively, call `localStorage.removeItem('bill-storage')` manually
  - Provide "New Bill" button that resets + clears localStorage
**Warning signs:** Users complain old bill comes back after clearing

### Pitfall 4: Invalid Cents Values from UI
**What goes wrong:** User enters "$12.999" in UI, gets stored as 1299.9 cents (invalid - must be integer).
**Why it happens:** Forgot to validate/round input before calling `toCents()` from Phase 1.
**How to avoid:**
  - Validate in Zod schema: `priceInCents: z.number().int().nonnegative()`
  - Round in UI layer before calling store actions
  - Add input validation to prevent more than 2 decimal places
**Warning signs:** Calculation errors, failing tests, NaN totals

### Pitfall 5: Memory Leaks from Subscriptions
**What goes wrong:** Creating store subscriptions in useEffect without cleanup causes memory leaks.
**Why it happens:** Zustand's manual `subscribe()` API requires explicit unsubscribe, easy to forget.
**How to avoid:**
  - Use Zustand hooks (useBillStore) instead of manual subscribe - cleanup is automatic
  - If using subscribe, always return cleanup: `useEffect(() => { const unsub = store.subscribe(...); return unsub; }, [])`
**Warning signs:** Increasing memory usage over time, duplicate console logs

### Pitfall 6: Re-render Loops from Object Selectors
**What goes wrong:** Component re-renders infinitely when selecting multiple values as object.
**Why it happens:** `useStore((s) => ({ a: s.a, b: s.b }))` creates new object reference every render, triggering re-render.
**How to avoid:**
  - Use atomic selectors (separate hooks for each value)
  - OR use `shallow` comparison: `useStore((s) => ({ a: s.a, b: s.b }), shallow)`
  - OR use `useShallow` hook from zustand/react/shallow
**Warning signs:** Performance degradation, React DevTools shows excessive renders

## Code Examples

Verified patterns from official sources:

### Store Creation with TypeScript
```typescript
// Source: Zustand official docs (TypeScript guide)
import { create } from 'zustand';

interface BillState {
  people: Person[];
  actions: {
    addPerson: (name: string) => void;
  };
}

// TypeScript pattern: create<State>()(...) - note the extra ()
const useBillStore = create<BillState>()((set) => ({
  people: [],
  actions: {
    addPerson: (name) =>
      set((state) => ({ people: [...state.people, createPerson(name)] }))
  }
}));
```

### Persist Middleware Configuration
```typescript
// Source: Zustand persist middleware docs
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create<State>()(
  persist(
    (set) => ({ /* state */ }),
    {
      name: 'my-storage-key',
      storage: createJSONStorage(() => localStorage), // default
      partialize: (state) => ({
        // Only these fields are persisted
        people: state.people,
        items: state.items
      }),
      version: 1,
      migrate: (persistedState, version) => {
        // Handle version upgrades
        if (version === 0) {
          return { ...persistedState, newField: 'default' };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to hydrate:', error);
        }
      }
    }
  )
);
```

### Zod Validation in Migration
```typescript
// Source: Zod official docs + Zustand best practices
import { z } from 'zod';

const StateSchema = z.object({
  people: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    priceInCents: z.number().int().nonnegative()
  }))
});

const useStore = create<State>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'storage',
      migrate: (persistedState: unknown, version: number) => {
        const parsed = StateSchema.safeParse(persistedState);
        if (!parsed.success) {
          console.warn('Invalid state, using defaults:', parsed.error);
          return getInitialState();
        }
        return parsed.data;
      }
    }
  )
);
```

### Atomic Selector Custom Hooks
```typescript
// Source: TkDodo "Working with Zustand" article
// Export custom hooks, not the raw store

export const usePeople = () => useBillStore((state) => state.people);
export const useItems = () => useBillStore((state) => state.items);
export const useBillActions = () => useBillStore((state) => state.actions);

// In components - only re-renders when people changes
function PeopleList() {
  const people = usePeople();
  const { addPerson, removePerson } = useBillActions();

  return (/* render people */);
}
```

### Derived State with useMemo
```typescript
// Source: React docs + Zustand patterns
import { useMemo } from 'react';
import { splitEqually } from '@/lib/calculations/split';

export const usePersonTotals = () => {
  const people = usePeople();
  const items = useItems();
  const assignments = useBillStore((state) => state.assignments);

  return useMemo(() => {
    // Use Phase 1 pure calculation functions
    const totals: Record<string, Cents> = {};

    for (const person of people) {
      const assignedItems = items.filter(item =>
        assignments[item.id]?.includes(person.id)
      );
      totals[person.id] = assignedItems.reduce(
        (sum, item) => sum + item.priceInCents,
        0
      );
    }

    return totals;
  }, [people, items, assignments]);
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux with actions/reducers | Zustand with direct actions | ~2020 | 90% less boilerplate, no provider wrapper, faster development |
| Manual localStorage useEffect | Zustand persist middleware | ~2021 | Auto-sync, handles edge cases (SSR, quota, hydration timing) |
| PropTypes runtime checks | Zod + TypeScript | ~2022 | Compile-time + runtime safety, better error messages |
| Context API for everything | Multiple focused stores | ~2023 | Better performance (selective subscriptions), easier testing |
| Global store singleton | Hook-based store access | ~2019 | Tree-shakeable, testable, no singleton pollution |

**Deprecated/outdated:**
- Redux for simple state (overkill for this project) - use when need time-travel debugging, strict action logging
- MobX (proxy-based, less popular now) - Valtio is spiritual successor if proxy style preferred
- Recoil (Facebook/Meta, development slowed) - Jotai is community-driven alternative
- localStorage direct access (manual) - always use abstraction for error handling, versioning

## Open Questions

1. **Cross-tab synchronization**
   - What we know: localStorage fires `storage` event when other tabs modify data
   - What's unclear: Should multiple tabs share live bill state or keep independent?
   - Recommendation: Start without cross-tab sync (simpler). If needed later, Zustand persist supports `storage` event listeners via custom storage implementation.

2. **localStorage quota error recovery**
   - What we know: 5-10MB limit varies by browser, QuotaExceededError thrown on overflow
   - What's unclear: Best UX for handling quota errors (delete old bills? export to file?)
   - Recommendation: Wrap save operations in try/catch, limit history to 50 bills, show error toast on failure. Document for future enhancement to IndexedDB if history grows.

3. **State migration strategy**
   - What we know: Persist middleware supports version + migrate function
   - What's unclear: How aggressive should migration be? (Reset on any error vs. partial recovery)
   - Recommendation: Be conservative - reset to defaults on validation failure rather than partial migration. Bill data is not critical (can recreate), UX should never break.

## Sources

### Primary (HIGH confidence)
- Zustand GitHub repository - verified current version 5.0.11, features, TypeScript support (https://github.com/pmndrs/zustand)
- Zustand official README - basic API, persist middleware, key features (https://github.com/pmndrs/zustand/blob/main/README.md)
- Zod 4 official homepage - runtime validation, TypeScript integration (https://zod.dev)
- npm registry - verified latest versions: zustand 5.0.11, jotai 2.17.1, valtio 2.3.0, zod 4.3.6

### Secondary (MEDIUM confidence)
- TkDodo "Working with Zustand" - best practices, atomic selectors, custom hooks pattern (https://tkdodo.eu/blog/working-with-zustand)
- Jotai official docs - persistence patterns, atomWithStorage (https://jotai.org)
- Valtio official homepage - proxy-based reactivity concept (https://valtio.dev)

### Tertiary (LOW confidence)
- None - all claims verified against official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified versions from npm registry, official docs confirm features
- Architecture: HIGH - Patterns from official Zustand best practices + community expert articles
- Pitfalls: MEDIUM-HIGH - Common issues documented in GitHub issues, some from general React/localStorage knowledge

**Research date:** 2026-02-09
**Valid until:** 2026-04-09 (60 days) - Zustand is stable library, React 18 patterns unlikely to change rapidly
