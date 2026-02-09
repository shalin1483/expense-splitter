# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax — no more overpaying or awkward rounding.
**Current focus:** Phase 3 - People and Items Management

## Current Position

Phase: 3 of 5 (People and Items Management)
Plan: 1 of 2 in current phase
Status: In Progress
Last activity: 2026-02-09 — Completed 03-01-PLAN.md - Vite + React Shell with People Management

Progress: [███████████░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 190.8 seconds (3.2 minutes)
- Total execution time: 0.32 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-and-calculation-engine | 3 | 412s | 137.3s |
| 02-state-management-and-persistence | 2 | 613s | 306.5s |
| 03-people-and-items-management | 1 | 134s | 134.0s |

**Recent Trend:**
- Last 5 plans: 01-03 (159s), 02-01 (306s), 02-02 (307s), 03-01 (134s)
- Trend: Phase 3 first plan faster than Phase 2 (UI scaffolding simpler than state logic)

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

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-09 — Plan 03-01 execution
Stopped at: Completed 03-01-PLAN.md - Vite + React Shell with People Management
Resume file: None
