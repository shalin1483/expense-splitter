---
phase: 01-foundation-and-calculation-engine
plan: 03
subsystem: calculations
tags: [tdd, vitest, typescript, tax-calculation, tip-calculation]

# Dependency graph
requires:
  - phase: 01-02
    provides: allocateProportionally function for proportional distribution using largest remainder method
provides:
  - Tax calculation supporting both rate and exact amount inputs
  - Tip calculation on pre-tax subtotal with percentage rate
  - Proportional distribution of tax and tip across person subtotals
  - Complete calculation layer with sum invariant guarantees
affects: [bill-totaling, final-calculation, person-balances]

# Tech tracking
tech-stack:
  added: []
  patterns: [dual-input-type-union, pre-tax-tip-convention, tdd-red-green-refactor]

key-files:
  created:
    - src/lib/calculations/tax.ts
    - src/lib/calculations/tax.test.ts
    - src/lib/calculations/tip.ts
    - src/lib/calculations/tip.test.ts
  modified: []

key-decisions:
  - "Tax supports both rate (0.08 = 8%) and exact amount ($8.25) - covers all receipt formats"
  - "Tip calculated on pre-tax subtotal - matches restaurant convention and user expectations"
  - "Both distribution functions delegate to allocateProportionally - consistent algorithm across all distributions"

patterns-established:
  - "Union type for flexible input: { type: 'rate', rate: number } | { type: 'exact', amount: Cents }"
  - "Clear JSDoc documenting pre-tax convention and decimal representation (0.18 = 18%)"
  - "Comprehensive test coverage including edge cases (zero values, rounding)"

# Metrics
duration: 2.7min
completed: 2026-02-09
---

# Phase 01 Plan 03: Tax & Tip Calculations Summary

**Tax and tip calculation with dual input modes (rate/exact) and proportional distribution ensuring zero penny loss**

## Performance

- **Duration:** 2.7 min (159 seconds)
- **Started:** 2026-02-09T07:19:13Z
- **Completed:** 2026-02-09T07:21:52Z
- **Tasks:** 2 (TDD)
- **Files modified:** 4 files created
- **Tests:** 18 tests added (53 total in project)

## Accomplishments

- calculateTax handles both rate-based (percentage) and exact amount tax inputs
- calculateTip computes tip on pre-tax subtotal matching restaurant convention
- distributeTax and distributeTip use allocateProportionally for mathematically fair distribution
- All distribution functions guarantee sum(shares) === total with comprehensive test coverage
- Phase 1 calculation engine complete: money types, split algorithms, allocation, tax, and tip

## Task Commits

Each task was committed atomically following TDD protocol:

**Task 1: Implement tax calculation and distribution with TDD**
1. RED: `1f6f34e` (test) - Add failing tests for tax calculation
2. GREEN: `b73fead` (feat) - Implement tax calculation and distribution

**Task 2: Implement tip calculation and distribution with TDD**
3. RED: `6e0bcb2` (test) - Add failing tests for tip calculation
4. GREEN: `d5a75b3` (feat) - Implement tip calculation and distribution

_Total: 4 commits (2 RED, 2 GREEN, REFACTOR integrated into GREEN commits)_

## Files Created/Modified

**Created:**
- `src/lib/calculations/tax.ts` - Tax calculation with rate/exact input, proportional distribution
- `src/lib/calculations/tax.test.ts` - 8 tests covering rate calculation, exact passthrough, distribution, sum invariant
- `src/lib/calculations/tip.ts` - Tip calculation on pre-tax subtotal, proportional distribution
- `src/lib/calculations/tip.test.ts` - 10 tests covering various percentages, edge cases, distribution, sum invariant

## Decisions Made

1. **Dual-mode tax input** - Support both rate (0.08 = 8%) and exact amount ($8.25) to handle all receipt formats. Some receipts show rate, others show total tax.

2. **Pre-tax tip convention** - Tip calculated on subtotal before tax is applied, matching standard restaurant practice and user expectations.

3. **Consistent distribution algorithm** - Both distributeTax and distributeTip delegate to allocateProportionally, ensuring consistent behavior across all distribution scenarios.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TDD process followed smoothly with all tests passing on first GREEN implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- Complete calculation engine built and tested
- All Phase 1 success criteria met:
  1. All money amounts as integer cents (Cents type) ✓
  2. Split calculations distribute pennies deterministically ✓
  3. Currency conversion works bidirectionally ✓
  4. Tax and tip calculations produce exact results ✓
  5. All calculation functions are pure ✓
- 53 tests passing across 5 test files
- Type checking passes with no errors

**Next needs:**
- Bill data model (items, people, assignments)
- State management for bill splitting workflow
- UI components for data entry and display
- Integration layer connecting calculations to state

**No blockers or concerns**

---

## Self-Check: PASSED

All files verified to exist:
- ✓ src/lib/calculations/tax.ts
- ✓ src/lib/calculations/tax.test.ts
- ✓ src/lib/calculations/tip.ts
- ✓ src/lib/calculations/tip.test.ts

All commits verified:
- ✓ 1f6f34e (RED - tax tests)
- ✓ b73fead (GREEN - tax implementation)
- ✓ 6e0bcb2 (RED - tip tests)
- ✓ d5a75b3 (GREEN - tip implementation)

---
*Phase: 01-foundation-and-calculation-engine*
*Completed: 2026-02-09*
