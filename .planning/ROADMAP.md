# Roadmap: Expense Splitter

## Overview

This roadmap delivers a mobile-first restaurant bill splitter in 5 phases, following the architectural dependency chain from foundation through completion. Each phase builds on the previous, starting with pure calculation logic (Phase 1-2), progressing through the linear wizard UI flow (Phase 3-4), and culminating in results display and persistence (Phase 5). The structure prioritizes addressing critical pitfalls early (integer-cents math, penny distribution, persistence architecture) while following the natural user flow: people → items → assignments → tax/tip → results.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Calculation Engine** - Type system and pure money math
- [x] **Phase 2: State Management & Persistence** - Zustand stores with localStorage
- [x] **Phase 3: People & Items Management** - First wizard steps (add people, add items)
- [x] **Phase 4: Tax, Tip & Assignment** - Middle wizard steps (assign items, calculate splits)
- [x] **Phase 5: Results & History** - Final wizard step (display totals, save history)
- [x] **Phase 6: UI Improvements** - Tailwind CSS v4 + shadcn/ui polish, dark mode, animations

## Phase Details

### Phase 1: Foundation & Calculation Engine
**Goal**: Establish integer-cents architecture and pure calculation functions that handle money math correctly
**Depends on**: Nothing (first phase)
**Requirements**: UX-03 (calculation foundation)
**Success Criteria** (what must be TRUE):
  1. All money amounts stored as integer cents internally (never floats)
  2. Split calculations distribute pennies deterministically (no $0.01 mismatches)
  3. Currency conversion between cents and dollars works bidirectionally
  4. Tax and tip calculations produce exact results matching hand calculations
  5. All calculation functions are pure (no state dependencies, fully testable)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold TypeScript project and create Cents type with money conversions
- [x] 01-02-PLAN.md — Split and allocation algorithms with TDD
- [x] 01-03-PLAN.md — Tax and tip calculation functions with TDD

### Phase 2: State Management & Persistence
**Goal**: Build reactive state layer that auto-persists to localStorage
**Depends on**: Phase 1
**Requirements**: None directly (enables all future features)
**Success Criteria** (what must be TRUE):
  1. Bill state (people, items, assignments) persists across browser refresh
  2. State changes trigger automatic recalculation of totals
  3. Multiple bills can be stored and retrieved from history
  4. State validation prevents invalid configurations (e.g., negative amounts)
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Bill domain types, Zod schemas, and bill store with persist middleware
- [x] 02-02-PLAN.md — History store and integration tests for persistence and recalculation

### Phase 3: People & Items Management
**Goal**: Users can add people and items to start building a bill
**Depends on**: Phase 2
**Requirements**: PEOPLE-01, PEOPLE-02, ITEM-01, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. User can add 2+ people by name to the bill
  2. User can remove a person from the bill
  3. User can add items with name and dollar amount
  4. Mobile keyboard appears with decimal input for prices
  5. Linear wizard flow prevents proceeding without minimum 2 people
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md -- Scaffold Vite+React app and PeopleStep component
- [x] 03-02-PLAN.md -- ItemsStep component and BillWizard with navigation

### Phase 4: Tax, Tip & Assignment
**Goal**: Users can assign items to people and apply tax/tip calculations
**Depends on**: Phase 3
**Requirements**: ITEM-02, ITEM-03, ITEM-04, TAX-01, TAX-02, TAX-03, TIP-01, TIP-02, TIP-03
**Success Criteria** (what must be TRUE):
  1. User can tap items to assign them to specific people
  2. Shared items split equally by default among assigned people
  3. User can override equal split with custom percentages (must total 100%)
  4. User can enter tax as percentage rate or exact dollar amount
  5. User can select tip from presets (15%, 18%, 20%) or enter custom percentage
  6. Tax and tip distribute proportionally across each person's item subtotal
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — AssignmentStep with tap-to-toggle person badges and custom split editor
- [x] 04-02-PLAN.md — TaxTipStep component and BillWizard extension to 4 steps

### Phase 5: Results & History
**Goal**: Users see final totals and can save completed splits
**Depends on**: Phase 4
**Requirements**: RESULT-01, RESULT-02, RESULT-03, UX-03
**Success Criteria** (what must be TRUE):
  1. User sees summary screen with each person's total amount owed
  2. User can expand each person's total to see itemized breakdown (items + tax share + tip share)
  3. User can save completed split to history
  4. User can view list of past splits and recall details
  5. All calculations update instantly as user changes inputs (no calculate button)
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — ResultsStep with derived calculations, expandable breakdowns, and 5-step wizard
- [x] 05-02-PLAN.md — Save to History, HistoryList component, and App shell with history toggle

### Phase 6: UI Improvements
**Goal**: Upgrade the app to a polished, production-grade UI with Tailwind CSS v4, shadcn/ui components, dark mode, and micro-animations
**Depends on**: Phase 5
**Requirements**: ENH-02 (dark mode), UX-01 (mobile-first)
**Success Criteria** (what must be TRUE):
  1. Tailwind CSS v4 installed and App.css migrated to token-based CSS
  2. shadcn/ui components replace plain HTML elements for buttons, cards, and progress
  3. Dark mode toggle works and persists across page refresh
  4. Wizard step transitions animate directionally (forward/back slide)
  5. Save-to-history shows a toast notification (sonner) instead of inline state text
  6. All existing functionality works identically after the visual upgrade
**Plans**: 7 plans

Plans:
- [x] 06-01-PLAN.md — Install Tailwind v4, shadcn/ui, motion, sonner and replace App.css with token foundation
- [x] 06-02-PLAN.md — useDarkMode hook, dark mode toggle in App.tsx, and global Toaster
- [x] 06-03-PLAN.md — BillWizard: shadcn/ui Progress bar and AnimatePresence step transitions
- [x] 06-04-PLAN.md — Migrate PeopleStep and ItemsStep to Tailwind
- [x] 06-05-PLAN.md — Migrate AssignmentStep and TaxTipStep to Tailwind
- [x] 06-06-PLAN.md — Migrate ResultsStep and HistoryList to Tailwind, replace save feedback with sonner toast
- [x] 06-07-PLAN.md — Full test suite and human verification of all 6 success criteria

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Calculation Engine | 3/3 | Complete | 2026-02-09 |
| 2. State Management & Persistence | 2/2 | Complete | 2026-02-09 |
| 3. People & Items Management | 2/2 | Complete | 2026-02-09 |
| 4. Tax, Tip & Assignment | 2/2 | Complete | 2026-02-10 |
| 5. Results & History | 2/2 | Complete | 2026-02-16 |
| 6. UI Improvements | 7/7 | Complete | 2026-02-18 |
