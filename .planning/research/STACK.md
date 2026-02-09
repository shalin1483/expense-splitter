# Stack Research: Expense Splitter

## Recommended Stack

| Layer | Choice | Version | Confidence |
|-------|--------|---------|------------|
| Framework | React | 19.x | High |
| Language | TypeScript | 5.7+ | High |
| Build Tool | Vite | 6.x | High |
| Styling | TailwindCSS | 4.x | High |
| State Management | Zustand | 5.x | High |
| Storage | localStorage | Native | High |
| Testing | Vitest + React Testing Library | Latest | High |

## Rationale

### React 19 + TypeScript 5.7
- Industry standard for interactive UIs with complex state
- TypeScript essential for money calculations — catches NaN/Infinity at compile time
- Excellent mobile touch event handling
- Massive ecosystem for calculator-style interactive components

### Vite 6
- Official React recommendation (replaces deprecated Create React App)
- Sub-second HMR for fast development
- Optimized production builds with tree-shaking
- Native ESM support

### TailwindCSS 4
- Mobile-first utility framework with built-in responsive breakpoints
- Zero runtime cost (critical for instant-feel mobile performance)
- No CSS-in-JS overhead — styles resolved at build time
- Excellent for rapid UI iteration

### Zustand 5
- ~1KB bundle (vs Redux's 12KB+) — perfect for mobile performance
- Built-in `persist` middleware syncs to localStorage automatically
- No boilerplate, no providers, no reducers
- Simple API for the data model needed (people, items, assignments)

### localStorage (not IndexedDB)
- Sufficient for bill history (each bill is ~1-5KB)
- Simpler API, synchronous reads
- IndexedDB only needed if storing 100+ bills with search — overkill here

## What NOT to Use

| Library | Why Not |
|---------|---------|
| Create React App | Unmaintained since 2023, slow builds |
| Styled Components / Emotion | Runtime CSS-in-JS hurts mobile performance |
| Material-UI / Ant Design | 300KB+ bundle, over-engineered for this UI |
| Redux / Redux Toolkit | Too much boilerplate for simple local state |
| Moment.js | Deprecated, 70KB — use native Date or date-fns if needed |
| Next.js | SSR unnecessary — this is a pure client-side calculator app |

## Project Structure

```
src/
├── components/       # UI components (PeopleList, ItemList, etc.)
├── stores/           # Zustand stores (billStore, historyStore)
├── utils/            # Calculation logic (split, tip, tax)
├── types/            # TypeScript interfaces
├── App.tsx
└── main.tsx
```

## Key Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "zustand": "^5.0.0",
  "tailwindcss": "^4.0.0"
}
```

Dev dependencies: `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `@testing-library/react`
