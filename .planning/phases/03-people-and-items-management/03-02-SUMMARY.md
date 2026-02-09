---
phase: 03-people-and-items-management
plan: 02
subsystem: ui-foundation
status: complete
completed: 2026-02-09
tags: [react, ui, wizard-flow, items-management, validation-gates, mobile-input]

dependency_graph:
  requires:
    - 03-01-SUMMARY (PeopleStep component and canProceedFromPeople helper)
    - 02-01-SUMMARY (billStore with atomic selectors)
  provides:
    - ItemsStep component with mobile-optimized price input
    - BillWizard container with step navigation and validation gates
    - canProceedFromItems validation helper
  affects:
    - 04-* (Phase 4 will add more wizard steps using same pattern)

tech_stack:
  added: []
  patterns:
    - Mobile-optimized decimal keyboard (inputMode="decimal")
    - Math.round for float-to-integer conversion (prevents floating-point errors)
    - Wizard state machine with validation gates
    - Auto-advance to first incomplete step on refresh
    - Linear step navigation (People -> Items)

key_files:
  created:
    - src/components/ItemsStep.tsx: Items add/remove form with mobile-optimized price input
    - src/components/ItemsStep.test.tsx: canProceedFromItems and price conversion tests
    - src/components/BillWizard.tsx: Wizard container coordinating People and Items steps
    - src/components/BillWizard.test.tsx: Wizard validation gate tests
  modified:
    - src/App.tsx: Replaced PeopleStep with BillWizard
    - src/App.css: Added wizard navigation and items list styles

decisions:
  - "inputMode='decimal' triggers mobile decimal keyboard - better UX than type='number' alone"
  - "Math.round for dollar-to-cents conversion - prevents floating-point errors (e.g., 12.99 * 100 = 1298.9999)"
  - "Auto-advance past completed steps on refresh - improves UX when returning to app"
  - "Validation gates disable Next button - prevents proceeding with invalid state"
  - "Local draft state for form inputs - keeps form state ephemeral (matches 03-01 pattern)"

metrics:
  duration: 13
  tasks_completed: 3
  tests_added: 13
  tests_total: 121
  files_created: 4
  files_modified: 2
  commits: 2
---

# Phase 03 Plan 02: Items Management and Wizard Navigation Summary

**Implemented ItemsStep component with mobile-optimized price input and BillWizard container that orchestrates the linear People -> Items flow with validation gates.**

## Objective

Complete Phase 3 by adding the Items management step (add/remove items with mobile-optimized decimal price input) and implementing the wizard navigation container that enforces the linear People -> Items flow with validation gates preventing progression without minimum requirements.

## Context

This plan built on top of 03-01's PeopleStep component and established the wizard navigation pattern that will be extended in future phases. The wizard enforces a linear flow: users must add 2+ people before accessing the Items step, and the wizard auto-advances past completed steps on page refresh (improving UX when returning to the app with persisted state).

## Implementation Details

### Task 1: Implement ItemsStep Component with Mobile-Optimized Price Input

**What was built:**
- Created ItemsStep component with two controlled form inputs: item name and price
- Connected to billStore via useItems and useBillActions atomic selectors
- Implemented add item flow:
  1. Prevent default form submission
  2. Trim item name and parse price string to float
  3. Validate: non-empty name, valid number, positive price
  4. Convert dollars to cents using Math.round(priceNum * 100) to avoid floating-point errors
  5. Call addItem with name and priceInCents
  6. Clear both inputs
- Implemented remove item: accessible button with aria-label and × symbol
- Price input configured for mobile:
  - type="number" with inputMode="decimal" (triggers decimal keyboard on mobile)
  - step="0.01" (signals decimal input allowed)
  - min="0" (prevents negative values)
  - 16px font size (inherited from App.css, prevents iOS zoom on focus)
- Items list displays each item with formatted price (formatCurrency)
- Running total at bottom (sum of all item.priceInCents, formatted as currency)
- Exported canProceedFromItems(items: Item[]): boolean helper (returns items.length >= 1)
- Added 7 unit tests: 3 for canProceedFromItems validation, 4 for price conversion edge cases

**Key decisions:**
- Used inputMode="decimal" instead of just type="number" - triggers better mobile keyboard with decimal point
- Used Math.round for dollar-to-cents conversion - prevents floating-point errors (12.99 * 100 = 1298.9999... becomes 1299)
- Local useState for draft values (itemName, priceString) - matches PeopleStep pattern, keeps form state ephemeral
- Tested price conversion edge cases explicitly - documents known floating-point pitfalls

**Files created:** src/components/ItemsStep.tsx (83 lines), src/components/ItemsStep.test.tsx (43 lines)

**Verification:**
- 115 tests pass (108 existing + 7 new)
- TypeScript compiles with 0 errors
- Price input shows decimal keyboard on mobile devices
- Math.round conversion handles floating-point edge cases correctly

### Task 2: Implement BillWizard Container with Step Navigation and Validation Gates

**What was built:**
- Created BillWizard container component coordinating People and Items steps
- Defined WizardStep type: 'people' | 'items' (extensible for future phases)
- STEPS constant array: ['people', 'items'] defining step order
- Step labels map for display: { people: 'People', items: 'Items' }
- Local state for currentStep (initialized to 'people')
- Reactive validation gates computed from store state:
  - people step: canProceedFromPeople(people) - requires 2+ people
  - items step: canProceedFromItems(items) - requires 1+ items
- Auto-advance on mount: useEffect checks if people.length >= 2 and currentStep is 'people', auto-advances to 'items'
  - Handles page refresh where Zustand rehydrates state but wizard resets to step 1
- handleNext: if canProceed[currentStep], advance to next step in STEPS array
- handleBack: go to previous step in STEPS array
- Progress indicator: "Step {currentIndex + 1} of {STEPS.length}: {stepLabels[currentStep]}"
- Navigation bar: Back (disabled on first step) and Next (disabled when !canProceed or last step)
- Added 6 wizard validation tests: STEPS ordering, index calculation, combined validation scenarios
- Updated App.tsx to render BillWizard instead of PeopleStep
- Added CSS for wizard navigation, items list, and price display

**Key decisions:**
- Auto-advance to first incomplete step on mount - improves UX with persisted state
- Validation gates computed reactively from store - Next button disabled until requirements met
- STEPS array as const - provides type safety and single source of truth for step order
- Separate validation functions (canProceedFromPeople, canProceedFromItems) - testable in isolation
- Navigation bar with flex layout - Back left, Next right (standard wizard pattern)

**Files created:** src/components/BillWizard.tsx (75 lines), src/components/BillWizard.test.tsx (65 lines)
**Files modified:** src/App.tsx (replaced PeopleStep with BillWizard), src/App.css (added wizard styles)

**Verification:**
- 121 tests pass (115 existing + 6 new)
- TypeScript compiles with 0 errors
- Wizard prevents advancing from People step without 2+ people
- Back/Next navigation works correctly
- Auto-advance on refresh works (tested manually)

### Task 3: Verify Complete Wizard Flow on Mobile Viewport (checkpoint:human-verify)

**What was verified:**
- User opened http://localhost:5173 in browser DevTools mobile viewport (iPhone SE / 375px width)
- People step: input auto-focused, added Alice and Bob, message changed to "2 people added", Next button enabled
- Clicked Next: transitioned to "Step 2 of 2: Items"
- Items step: tapped price input, mobile decimal keyboard appeared
- Added "Pizza" at $12.99 and "Salad" at $8.50
- Total displayed "$21.49"
- Removed "Salad", total updated to "$12.99"
- Clicked Back: returned to People step, Alice and Bob still listed
- Refreshed page: auto-advanced to Items step (people persisted via Zustand localStorage)
- Touch targets verified at least 44px (buttons and inputs tappable)

**User response:** "approved"

**Outcome:** All verification criteria met. Complete wizard flow works correctly on mobile viewport.

## Deviations from Plan

None - plan executed exactly as written. All tasks completed, all verification criteria met, human verification approved.

## Verification Results

All success criteria met:

1. ItemsStep with mobile-optimized decimal price input (inputMode="decimal") - PASSED
2. Dollar-to-cents conversion uses Math.round (handles floating-point edge cases) - PASSED
3. BillWizard coordinates linear People -> Items flow - PASSED
4. Validation gates: 2+ people required, 1+ items to proceed - PASSED
5. Back/Next navigation functional - PASSED
6. Auto-advance past completed steps on page refresh - PASSED
7. Human verified the complete flow works on mobile viewport - PASSED (approved)

**Test results:**
- 121 tests pass (108 baseline + 7 ItemsStep + 6 BillWizard)
- TypeScript compiles with 0 errors

## Output

**Created files:**
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/components/ItemsStep.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/components/ItemsStep.test.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/components/BillWizard.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/components/BillWizard.test.tsx

**Modified files:**
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/App.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/App.css

**Commits:**
- 10c028c: feat(03-02): implement ItemsStep component with mobile-optimized price input
- ade76af: feat(03-02): implement BillWizard container with step navigation and validation gates

## Next Steps

Phase 3 is now complete. Phase 4 will add assignment functionality: users assign items to people (individual or split), and the wizard will add 'assign' and 'tax-tip' steps to the BillWizard flow. The wizard pattern established here (STEPS array, validation gates, auto-advance) will extend cleanly.

## Self-Check: PASSED

All created files verified:
- src/components/ItemsStep.tsx: FOUND
- src/components/ItemsStep.test.tsx: FOUND
- src/components/BillWizard.tsx: FOUND
- src/components/BillWizard.test.tsx: FOUND

All commits verified:
- 10c028c: FOUND
- ade76af: FOUND
