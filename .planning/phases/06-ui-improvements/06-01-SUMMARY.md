---
phase: 06-ui-improvements
plan: "01"
subsystem: ui
tags: [tailwindcss, shadcn, vite, css-tokens, dark-mode, motion, sonner]

# Dependency graph
requires:
  - phase: 05-results-and-history
    provides: Complete working app with BEM CSS styling
provides:
  - Tailwind CSS v4 wired into Vite build via @tailwindcss/vite plugin
  - shadcn/ui initialized (new-york style, neutral color, CSS variables)
  - button, card, progress, badge, sonner components in src/components/ui/
  - App.css replaced with @import tailwindcss + design tokens + dark variant
  - motion and sonner packages installed
affects:
  - 06-02-PLAN.md
  - 06-03-PLAN.md
  - 06-04-PLAN.md
  - 06-05-PLAN.md
  - 06-06-PLAN.md
  - 06-07-PLAN.md

# Tech tracking
tech-stack:
  added:
    - tailwindcss v4
    - "@tailwindcss/vite (Vite plugin for Tailwind v4)"
    - "shadcn/ui (new-york style)"
    - tw-animate-css
    - motion
    - sonner
    - "@types/node"
  patterns:
    - "@tailwindcss/vite plugin BEFORE react() in vite plugins array"
    - "CSS-first Tailwind v4 config (no tailwind.config.js — config in App.css)"
    - "@theme block for design tokens (brand colors, semantic colors, fonts)"
    - "@custom-variant dark (&:where(.dark, .dark *)) for .dark class toggling"
    - "shadcn/ui CSS variables in :root and .dark blocks for component theming"

key-files:
  created:
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/progress.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/sonner.tsx
    - src/lib/utils.ts
    - components.json
  modified:
    - vite.config.ts
    - src/App.css
    - package.json
    - package-lock.json

key-decisions:
  - "Tailwind v4 CSS-first config — no tailwind.config.js; all config in App.css via @theme"
  - "shadcn init required @import tailwindcss in CSS before it could detect Tailwind v4"
  - "Preserve shadcn @theme inline + :root + .dark variable blocks alongside plan's @theme brand tokens"
  - "@custom-variant dark uses :where(.dark, .dark *) syntax matching plan spec (not shadcn default :is)"
  - "All 160 tests pass (not just 28 from plan — test suite grew across phases)"

patterns-established:
  - "Tailwind v4 CSS-first: design tokens in @theme, shadcn variables in :root/.dark"
  - "App.css is the single CSS entry point — no per-component CSS files going forward"
  - "tailwindcss() plugin before react() in vite.config.ts plugins array"

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 6 Plan 01: Tailwind v4 + shadcn/ui Infrastructure Summary

**Tailwind CSS v4 installed via @tailwindcss/vite plugin, shadcn/ui initialized with new-york style, and App.css replaced with token-based CSS foundation using brand oklch colors and dark variant**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T10:17:21Z
- **Completed:** 2026-02-18T10:21:07Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Installed tailwindcss, @tailwindcss/vite, motion, sonner, @types/node via npm
- Initialized shadcn/ui (new-york style, neutral base color) and added button, card, progress, badge, sonner components
- Replaced 682-line BEM CSS App.css with clean token-based foundation: @import tailwindcss, brand color @theme tokens, shadcn CSS variables, and minimal global resets only

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Tailwind CSS v4, shadcn/ui, motion, and sonner** - `cc6dbb4` (chore)
2. **Task 2: Replace App.css with Tailwind v4 token-based foundation** - `7bc7934` (feat)

## Files Created/Modified

- `vite.config.ts` - Added @tailwindcss/vite plugin before react() in plugins array
- `src/App.css` - Replaced with @import tailwindcss + @theme brand tokens + shadcn variables + minimal resets
- `package.json` - Added tailwindcss, @tailwindcss/vite, motion, sonner, @types/node
- `components.json` - shadcn/ui configuration (new-york style, neutral, CSS variables, @ alias)
- `src/components/ui/button.tsx` - shadcn Button component
- `src/components/ui/card.tsx` - shadcn Card components (Card, CardHeader, CardContent, etc.)
- `src/components/ui/progress.tsx` - shadcn Progress component
- `src/components/ui/badge.tsx` - shadcn Badge component
- `src/components/ui/sonner.tsx` - shadcn Sonner toast component
- `src/lib/utils.ts` - cn() helper (clsx + tailwind-merge)

## Decisions Made

- Tailwind v4 uses CSS-first configuration — no `tailwind.config.js` needed; all token definitions go in App.css via `@theme` block
- shadcn CLI (v3.8.5) required `@import "tailwindcss"` to already be present in a CSS file before it could detect the Tailwind v4 config and proceed with init
- Preserved shadcn's `@theme inline`, `:root`, and `.dark` blocks (required for shadcn component theming) alongside the plan's custom `@theme` brand tokens
- Changed `@custom-variant dark` syntax from shadcn's default `(&:is(.dark *))` to plan's specified `(&:where(.dark, .dark *))` — the `:where()` version has zero specificity which avoids CSS specificity conflicts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @import "tailwindcss" to App.css before running shadcn init**
- **Found during:** Task 1 (shadcn/ui init)
- **Issue:** `npx shadcn@latest init --yes --force` failed with "No Tailwind CSS configuration found" because shadcn CLI scans for a CSS file containing `@import "tailwindcss"` to detect Tailwind v4
- **Fix:** Prepended `@import "tailwindcss";` to existing App.css, ran init successfully, then replaced entire App.css in Task 2
- **Files modified:** src/App.css (temporary)
- **Verification:** shadcn init succeeded, all components added
- **Committed in:** cc6dbb4 (Task 1 — App.css change was superseded by Task 2 rewrite)

**2. [Rule 2 - Missing Critical] Preserved shadcn CSS variable blocks in App.css**
- **Found during:** Task 2 (App.css replacement)
- **Issue:** Plan's App.css spec didn't include shadcn's `@theme inline`, `:root`, and `.dark` variable blocks that shadcn init wrote. Removing them would break all shadcn component styling.
- **Fix:** Kept shadcn's variable blocks alongside the plan's @theme brand tokens and design foundation
- **Files modified:** src/App.css
- **Verification:** npm run build succeeds, all 160 tests pass
- **Committed in:** 7bc7934 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both fixes were necessary for correct operation. The shadcn variable preservation is especially important as it's the foundation all subsequent component migration plans depend on.

## Issues Encountered

- shadcn CLI `--force` flag is only valid for `init`, not for `add` — used `--yes` only for component adds
- shadcn CLI needed CSS with `@import "tailwindcss"` present before vite.config.ts change alone was sufficient for detection

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Tailwind v4 utility classes (bg-blue-600, text-sm, flex, etc.) are available for JSX migration
- shadcn/ui components available: Button, Card, Progress, Badge, Sonner
- Design tokens available: --color-brand, --color-success, --color-danger and variants
- dark: variant works via .dark class on html element
- All 6 downstream plans (06-02 through 06-07) can now execute

---
*Phase: 06-ui-improvements*
*Completed: 2026-02-18*

## Self-Check: PASSED

- FOUND: src/components/ui/button.tsx
- FOUND: src/components/ui/card.tsx
- FOUND: src/components/ui/progress.tsx
- FOUND: src/components/ui/badge.tsx
- FOUND: src/components/ui/sonner.tsx
- FOUND: src/lib/utils.ts
- FOUND: vite.config.ts
- FOUND: src/App.css
- FOUND: .planning/phases/06-ui-improvements/06-01-SUMMARY.md
- FOUND commit: cc6dbb4 (Task 1)
- FOUND commit: 7bc7934 (Task 2)
