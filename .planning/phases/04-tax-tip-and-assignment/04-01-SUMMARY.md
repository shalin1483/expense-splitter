---
phase: 04-tax-tip-and-assignment
plan: 01
subsystem: ui-components
tags: [assignment, ui, validation, custom-split]
dependency_graph:
  requires:
    - 03-01 (PeopleStep for pattern reference)
    - 03-02 (ItemsStep for pattern reference)
    - 02-01 (billStore hooks and actions)
  provides:
    - AssignmentStep component with tap-to-toggle badges
    - canProceedFromAssignment validation helper
    - CustomSplitEditor for uneven item splits
  affects:
    - 04-02 (will integrate AssignmentStep into BillWizard)
tech_stack:
  added:
    - AssignmentStep.css (dedicated styling for assignment UI)
  patterns:
    - Tap-to-toggle badge interaction for person assignment
    - Inline custom split editor with percentage validation
    - Rounding correction for percentage-to-cents conversion
key_files:
  created:
    - src/components/AssignmentStep.tsx (285 lines)
    - src/components/AssignmentStep.css (155 lines)
    - src/components/AssignmentStep.test.tsx (140 lines)
  modified: []
decisions:
  - Equal split percentages give remainder to first person (e.g., 3-way = 34%, 33%, 33%)
  - Rounding correction adjusts largest percentage person when cents don't sum exactly
  - Dedicated CSS file instead of App.css to avoid file ownership conflict with Plan 02
  - Save button disabled when percentage total ≠ 100% (strict validation)
  - Custom split editor appears inline below item (not modal) for simplicity
metrics:
  duration: 163s
  tasks_completed: 2
  tests_added: 10
  files_created: 3
  completed_at: "2026-02-10T01:44:24Z"
---

# Phase 04 Plan 01: Assignment Step Implementation Summary

**One-liner:** Item-to-person assignment UI with tap-to-toggle badges and custom split editor for uneven sharing.

## Objective

Build the AssignmentStep component where users assign items to people using tap-to-toggle person badges, with optional custom split editor for shared items.

## Completion Status

All tasks completed successfully with no deviations from plan.

## Tasks Completed

| Task | Name                                                      | Commit  | Files                                                               |
| ---- | --------------------------------------------------------- | ------- | ------------------------------------------------------------------- |
| 1    | Create AssignmentStep with tap-to-toggle person badges   | dd42356 | src/components/AssignmentStep.tsx, src/components/AssignmentStep.css |
| 2    | Add unit tests for assignment validation and custom split | 525d02b | src/components/AssignmentStep.test.tsx                              |

## Implementation Details

### AssignmentStep Component

**Core features:**
- Item-centric layout: each item shows name, price, and person badges
- Tap-to-toggle interaction: clicking a person badge assigns/unassigns that person to the item
- Assignment summary: displays "Split equally among..." or "Custom split applied"
- Custom split button: appears when 2+ people are assigned to an item
- Revert to equal button: shown when custom split is active

### CustomSplitEditor

**Features:**
- Inline editor (not modal) for simplicity and mobile-friendliness
- Percentage input for each assigned person with validation
- Running total display: green when 100%, red otherwise
- Save button disabled until percentages sum to exactly 100%
- Rounding correction: adjusts largest percentage person to ensure cents sum to item price

**Validation logic:**
- Percentages must be integers 0-100
- Total must equal exactly 100% before save is enabled
- Conversion to cents uses Math.round with correction for rounding errors
- If cents don't sum to item price, difference is added to largest percentage person

### Styling Approach

Created dedicated `AssignmentStep.css` file to avoid file ownership conflict with Plan 02 (which also modifies App.css). This keeps changes isolated and simplifies merge history.

**Key styles:**
- `.person-badge`: 44px min-height for mobile touch targets
- `.person-badge.assigned`: blue background, white text
- `.custom-split-editor`: light gray background, inline layout
- `.split-total.valid/.invalid`: green/red color coding

### Validation Helper

`canProceedFromAssignment(items, assignments)`: returns true if at least one item has at least one person assigned. Follows the pattern of `canProceedFromPeople` and `canProceedFromItems` from Phase 03.

## Deviations from Plan

None. Plan executed exactly as written.

## Testing

**Test coverage:**
- 6 tests for `canProceedFromAssignment`:
  - Empty assignments record
  - Assignments with empty personIds arrays
  - Single item with assignment
  - Multiple items with assignments
  - Single item with multiple people
  - Assignments for non-existent items
- 4 tests for percentage-to-cents conversion:
  - Equal 3-way split (33%, 33%, 34%)
  - Uneven split (50%, 30%, 20%)
  - Rounding correction for odd prices
  - Validation that percentages must sum to 100%

**Results:**
- All 131 tests passing (121 existing + 10 new)
- TypeScript compilation: 0 errors
- No test regressions

## Key Decisions

1. **Equal split remainder to first person:** When percentages don't divide evenly (e.g., 100% ÷ 3 = 33.33%), the remainder goes to the first person. This is simple, deterministic, and matches the `splitEqually` function pattern from Phase 01.

2. **Rounding correction to largest percentage person:** When converting percentages to cents, rounding errors may cause cents to not sum to item price. The difference is added to the person with the largest percentage. This is mathematically fair and matches the "largest remainder method" pattern from Phase 01.

3. **Dedicated CSS file:** Created `AssignmentStep.css` instead of adding to `App.css` to avoid file ownership conflict with Plan 02. This makes git history cleaner and simplifies future maintenance.

4. **Inline editor vs modal:** Custom split editor appears inline below the item (not as a modal). This is simpler to implement, more mobile-friendly, and avoids accessibility complexity of modals.

5. **Strict 100% validation:** Save button is disabled unless percentages sum to exactly 100%. This prevents user error and ensures data integrity. The UI provides immediate visual feedback via the running total color.

## Verification

All success criteria met:

- [x] AssignmentStep component renders all items with tap-to-toggle person badges
- [x] Tapping a person badge on an item calls assignItem with updated personIds
- [x] Items with 2+ people show "Custom Split" option
- [x] CustomSplitEditor validates percentages sum to exactly 100%
- [x] Save converts percentages to cents with rounding correction
- [x] canProceedFromAssignment(items, assignments) returns correct boolean
- [x] All existing + new tests pass (131 total)
- [x] TypeScript compiles with 0 errors

## Next Steps

Plan 04-02 will integrate AssignmentStep into BillWizard navigation flow as Step 3, positioned between ItemsStep (Step 2) and the future Tax/Tip step (Step 4).

## Self-Check

Verifying all created files exist and commits are recorded.

### File Verification

```bash
[ -f "src/components/AssignmentStep.tsx" ] && echo "FOUND: src/components/AssignmentStep.tsx"
[ -f "src/components/AssignmentStep.css" ] && echo "FOUND: src/components/AssignmentStep.css"
[ -f "src/components/AssignmentStep.test.tsx" ] && echo "FOUND: src/components/AssignmentStep.test.tsx"
```

Result:
- FOUND: src/components/AssignmentStep.tsx
- FOUND: src/components/AssignmentStep.css
- FOUND: src/components/AssignmentStep.test.tsx

### Commit Verification

```bash
git log --oneline --all | grep -q "dd42356" && echo "FOUND: dd42356"
git log --oneline --all | grep -q "525d02b" && echo "FOUND: 525d02b"
```

Result:
- FOUND: dd42356 (Task 1: AssignmentStep implementation)
- FOUND: 525d02b (Task 2: Unit tests)

## Self-Check: PASSED

All files created and all commits recorded successfully.
