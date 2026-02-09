# Architecture Research

**Domain:** Bill-splitting web applications
**Researched:** 2026-02-09
**Confidence:** MEDIUM

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ People  │  │  Items  │  │ Assign  │  │ Results │        │
│  │  View   │  │  View   │  │  View   │  │  View   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                    Business Logic Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Calculation Engine (Pure Functions)          │   │
│  │  • Split Calculator   • Tax Calculator                │   │
│  │  • Tip Calculator     • Assignment Resolver           │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        State Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Bill    │  │ People   │  │  Items   │  │ History  │    │
│  │  Store   │  │  Store   │  │  Store   │  │  Store   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
├───────┴─────────────┴──────────────┴─────────────┴──────────┤
│                    Persistence Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Local Storage Manager                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Recommended Project Structure

```
src/
├── components/           # UI components
│   ├── steps/           # Step-specific views (People, Items, Assign, Results)
│   ├── shared/          # Reusable UI components (Button, Input, Card)
│   └── layout/          # Layout components (Header, Navigation)
├── lib/                 # Business logic
│   ├── calculations/    # Pure calculation functions
│   │   ├── split.ts    # Item splitting logic
│   │   ├── tax.ts      # Tax calculation
│   │   └── tip.ts      # Tip calculation
│   ├── validation/      # Input validation rules
│   └── formatting/      # Number/currency formatting
├── stores/              # State management (Zustand)
│   ├── billStore.ts    # Current bill state
│   └── historyStore.ts # Past bills
├── services/            # External interactions
│   └── storage.ts      # Local storage abstraction
├── types/               # TypeScript type definitions
│   └── index.ts        # Bill, Person, Item, Assignment types
└── utils/               # Helper functions
    └── currency.ts      # Integer cents ↔ display dollars
```

## Architectural Patterns

### 1. Linear Step Navigation
Wizard-style flow: People → Items → Assign → Tip/Tax → Results. Each step validates before allowing advancement (e.g., need ≥2 people before items step).

### 2. Reactive Calculation Pipeline
State changes trigger automatic recalculation. No "calculate" button — results update live as users enter data.

```
[User Input] → [State Update] → [Recalculate] → [Re-render]
```

### 3. Pure Calculation Engine
All math lives in pure functions (no side effects, no state access). This enables:
- Easy unit testing
- No UI dependency for calculation verification
- Reusable across components

### 4. Immutable State Updates
Never mutate state. Create new objects on each update for predictable behavior and easy debugging.

## Data Flow

```
[User Action]
    ↓
[Component Event Handler]
    ↓
[Store Update] → [Validation] → [New State]
    ↓                                 ↓
[Trigger Calculations] ←──────────────┘
    ↓
[Update Derived State] → [Persist to Storage]
    ↓
[Components Re-render]
```

### Key Data Flows

1. **Person Addition:** Add name → Validate unique → Update people array → Enable "Next" if ≥2
2. **Item Assignment:** Toggle person on item → Update assignedTo → Recalculate splits → Update totals
3. **Tax/Tip Adjustment:** Enter value → Validate → Distribute proportionally → Recalculate totals
4. **History Save:** Complete bill → Snapshot → Persist to localStorage → Add to history

## Component Boundaries

### Dependency Direction

```
Views → Stores → Calculations → Types/Utils
```

Upper layers depend on lower layers, never reverse. Calculations never import from stores or components.

### Key Rules

| Rule | Rationale |
|------|-----------|
| Calculations are pure functions | Testable without UI, no side effects |
| Stores own shared state only | UI state (modals, form inputs) stays local to components |
| Components never call localStorage directly | Storage abstracted behind service layer |
| All money in integer cents | Prevents floating point errors |

## Build Order

### Phase 1: Foundation (No dependencies)
- Type definitions
- Utility functions (currency formatting, cents conversion)
- Calculation engine (split, tax, tip)
- **Can be built and tested independently**

### Phase 2: State + Persistence (Depends on Phase 1)
- Zustand stores
- localStorage persistence via persist middleware
- **Depends on types and calculations**

### Phase 3: UI Components (Depends on Phase 1-2)
- Shared components (Button, Input, Card)
- Step components (People, Items, Assign, Adjust, Results)
- Step navigation controller
- **Individual step components can be built in parallel**

### Phase 4: Integration + Polish (Depends on all)
- Wire stores to components
- End-to-end flow
- History feature
- Mobile polish

### Critical Path

```
Types → Calculations → Stores → Components → Integration
```

**Parallel opportunities:**
- Calculations and Storage service can be built simultaneously in Phase 1
- Individual step components are independent within Phase 3

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Do Instead |
|-------------|---------|------------|
| Business logic in components | Can't test without rendering, duplicated logic | Pure functions in `lib/calculations/` |
| Storing computed values in state | Sync issues when inputs change | Compute on-demand with `useMemo` |
| Single giant store | Everything re-renders on any change | Separate stores by domain (people, items, bill) |
| Floats for money | `0.1 + 0.2 ≠ 0.3` | Integer cents everywhere |
