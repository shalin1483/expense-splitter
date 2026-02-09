# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax — no more overpaying or awkward rounding.
**Current focus:** Phase 1 - Foundation & Calculation Engine

## Current Position

Phase: 1 of 5 (Foundation & Calculation Engine)
Plan: 3 of 3 in current phase
Status: Complete
Last activity: 2026-02-09 — Completed 01-03-PLAN.md - Tax & Tip Calculations

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 137.3 seconds (2.3 minutes)
- Total execution time: 0.11 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-and-calculation-engine | 3 | 412s | 137.3s |

**Recent Trend:**
- Last 5 plans: 01-01 (126s), 01-02 (127s), 01-03 (159s)
- Trend: Consistent velocity (~2-3 min/plan)

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

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-09 — Plan 01-03 execution
Stopped at: Completed 01-03-PLAN.md - Tax & Tip Calculations
Resume file: None
