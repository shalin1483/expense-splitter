---
phase: 03-people-and-items-management
plan: 01
subsystem: ui-foundation
status: complete
completed: 2026-02-09
tags: [react, vite, ui, people-management, form-handling]

dependency_graph:
  requires:
    - 02-01-SUMMARY (billStore with atomic selectors)
    - 02-02-SUMMARY (persist middleware for state survival)
  provides:
    - React dev environment with Vite
    - PeopleStep component with add/remove UI
    - canProceedFromPeople validation helper
  affects:
    - 03-02-PLAN (ItemsStep will follow same UI pattern)

tech_stack:
  added:
    - react-dom@19.2.4
    - vite@5.4.21
    - @vitejs/plugin-react@5.1.3
    - @types/react@19.2.13
    - @types/react-dom@19.2.3
  patterns:
    - Local state for draft values (useState for form inputs)
    - Zustand atomic selectors (usePeople, useBillActions)
    - Mobile-first CSS (480px max-width, 44px touch targets, 16px fonts)
    - Controlled form inputs with onSubmit prevention

key_files:
  created:
    - vite.config.ts: Vite config with React plugin and @ alias
    - index.html: HTML entry point for Vite app
    - src/main.tsx: React DOM render entry point
    - src/App.tsx: Root application component
    - src/App.css: Mobile-first CSS styles
    - src/components/PeopleStep.tsx: People add/remove component
    - src/components/PeopleStep.test.tsx: Unit tests for canProceedFromPeople
  modified:
    - package.json: Added dev/build/preview scripts
    - tsconfig.json: Added jsx: react-jsx and DOM libs
    - vitest.config.ts: Support .tsx test files

decisions:
  - "Local useState for form inputs (draft values) vs Zustand - keeps form state ephemeral, matches research guidance"
  - "Separate vite.config.ts and vitest.config.ts - different concerns, cleaner separation"
  - "Mobile-first CSS with 44px touch targets and 16px fonts - prevents iOS zoom on input focus"
  - "canProceedFromPeople exported as pure helper - enables wizard navigation in next plan"

metrics:
  duration: 134
  tasks_completed: 2
  tests_added: 4
  tests_total: 108
  files_created: 7
  files_modified: 3
  commits: 2
---

# Phase 03 Plan 01: Vite + React Shell with People Management Summary

**Scaffolded Vite + React dev environment and implemented PeopleStep component with add/remove functionality connected to billStore.**

## Objective

Set up the React development environment using Vite and implement the first interactive UI component - the People management step where users add and remove people from the bill.

## Context

This was the first UI plan in the project. Previously, only TypeScript library code (calculations + stores) existed with no rendering layer. Phase 3 builds the user interface on top of the state management foundation from Phase 2.

## Implementation Details

### Task 1: Scaffold Vite + React Application Shell

**What was built:**
- Installed react-dom, vite, @vitejs/plugin-react, and TypeScript types
- Created vite.config.ts with React plugin and @ alias matching existing tsconfig paths
- Updated vitest.config.ts to support .tsx test files
- Updated tsconfig.json with jsx: react-jsx and DOM libs
- Created index.html entry point with root div
- Created src/main.tsx React DOM render entry point with StrictMode
- Created src/App.tsx root component with "Expense Splitter" heading
- Created src/App.css with mobile-first responsive styles
- Added dev/build/preview scripts to package.json

**Key decisions:**
- Kept vite.config.ts and vitest.config.ts separate (different concerns)
- Used jsx: react-jsx (modern JSX transform, no React import needed)
- Mobile-first CSS: 480px max-width, 44px touch targets, 16px fonts (prevents iOS zoom)
- Used Vite default port 5173

**Files created:** vite.config.ts, index.html, src/main.tsx, src/App.tsx, src/App.css

**Verification:**
- TypeScript compiles with 0 errors
- All 104 existing tests pass
- Vite builds successfully
- Dev server starts on localhost:5173

### Task 2: Implement PeopleStep Component

**What was built:**
- Created PeopleStep component with controlled form input
- Connected to billStore via usePeople and useBillActions atomic selectors
- Implemented add person: trim name, validate non-empty, call addPerson, clear input
- Implemented remove person: accessible button with aria-label and × symbol
- Added validation status messages:
  - 0 people: "Add at least 2 people to continue"
  - 1 person: "Add 1 more person to continue"
  - 2+ people: "{count} people added"
- Exported canProceedFromPeople(people: Person[]): boolean helper for wizard navigation
- Added 4 unit tests for canProceedFromPeople logic
- Updated App.tsx to render PeopleStep

**Key decisions:**
- Used local useState for name input (draft values stay local, not in Zustand per research anti-pattern guidance)
- Used atomic selectors (usePeople, useBillActions) to minimize re-renders
- Used × (multiplication sign) for remove button (simple, accessible)
- Exported canProceedFromPeople as pure helper (enables wizard navigation in Plan 02)

**Files created:** src/components/PeopleStep.tsx, src/components/PeopleStep.test.tsx

**Verification:**
- 108 tests pass (104 existing + 4 new)
- TypeScript compiles with 0 errors
- PeopleStep renders with add/remove functionality
- People persist across refresh via Zustand localStorage

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All success criteria met:

1. `npm test` passes 108 tests (104 existing + 4 new)
2. `npx tsc --noEmit` compiles with 0 errors
3. `npm run build` succeeds
4. `npm run dev` starts Vite dev server on localhost:5173
5. PeopleStep component renders with add/remove functionality
6. People persist across page refresh via Zustand localStorage

## Output

**Created files:**
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/vite.config.ts
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/index.html
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/main.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/App.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/App.css
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/components/PeopleStep.tsx
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/src/components/PeopleStep.test.tsx

**Modified files:**
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/package.json
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/tsconfig.json
- /Users/shalinpatel/Localfiles/Programming/Learnings/CC-GSD/gsd-module-test/vitest.config.ts

**Commits:**
- ace5728: feat(03-01): scaffold Vite + React application shell
- 71a589b: feat(03-01): implement PeopleStep component with add/remove functionality

## Next Steps

Plan 03-02 will implement the ItemsStep component following the same UI pattern established here: controlled form inputs with local useState, atomic Zustand selectors, and mobile-first responsive design.

## Self-Check: PASSED

All created files verified:
- vite.config.ts: FOUND
- index.html: FOUND
- src/main.tsx: FOUND
- src/App.tsx: FOUND
- src/App.css: FOUND
- src/components/PeopleStep.tsx: FOUND
- src/components/PeopleStep.test.tsx: FOUND

All commits verified:
- ace5728: FOUND
- 71a589b: FOUND
