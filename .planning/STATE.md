# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax — no more overpaying or awkward rounding.
**Current focus:** Phase 2 - State Management & Persistence

## Current Position

Phase: 2 of 5 (State Management & Persistence)
Plan: 2 of 2 in current phase
Status: Phase Complete
Last activity: 2026-02-09 — Completed 02-02-PLAN.md - History Store and Integration Tests

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 206.6 seconds (3.4 minutes)
- Total execution time: 0.29 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-and-calculation-engine | 3 | 412s | 137.3s |
| 02-state-management-and-persistence | 2 | 613s | 306.5s |

**Recent Trend:**
- Last 5 plans: 01-02 (127s), 01-03 (159s), 02-01 (306s), 02-02 (307s)
- Trend: Phase 2 plans consistently ~5 min (more complex than Phase 1's ~2 min)

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

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-09 — Plan 02-02 execution
Stopped at: Completed 02-02-PLAN.md - History Store and Integration Tests
Resume file: None
