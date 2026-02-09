---
phase: 02-state-management-and-persistence
plan: 01
subsystem: state-management
tags: [zustand, zod, state, persistence, validation]
dependency_graph:
  requires: [01-01, 01-02, 01-03]
  provides: [bill-store, bill-types, validation-schemas]
  affects: [ui-components]
tech_stack:
  added: [zustand@4.x, zod@4.x, react@19.x]
  patterns: [atomic-selectors, persist-middleware, schema-validation]
key_files:
  created:
    - src/lib/types/bill.ts
    - src/stores/schemas.ts
    - src/stores/billStore.ts
    - src/stores/billStore.test.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - summary: "Use Zod 4 z.union instead of z.discriminatedUnion for TaxInput schema"
    rationale: "Zod 4 API compatibility - z.discriminatedUnion has different signature in Zod 4"
    impact: "Schema validation works correctly with Zod 4 union syntax"
  - summary: "Install React as dependency even though this is calculation-only layer"
    rationale: "Zustand peer dependency requirement for React hooks API"
    impact: "Enables use of Zustand React hooks throughout application"
  - summary: "Mock localStorage in test environment with complete Storage interface"
    rationale: "Node.js test environment lacks browser APIs"
    impact: "Tests run successfully in Node.js, persist middleware functions correctly"
  - summary: "Group store actions under 'actions' key in state"
    rationale: "Prevents re-renders when selecting actions (stable reference)"
    impact: "Performance optimization - UI components can access actions without re-rendering"
metrics:
  duration: 306
  tasks_completed: 2
  tests_added: 23
  total_tests: 76
  files_created: 4
  files_modified: 2
  completed: 2026-02-09T17:41:33Z
---

# Phase 02 Plan 01: State Management Foundation Summary

**One-liner:** Zustand bill store with localStorage persistence, Zod validation schemas, and atomic selector hooks for people, items, assignments, tax, and tip.

## What Was Built

Created the foundational state management layer using Zustand with persist middleware and Zod schema validation. This store manages the complete bill-splitting workflow state including people at the table, receipt items, item-to-person assignments, tax configuration, and tip rate. All state automatically persists to localStorage and validates on rehydration to protect against data corruption.

### Core Components

1. **Bill Domain Types** (`src/lib/types/bill.ts`)
   - Person, Item, Assignment, CustomSplit, BillData interfaces
   - Re-exports TaxInput from calculations layer
   - All money values use Cents type for precision

2. **Validation Schemas** (`src/stores/schemas.ts`)
   - Zod schemas for all domain types
   - BillDataSchema validates complete persisted state
   - Supports both rate and exact tax inputs
   - Custom split validation for unequal item sharing

3. **Bill Store** (`src/stores/billStore.ts`)
   - Zustand store with persist middleware
   - 10 mutation actions: add/remove people/items, manage assignments, set tax/tip, reset
   - Actions grouped under 'actions' key for performance
   - Atomic selector hooks: usePeople, useItems, useAssignments, useTaxInput, useTipRate, useBillActions
   - Auto-persist to localStorage with key 'expense-splitter-bill'
   - Migration function validates state with Zod, falls back to defaults on corruption

4. **Comprehensive Tests** (`src/stores/billStore.test.ts`)
   - 23 test cases covering all store operations
   - Tests cascade deletion (remove person cleans up assignments)
   - Tests validation edge cases (empty names, negative prices)
   - Tests Zod schema validation success and failure paths
   - Mock localStorage for Node.js environment

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added React dependency**
- **Found during:** Task 2 - Running billStore tests
- **Issue:** Zustand requires React as peer dependency; tests failed with "Cannot find package 'react'"
- **Fix:** Installed react@19.x as dependency
- **Files modified:** package.json, package-lock.json
- **Commit:** cd8f39b

**2. [Rule 3 - Blocking] Created localStorage mock for tests**
- **Found during:** Task 2 - Running billStore tests in Node.js environment
- **Issue:** localStorage not available in Node.js; all 23 tests failed with "localStorage.clear is not a function"
- **Fix:** Created complete localStorage mock implementing Storage interface (getItem, setItem, removeItem, clear, length, key)
- **Files modified:** src/stores/billStore.test.ts
- **Commit:** cd8f39b

**3. [Rule 1 - Bug] Fixed Zod 4 API compatibility**
- **Found during:** Task 1 - TypeScript compilation
- **Issue:** Zod 4 z.discriminatedUnion requires different signature; compilation error "Expected 2-3 arguments, but got 1"
- **Fix:** Changed TaxInputSchema to use z.union with separate rate/exact schemas instead of z.discriminatedUnion
- **Files modified:** src/stores/schemas.ts
- **Commit:** bd6a1dd

**4. [Rule 1 - Bug] Fixed Zod 4 z.record signature**
- **Found during:** Task 1 - TypeScript compilation
- **Issue:** Zod 4 z.record requires both key and value type parameters; error "Expected 2-3 arguments, but got 1"
- **Fix:** Changed assignments schema from z.record(AssignmentSchema) to z.record(z.string(), AssignmentSchema)
- **Files modified:** src/stores/schemas.ts
- **Commit:** bd6a1dd

**5. [Rule 1 - Bug] Fixed TypeScript global reference**
- **Found during:** Task 2 - TypeScript compilation of tests
- **Issue:** TypeScript error "Cannot find name 'global'" when setting global.localStorage
- **Fix:** Changed to use globalThis instead: (globalThis as any).localStorage
- **Files modified:** src/stores/billStore.test.ts
- **Commit:** cd8f39b

## Key Implementation Decisions

1. **Atomic Selector Hooks**: Exported individual hooks (usePeople, useItems, etc.) instead of single useStore hook - reduces re-renders by allowing components to subscribe to specific state slices

2. **Actions Object Grouping**: All mutation functions grouped under 'actions' key in state - provides stable reference so selecting actions never triggers re-render

3. **O(1) Assignment Lookup**: Assignments stored as Record<itemId, Assignment> instead of array - enables instant lookup when displaying/editing item assignments

4. **Defensive Validation**: All action inputs validated (trim whitespace, check bounds, reject invalid data) - prevents corrupted state from user input

5. **Cascade Deletion**: Removing person automatically cleans up their assignments; removing item deletes its assignment - maintains referential integrity

6. **Migration Strategy**: Zod validation in persist migrate function with fallback to initial state - protects against localStorage corruption from schema changes or manual edits

## Test Coverage

All 76 tests pass (53 existing calculation tests + 23 new billStore tests):

**People Management (6 tests)**
- Add person with UUID and trimmed name
- Reject empty/whitespace-only names
- Remove person
- Cascade-clean assignments on person removal
- Delete empty assignments

**Item Management (4 tests)**
- Add item with UUID, name, price
- Reject negative prices and empty names
- Remove item and its assignment

**Assignment Management (5 tests)**
- Create assignment linking item to people
- Delete assignment with empty personIds
- Set custom split on existing assignment
- Prevent custom split on nonexistent assignment
- Clear custom split (revert to equal split)

**Tax and Tip (5 tests)**
- Set rate-based tax
- Set exact tax amount
- Clear tax with null
- Set tip rate
- Clamp tip rate to 0-1 range

**Reset (1 test)**
- Reset all state to defaults

**Validation (2 tests)**
- Reject invalid persisted state (empty person name)
- Accept valid persisted state

## Success Criteria Met

- [x] People can be added/removed via store actions; assignments cascade-clean on person removal
- [x] Items can be added/removed via store actions; assignments cascade-delete on item removal
- [x] Tax and tip can be set/cleared via store actions
- [x] Store state round-trips through Zod validation without data loss
- [x] Invalid persisted state falls back to clean defaults
- [x] All 6 selector hooks return correct slices
- [x] Zero test failures across entire test suite

## Files Modified

**Created:**
- `/Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/lib/types/bill.ts` (65 lines)
- `/Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/stores/schemas.ts` (66 lines)
- `/Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/stores/billStore.ts` (256 lines)
- `/Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/stores/billStore.test.ts` (374 lines)

**Modified:**
- `/Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/package.json` (added zustand, zod, react)
- `/Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/package-lock.json` (dependency lockfile)

## Commits

- `bd6a1dd`: feat(02-01): install dependencies and create bill domain types with Zod schemas
- `cd8f39b`: feat(02-01): create bill store with persist middleware, selector hooks, and tests

## Self-Check: PASSED

**Files Created:**
- ✓ src/lib/types/bill.ts
- ✓ src/stores/schemas.ts
- ✓ src/stores/billStore.ts
- ✓ src/stores/billStore.test.ts

**Commits Verified:**
- ✓ bd6a1dd (Task 1: dependencies and domain types)
- ✓ cd8f39b (Task 2: bill store and tests)

**Tests:** 76/76 passing (53 existing + 23 new)
**TypeScript:** Compiles with 0 errors
**All verification criteria met.**
