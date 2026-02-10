---
phase: 04-tax-tip-and-assignment
plan: 02
subsystem: ui-components
tags: [tax, tip, wizard, validation, mobile-ui]
dependency_graph:
  requires:
    - 04-01 (AssignmentStep component and validation helper)
    - 03-02 (BillWizard container with step navigation)
    - 02-01 (billStore tax/tip hooks and actions)
  provides:
    - TaxTipStep component with tax mode toggle and tip presets
    - 4-step wizard flow with Assignment and Tax/Tip steps
    - Complete Phase 4 UI for tax/tip configuration
  affects:
    - 05-results-and-calculation (will consume tax/tip values for final calculations)
tech_stack:
  added:
    - TaxTipStep component (239 lines)
    - Tax mode toggle (rate vs exact amount)
    - Tip preset buttons (15%, 18%, 20%)
  patterns:
    - Real-time store updates (no Apply button needed)
    - Tax rate percentage and exact dollar amount support
    - Tip preset buttons with aria-pressed for mobile UX
    - Consolidation of Phase 4 CSS into App.css
key_files:
  created:
    - src/components/TaxTipStep.tsx (239 lines)
    - src/components/TaxTipStep.test.tsx (83 lines)
  modified:
    - src/components/BillWizard.tsx (added Assignment and TaxTip steps)
    - src/components/BillWizard.test.tsx (updated for 4-step validation)
    - src/App.css (+272 lines: Assignment and TaxTip styles)
    - src/components/AssignmentStep.tsx (removed CSS import)
    - src/components/AssignmentStep.css (deleted, moved to App.css)
decisions:
  - Real-time store updates on valid input (no Apply button) - matches research guidance
  - Tax mode toggle (rate vs exact) covers all receipt formats
  - Tip presets use buttons with aria-pressed (not radio inputs) for better mobile UX
  - Consolidate all Phase 4 CSS into App.css for consistency
  - Tax/Tip step always valid (reasonable defaults: null tax + 18% tip)
metrics:
  duration: 99s
  tasks_completed: 3
  tests_added: 12
  files_created: 2
  completed_at: "2026-02-10T01:50:53Z"
---

# Phase 04 Plan 02: Tax & Tip Configuration with 4-Step Wizard Summary

**One-liner:** Tax mode toggle (rate vs exact dollar amount), tip presets (15/18/20%), and 4-step wizard flow with validation gates.

## Objective

Build the TaxTipStep component for tax/tip configuration and extend BillWizard to include Assignment and Tax/Tip as steps 3 and 4 of the wizard flow, completing the Phase 4 UI for tax/tip input.

## Completion Status

All tasks completed successfully with human verification of mobile viewport behavior confirmed by user.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create TaxTipStep with tax mode toggle and tip presets | 260eace | src/components/TaxTipStep.tsx, src/components/TaxTipStep.test.tsx |
| 2 | Extend BillWizard to 4 steps with validation gates | 0d5beb6 | src/components/BillWizard.tsx, src/App.css, src/components/AssignmentStep.tsx |
| 3 | Verify complete Phase 4 wizard flow on mobile viewport | User approved | N/A (human verification checkpoint) |

## Implementation Details

### TaxTipStep Component

**Tax Configuration:**
- Radio button group toggling between "Tax Rate (%)" and "Exact Amount ($)" modes
- Rate mode: number input for percentage (0-100%, decimal allowed)
- Exact mode: number input for dollar amount (decimal, min 0)
- Real-time store updates on valid input using setTaxInput with TaxInput discriminated union
- "No Tax" button clears tax configuration
- Preview text shows current config: "Tax: 8.0%" or "Tax: $8.25" or "No tax configured"
- State persists across wizard navigation by initializing from store on mount

**Tip Configuration:**
- Preset buttons: 15%, 18%, 20% as styled toggle buttons with aria-pressed
- Tapping a preset immediately updates store and highlights active button
- Custom percentage input below presets for non-standard tip amounts
- When preset tapped, custom input display updates to match
- Active state determined by comparing current tipRate to preset values
- Store's setTipRate clamps to 0-1 range automatically

**Key Design Decision:** No "Apply" button needed. Tax and tip values are written to store on every valid input change. This matches real-time pattern and avoids the "forgot to click Apply" pitfall mentioned in Phase 4 research.

### BillWizard 4-Step Extension

**Wizard Updates:**
- Updated WizardStep type: 'people' | 'items' | 'assignment' | 'taxtip'
- Updated STEPS array: ['people', 'items', 'assignment', 'taxtip']
- Updated stepLabels: { people: 'People', items: 'Items', assignment: 'Assign Items', taxtip: 'Tax & Tip' }
- Imported AssignmentStep and TaxTipStep components
- Added rendering cases for assignment and taxtip steps

**Validation Gates:**
- people: canProceedFromPeople(people) → requires 2+ people
- items: canProceedFromItems(items) → requires 1+ item
- assignment: canProceedFromAssignment(items, assignments) → requires 1+ assigned item
- taxtip: true (always valid - has reasonable defaults: null tax + 18% tip)

**Auto-Advance Logic:**
- Checks each step in order on mount/refresh
- If people.length >= 2 AND items.length >= 1 AND hasAssignments: advance to 'taxtip'
- If people.length >= 2 AND items.length >= 1: advance to 'assignment'
- If people.length >= 2: advance to 'items'
- hasAssignments = items.some(item => assignments[item.id]?.personIds.length > 0)

### CSS Consolidation

**Consolidated all Phase 4 CSS into App.css:**
- Removed separate `AssignmentStep.css` file (172 lines)
- Added +272 lines to App.css covering Assignment and TaxTip styles
- Removed CSS import from AssignmentStep.tsx
- Maintained consistent styling patterns with existing components
- All touch targets >= 44px for mobile viewport (375px)

**Key CSS classes added:**
- `.item-assignment`, `.item-header`, `.person-badges` (Assignment step)
- `.person-badge`, `.person-badge.assigned` (tap-to-toggle interaction)
- `.custom-split-editor`, `.split-total.valid/.invalid` (custom split UI)
- `.tax-tip-step`, `.tax-mode`, `.tax-input-row` (tax configuration)
- `.tip-presets`, `.tip-preset`, `.tip-preset.active` (tip preset buttons)
- `.no-tax-btn`, `.tax-preview`, `.tip-preview` (helper elements)

## Deviations from Plan

None. Plan executed exactly as written.

## Testing

**Test coverage:**
- 4 new tests in TaxTipStep.test.tsx:
  - Tax rate mode: valid percentage converts to correct TaxInput
  - Tax exact mode: valid dollar string converts to correct TaxInput with toCents
  - Tip preset values: each preset maps to correct decimal rate
  - Default tip rate: store initializes with 0.18
- 8 updated tests in BillWizard.test.tsx:
  - Updated STEPS ordering test for 4 steps
  - Added canProceedFromAssignment gate tests
  - Added taxtip step validation test (always true)
  - Added 4-step auto-advance tests

**Results:**
- All 143 tests passing (131 existing + 12 new)
- TypeScript compilation: 0 errors
- No test regressions

## Human Verification

**Task 3 checkpoint results:**

User tested complete Phase 4 wizard flow on mobile viewport (iPhone SE / 375px) and confirmed:
- ✓ People step: Add 3 people, proceed
- ✓ Items step: Add 3 items with prices, proceed
- ✓ Assignment step: Tap-to-toggle badges work, custom split validation works
- ✓ Tax & Tip step: Mode toggle works, tip presets work, preview displays correctly
- ✓ Navigation: Back/forward preserves all state
- ✓ Touch targets: All >= 44px
- ✓ Refresh: Auto-advances to furthest completed step

**User response:** "approved"

## Key Decisions

1. **Real-time store updates (no Apply button):** Tax and tip values write to store on every valid input change. This matches the real-time pattern from PeopleStep/ItemsStep and avoids the "forgot to click Apply" pitfall mentioned in research.

2. **Tax mode toggle:** Radio toggle between rate (%) and exact amount ($) covers all receipt formats. Some receipts show rate, others show total tax amount.

3. **Tip presets as buttons (not radio inputs):** Using styled buttons with aria-pressed provides better mobile UX than radio inputs. Tap targets are larger and more natural for mobile interaction.

4. **Consolidate Phase 4 CSS into App.css:** Moved all Phase 4 styles (Assignment + TaxTip) into App.css for consistency with the rest of the project. Removed separate AssignmentStep.css file to maintain single source of truth for styles.

5. **Tax/Tip step always valid:** No validation gate needed for tax/tip step since it has reasonable defaults (null tax + 18% tip). Users can always proceed even if they don't modify these values.

## Verification

All success criteria met:

- [x] TaxTipStep renders tax radio toggle (rate vs exact) and tip presets (15/18/20%) with custom input
- [x] Tax input changes immediately write to Zustand store (no Apply button needed)
- [x] Tip preset selection writes to store, custom input overrides presets
- [x] BillWizard orchestrates 4 steps with correct validation gates
- [x] Assignment gate: at least 1 item must be assigned to proceed
- [x] Tax/Tip gate: always valid (reasonable defaults exist)
- [x] Auto-advance on refresh detects furthest completed step
- [x] Human verified complete flow on mobile viewport
- [x] All tests pass (existing + new: 143 total)

## Next Steps

Phase 5 (Results and Calculation) will consume tax/tip values from the store and wire them to Phase 1 calculation functions (distributeTaxProportionally, distributeTipProportionally) to display final per-person amounts in the ResultsStep.

## Self-Check

Verifying all created files exist and commits are recorded.

### File Verification

Result:
- FOUND: src/components/TaxTipStep.tsx
- FOUND: src/components/TaxTipStep.test.tsx

### Commit Verification

Result:
- FOUND: 260eace (Task 1: TaxTipStep implementation)
- FOUND: 0d5beb6 (Task 2: BillWizard 4-step extension)

## Self-Check: PASSED

All files created and all commits recorded successfully.
