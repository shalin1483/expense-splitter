---
phase: 01-foundation-and-calculation-engine
plan: 02
subsystem: calculations
tags: [tdd, vitest, typescript, algorithms]

# Dependency graph
requires:
  - phase: 01-01
    provides: Type system foundation with Cents type and conversion utilities
provides:
  - Equal split algorithm with deterministic remainder distribution
  - Proportional allocation using largest remainder method
  - Pure calculation functions guaranteeing sum(shares) === total
affects: [bill-splitting-logic, tax-distribution, tip-allocation]

# Tech tracking
tech-stack:
  added: []
  patterns: [largest-remainder-method, tdd-red-green-refactor, deterministic-penny-distribution]

key-files:
  created:
    - src/lib/calculations/split.ts
    - src/lib/calculations/split.test.ts
    - src/lib/calculations/allocate.ts
    - src/lib/calculations/allocate.test.ts
  modified: []

key-decisions:
  - "First-person-priority for remainders in splitEqually - simple, deterministic, no randomness"
  - "Largest remainder method for allocateProportionally - mathematically fairest penny distribution"
  - "Strict validation on both functions - throw errors on invalid input (zero people, empty arrays)"

patterns-established:
  - "TDD Pattern: RED (failing tests) → GREEN (minimal implementation) → REFACTOR (documentation)"
  - "Sum invariant testing: Every test case verifies sum(shares) === total"
  - "Comprehensive JSDoc with examples showing exact behavior including edge cases"

# Metrics
duration: 2.1min
completed: 2026-02-09
---

# Phase 01 Plan 02: Split & Allocation Algorithms Summary

**Equal split and proportional allocation functions with largest remainder method ensuring zero penny loss**

## Performance

- **Duration:** 2.1 min (127 seconds)
- **Started:** 2026-02-09T07:14:39Z
- **Completed:** 2026-02-09T07:16:46Z
- **Tasks:** 2 (TDD)
- **Files modified:** 4 files created
- **Tests:** 18 tests added (35 total in project)

## Accomplishments

- splitEqually distributes amounts evenly with deterministic remainder handling
- allocateProportionally uses largest remainder method for mathematically fair distribution
- Both functions guarantee sum(shares) === total invariant with comprehensive test coverage
- Pure calculation modules with no dependencies on stores or components

## Task Commits

Each task was committed atomically following TDD protocol:

**Task 1: Implement splitEqually with TDD**
1. RED: `3a6215c` (test) - Add failing tests for splitEqually
2. GREEN: `7845e3d` (feat) - Implement splitEqually function

**Task 2: Implement allocateProportionally with TDD**
3. RED: `5729e00` (test) - Add failing tests for allocateProportionally
4. GREEN: `1120692` (feat) - Implement allocateProportionally function

_Total: 4 commits (2 RED, 2 GREEN, REFACTOR integrated into GREEN commits)_

## Files Created/Modified

**Created:**
- `src/lib/calculations/split.ts` - Equal split with first-N remainder distribution
- `src/lib/calculations/split.test.ts` - 8 tests covering even division, remainders, sum invariant, errors
- `src/lib/calculations/allocate.ts` - Proportional allocation via largest remainder method
- `src/lib/calculations/allocate.test.ts` - 10 tests covering proportional cases, tricky remainders, sum invariant, errors

## Decisions Made

1. **First-person remainder priority** - In splitEqually, extra pennies go to first N people (simple, deterministic, no randomness needed)

2. **Largest remainder method** - For allocateProportionally, distribute extra pennies to people with largest fractional remainders (mathematically fairest)

3. **Strict input validation** - Both functions throw errors on invalid input (zero/negative people, empty arrays, zero totals) rather than returning empty arrays

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TDD process followed smoothly with all tests passing on first GREEN implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- Core distribution algorithms complete and tested
- Pure calculation layer established
- 35 tests passing (17 from 01-01, 18 from 01-02)
- Type checking passes with no errors

**Next needs:**
- Bill parsing logic (read receipt data)
- Person management (add/remove people)
- Item assignment (assign items to people, handle shared items)
- Integration layer connecting calculations to UI

**No blockers or concerns**

---

## Self-Check: PASSED

All files verified to exist:
- ✓ src/lib/calculations/split.ts
- ✓ src/lib/calculations/split.test.ts
- ✓ src/lib/calculations/allocate.ts
- ✓ src/lib/calculations/allocate.test.ts

All commits verified:
- ✓ 3a6215c (RED - split tests)
- ✓ 7845e3d (GREEN - split implementation)
- ✓ 5729e00 (RED - allocate tests)
- ✓ 1120692 (GREEN - allocate implementation)

---
*Phase: 01-foundation-and-calculation-engine*
*Completed: 2026-02-09*
