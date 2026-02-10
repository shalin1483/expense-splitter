# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax — no more overpaying or awkward rounding.
**Current focus:** Phase 4 - Tax, Tip, and Assignment

## Current Position

Phase: 4 of 5 (Tax, Tip, and Assignment)
Plan: 1 of 2 in current phase
Status: Complete
Last activity: 2026-02-10 — Completed 04-01-PLAN.md - Assignment Step Implementation

Progress: [████████████] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 164.1 seconds (2.7 minutes)
- Total execution time: 0.36 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-and-calculation-engine | 3 | 412s | 137.3s |
| 02-state-management-and-persistence | 2 | 613s | 306.5s |
| 03-people-and-items-management | 2 | 147s | 73.5s |
| 04-tax-tip-and-assignment | 1 | 163s | 163.0s |

**Recent Trend:**
- Last 5 plans: 02-02 (307s), 03-01 (134s), 03-02 (13s), 04-01 (163s)
- Trend: Consistent execution times for UI work

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Group tip (not per-person) — Simplifies UX, covers 90% of real-world cases
- People-first flow — Mirrors natural receipt reading; need to know who's at table before assigning items
- Local storage for history — No backend complexity, still useful for personal reference
- Tax as rate OR exact amount — Some receipts show rate, others show total tax — support both
- Simple type alias over branded types - start simple, add complexity only when needed (01-01)
- ESM modules exclusively - modern standard, better tree-shaking (01-01)
- Integer cents architecture - eliminates floating-point precision errors (01-01)
- First-person remainder priority in splitEqually - simple, deterministic distribution (01-02)
- Largest remainder method for proportional allocation - mathematically fairest (01-02)
- Strict validation on calculation functions - throw errors on invalid input (01-02)
- Tax supports both rate and exact amount inputs - covers all receipt formats (01-03)
- Tip calculated on pre-tax subtotal - matches restaurant convention (01-03)
- Both distribution functions delegate to allocateProportionally - consistent algorithm (01-03)
- Atomic selector hooks over single store hook - reduces re-renders by subscribing to specific slices (02-01)
- Actions grouped under 'actions' key - provides stable reference, prevents re-renders on action selection (02-01)
- Assignments as Record<itemId, Assignment> - enables O(1) lookup vs array scanning (02-01)
- Zod validation in persist migrate - protects against localStorage corruption with automatic fallback (02-01)
- History stored under separate localStorage key - isolates saved bills from active bill state (02-02)
- 50-bill history limit - balances usefulness with localStorage quota constraints (02-02)
- Integration tests call Phase 1 functions directly - proves wiring correctness between state and calculations (02-02)
- Local useState for form inputs (draft values) vs Zustand - keeps form state ephemeral, matches research guidance (03-01)
- Separate vite.config.ts and vitest.config.ts - different concerns, cleaner separation (03-01)
- Mobile-first CSS with 44px touch targets and 16px fonts - prevents iOS zoom on input focus (03-01)
- canProceedFromPeople exported as pure helper - enables wizard navigation in next plan (03-01)
- inputMode='decimal' triggers mobile decimal keyboard - better UX than type='number' alone (03-02)
- Math.round for dollar-to-cents conversion - prevents floating-point errors (e.g., 12.99 * 100 = 1298.9999) (03-02)
- Auto-advance past completed steps on refresh - improves UX when returning to app (03-02)
- Validation gates disable Next button - prevents proceeding with invalid state (03-02)
- Equal split remainder to first person - simple, deterministic allocation matching splitEqually pattern (04-01)
- Rounding correction to largest percentage person - ensures cents sum to item price, matches largest remainder method (04-01)
- Dedicated CSS file for AssignmentStep - avoids file ownership conflict with Plan 02 modifications to App.css (04-01)
- Inline custom split editor vs modal - simpler implementation, more mobile-friendly (04-01)
- Strict 100% validation for custom splits - prevents data integrity issues, provides immediate feedback (04-01)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-10 — Plan 04-01 execution
Stopped at: Completed 04-01-PLAN.md - Assignment Step Implementation
Resume file: None
