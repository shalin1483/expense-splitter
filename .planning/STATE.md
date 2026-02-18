# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax — no more overpaying or awkward rounding.
**Current focus:** Phase 6 - UI Improvements

## Current Position

Phase: 6 of 6 (UI Improvements)
Plan: 1 of 7 in current phase
Status: In Progress
Last activity: 2026-02-18 — Completed 06-01-PLAN.md - Tailwind v4 + shadcn/ui Infrastructure

Progress: [█░░░░░░░░░░░░░░] 14%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 145.3 seconds (2.4 minutes)
- Total execution time: 0.48 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-and-calculation-engine | 3 | 412s | 137.3s |
| 02-state-management-and-persistence | 2 | 613s | 306.5s |
| 03-people-and-items-management | 2 | 147s | 73.5s |
| 04-tax-tip-and-assignment | 2 | 262s | 131.0s |
| 05-results-and-history | 2 | 220s | 110.0s |
| 06-ui-improvements | 1 (of 7) | 226s | 226.0s |

**Recent Trend:**
- Last 5 plans: 04-02 (99s), 05-01 (213s), 05-02 (7s), 06-01 (226s)
- Trend: Phase 6 infrastructure plan completed, 6 component migration plans remaining

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
- Real-time store updates on valid input (no Apply button) - matches research guidance, avoids "forgot to click Apply" pitfall (04-02)
- Tax mode toggle (rate vs exact) - covers all receipt formats, some show rate others show total (04-02)
- Tip presets as buttons with aria-pressed - better mobile UX than radio inputs, larger tap targets (04-02)
- Consolidate Phase 4 CSS into App.css - maintains single source of truth for styles (04-02)
- Tax/Tip step always valid - reasonable defaults exist (null tax + 18% tip) (04-02)
- Direct computation in render vs stored calculations - chose render-time derivation to eliminate sync bugs (05-01)
- Native details/summary vs custom accordion - chose native for better accessibility and simplicity (05-01)
- Results step always valid - it's the final display step, no validation needed (05-01)
- Save button with temporary "Saved!" feedback - provides immediate user confirmation without modal (05-02)
- View toggle in app header - simple navigation pattern, no routing needed (05-02)
- Two-click Clear All with confirmation - prevents accidental data loss without modal interruption (05-02)
- [Phase 06-ui-improvements]: Tailwind v4 CSS-first config - no tailwind.config.js; all config in App.css via @theme
- [Phase 06-ui-improvements]: Preserved shadcn CSS variable blocks alongside plan's @theme brand tokens - required for shadcn component styling
- [Phase 06-ui-improvements]: @custom-variant dark uses :where(.dark, .dark *) - zero-specificity variant avoids CSS conflicts

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-18 — Plan 06-01 execution
Stopped at: Completed 06-01-PLAN.md - Tailwind v4 + shadcn/ui Infrastructure
Resume file: None
