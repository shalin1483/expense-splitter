# Project Research Summary

**Project:** Expense Splitter
**Domain:** Bill-splitting / restaurant expense calculator
**Researched:** 2026-02-09
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a mobile-first bill-splitting calculator for restaurant scenarios, designed to solve the "who owes what" problem at the dinner table. The domain is well-understood with established patterns: React for reactive UI, TypeScript for type safety in money calculations, and pure functional calculation engines to avoid floating-point errors. The critical architectural decision is treating all money as integer cents to prevent penny mismatches, which must be implemented from day one.

The recommended approach is a linear wizard flow (People → Items → Assignments → Tax/Tip → Results) with instant reactive calculations and localStorage persistence. This differs from complex multi-featured apps like Splitwise by focusing on speed and simplicity for single-bill scenarios without requiring accounts or internet connectivity. The stack is deliberately minimal (React 19, TypeScript, Zustand, TailwindCSS, Vite) to keep bundle size small and performance instant on mobile devices.

Key risks center on money math precision, mobile UX challenges (keyboard obscuring inputs), and balancing split calculations (penny distribution). All of these have known mitigations that must be built into the foundation phase rather than retrofitted later. The linear dependency structure (Types → Calculations → State → UI) enables parallel development once foundational work is complete.

## Key Findings

### Recommended Stack

Modern, minimal JavaScript stack optimized for mobile performance and local-first operation. Total bundle target under 100KB gzipped.

**Core technologies:**
- **React 19 + TypeScript 5.7+**: Industry standard for complex interactive state with compile-time safety for money calculations
- **Vite 6**: Official build tool replacing deprecated Create React App, delivers sub-second HMR and optimized production builds
- **TailwindCSS 4**: Zero-runtime utility framework for mobile-first responsive design without CSS-in-JS performance penalty
- **Zustand 5**: Minimal state management (1KB vs Redux's 12KB+) with built-in localStorage persistence middleware
- **localStorage (not IndexedDB)**: Sufficient for bill history (~1-5KB per bill), synchronous API simpler than async IndexedDB

**Critical rejections:**
- No Create React App (unmaintained)
- No CSS-in-JS libraries (runtime overhead kills mobile performance)
- No Material-UI/Ant Design (300KB+ bundles overkill for this UI)
- No Redux (unnecessary boilerplate for local-only state)
- No Next.js/SSR (pure client-side calculator needs no server)

### Expected Features

Research identifies three feature tiers with clear MVP boundaries.

**Must have (table stakes):**
- Add people to split (2+ required)
- Add items/expenses with amounts
- Per-person item assignment ("I had the burger")
- Basic shared item splitting (equal distribution)
- Tax calculation (percentage-based)
- Tip calculation with presets (15%, 18%, 20%)
- Final totals per person with clear breakdown
- Mobile-friendly touch interface
- No sign-up required (friction kills usage)
- Instant reactive calculations (no "calculate" button)

**Should have (differentiators from competitors):**
- Shared item custom percentages (70/30 splits)
- Session history in localStorage
- Flexible tax input (percentage or fixed amount)
- Edit/undo flow for touch mistakes
- Share/export results to group chat
- Fully offline-first (no backend dependency)
- Linear guided wizard flow (reduces cognitive load at table)

**Defer to v2+ (anti-features):**
- Venmo/PayPal integration (requires auth, backend, PCI compliance)
- Receipt photo scanning (OCR inaccuracy, slower than manual entry)
- User accounts/profiles (adds friction, kills quick usage)
- Multi-currency support (complexity vs single-use restaurant focus)
- Debt tracking over time (different product entirely)

**Key competitive differentiator:** Faster and simpler for single-bill restaurant use compared to Splitwise/Tab. No accounts, no internet, instant calculations, linear flow.

### Architecture Approach

Four-layer architecture with strict unidirectional dependencies: Presentation → Business Logic → State → Persistence. All money math isolated in pure functions for testability.

**Major components:**
1. **Calculation Engine (lib/calculations/)** — Pure functions for split/tax/tip math, no state access, fully unit-testable. Uses integer cents internally, only converts to dollars for display.
2. **State Layer (stores/)** — Zustand stores split by domain (billStore, historyStore) with persist middleware auto-syncing to localStorage. Never stores computed values (calculate on-demand with useMemo).
3. **Step Components (components/steps/)** — Wizard flow views (People, Items, Assign, Results) that are independently buildable once foundation is in place.
4. **Storage Service (services/storage.ts)** — Abstraction layer over localStorage so components never call it directly, enables future migration if needed.

**Key architectural patterns:**
- Linear step navigation with validation gates (can't proceed without ≥2 people)
- Reactive calculation pipeline (state change → auto-recalculate → re-render)
- Pure calculation engine (no side effects, state-agnostic)
- Immutable state updates (never mutate, always create new objects)
- Integer cents everywhere (prevents floating-point errors)

**Build order dependency:** Types → Calculations → Stores → Components → Integration. Calculations and storage service can be built in parallel (Phase 1), individual step components are independent once stores exist (Phase 3).

### Critical Pitfalls

Research identified 8 critical pitfalls, 4 of which must be addressed in Phase 1 foundation or become extremely costly to fix later.

1. **Floating point math for currency** — JavaScript's `0.1 + 0.2 ≠ 0.3` causes penny mismatches. Prevention: Store all amounts as integer cents from day one. Warning: Architectural decision that's painful to change later. **[Phase 1: Critical]**

2. **Unbalanced splits (penny problem)** — $10.00 ÷ 3 = $3.33 × 3 = $9.99. Prevention: Deterministic remainder distribution via round-robin. Must be in core calculation engine from start. **[Phase 1: Critical]**

3. **Lost context after refresh** — Mobile users will switch apps or accidentally refresh. Prevention: Auto-save to localStorage on every state change via Zustand persist middleware. Wire up from day one. **[Phase 1: Critical]**

4. **Mobile keyboard obscures input** — Virtual keyboard takes 40-50% of screen, covering buttons. Prevention: Use visualViewport API, scroll active input into view, mobile-first CSS architecture. **[Phase 1: High]**

5. **Tax-then-tip vs tip-then-tax** — Regional variation causes 5-10% differences. Prevention: Default to tip-on-subtotal (most common), show calculation breakdown transparently. **[Phase 2: High]**

6. **Custom split ratios don't balance** — 40% + 30% + 20% = 90% leaves 10% unaccounted. Prevention: Real-time validation showing remaining percentage, block submission until 100%. **[Phase 2: Medium]**

7. **Equal split ignores opt-outs** — "Split appetizer equally" charges someone who didn't eat it. Prevention: Per-item participant tracking, only split among assigned people. **[Phase 2: High]**

8. **Results screen is an afterthought** — The "who pays what" screen IS the product. Prevention: Design results screen first to inform architecture, make totals prominent with expandable detail. **[Phase 3: High]**

## Implications for Roadmap

Based on research, suggested 4-phase structure following architectural dependency chain and pitfall priorities.

### Phase 1: Foundation & Core Calculation Engine
**Rationale:** Must establish integer-cents architecture and pure calculation functions before any UI work. This phase addresses all 4 critical pitfalls that are costly to fix retroactively. The dependency structure requires types and calculations exist before stores can be built.

**Delivers:**
- TypeScript type definitions (Bill, Person, Item, Assignment)
- Pure calculation functions (split with penny distribution, tax, tip)
- Currency utility functions (cents ↔ dollars conversion)
- Unit test suite for all money math
- localStorage persistence setup

**Addresses features:**
- Foundation for all calculation features
- Enables instant reactive calculations

**Avoids pitfalls:**
- Floating point math (integer cents from day one)
- Unbalanced splits (penny distribution in core engine)
- Lost context (persistence architecture decision)
- Mobile keyboard (CSS architecture for mobile-first)

**Research needs:** Standard patterns, skip `/gsd:research-phase`. Well-documented domain.

### Phase 2: State Management & Data Flow
**Rationale:** With calculation engine proven, build state layer using Zustand with persist middleware. This enables building individual UI components in parallel during Phase 3. Must precede UI work.

**Delivers:**
- Zustand stores (billStore with people/items/assignments)
- Auto-persistence via persist middleware
- State validation rules
- Store integration with calculation engine

**Uses:**
- Zustand 5 for minimal state management
- localStorage via service abstraction

**Implements:**
- State layer from architecture (stores/)
- Reactive calculation pipeline pattern

**Avoids pitfalls:**
- Lost context (auto-save on every state change)
- Giant monolithic store (separate by domain)

**Research needs:** Standard patterns, skip `/gsd:research-phase`. Zustand is well-documented.

### Phase 3: Core UI Flow (People → Items → Assignments)
**Rationale:** Linear dependency in wizard flow. Can't assign items without items existing, can't have items without people. Build in natural user flow order. Individual step components can be built in parallel once stores exist.

**Delivers:**
- Step 1: People list (add/remove, validation for ≥2)
- Step 2: Items list (name + amount input)
- Step 3: Assignment view (tap to assign items to people)
- Step 4: Shared item splitting (equal distribution)
- Shared UI components (Button, Input, Card)
- Step navigation with validation gates

**Addresses features:**
- Add people (table stakes)
- Add items (table stakes)
- Per-person assignment (table stakes)
- Basic shared splitting (table stakes)
- Mobile-friendly interface (table stakes)
- Linear guided flow (differentiator)

**Avoids pitfalls:**
- Equal split ignores opt-outs (per-item participant tracking)
- Tiny tap targets (44px minimum)
- No decimal keyboard (inputMode="decimal")
- No empty state guidance (clear CTAs)

**Research needs:** Standard patterns, skip `/gsd:research-phase`. Standard React component patterns.

### Phase 4: Tax/Tip/Results & Polish
**Rationale:** Tax and tip calculations require items to exist. Results screen is the culmination—designed first but built last. This phase completes the MVP.

**Delivers:**
- Tax input (percentage, later add fixed amount)
- Tip input with presets (15%, 18%, 20%)
- Results screen with per-person totals
- Calculation breakdown transparency
- Mobile polish (visualViewport handling, touch refinements)

**Addresses features:**
- Tax calculation (table stakes)
- Tip with presets (table stakes)
- Final totals per person (table stakes)
- Instant calculations (differentiator)

**Avoids pitfalls:**
- Tax-then-tip vs tip-then-tax (default tip-on-subtotal, show breakdown)
- Results screen afterthought (prominent totals, expandable detail)
- Mobile keyboard obscures (visualViewport API implementation)

**Research needs:** Standard patterns, skip `/gsd:research-phase`. Well-established patterns for this UI.

### Phase 5 (Optional v1.x): Enhancement Features
**Rationale:** Post-MVP enhancements once core validated. Can be prioritized based on user feedback.

**Delivers:**
- Session history in localStorage
- Custom split percentages (beyond equal)
- Tax as fixed amount option
- Custom tip percentage input
- Edit/undo flow
- Share/export results

**Addresses features:**
- All "should have" differentiators from FEATURES.md

**Avoids pitfalls:**
- Custom split ratios don't balance (validation to 100%)

**Research needs:** Consider `/gsd:research-phase` for share/export integration if needed, otherwise standard patterns.

### Phase Ordering Rationale

- **Types → Calculations → State → UI** follows strict architectural dependency chain from ARCHITECTURE.md
- **Foundation first** addresses all 4 critical pitfalls that are costly to retrofit (PITFALLS.md)
- **Linear user flow** matches wizard pattern (People → Items → Assign → Tax/Tip → Results) from FEATURES.md
- **Parallel opportunities** exist within Phase 3 (step components independent) and Phase 1 (calculations and storage service)
- **MVP completeness** achieved at end of Phase 4, with Phase 5 enhancements driven by validation

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Well-documented money math patterns, standard TypeScript setup
- **Phase 2:** Zustand has excellent documentation, localStorage is standard Web API
- **Phase 3:** Standard React component patterns, wizard flows well-established
- **Phase 4:** Common patterns for calculator UIs and results displays

**Phases that might need deeper research during planning:**
- **Phase 5 (Share/export):** May need research on share APIs if targeting native share sheet vs simple copy-to-clipboard

**Overall assessment:** This is a well-trodden domain with established patterns. No phase requires deep research unless team is unfamiliar with React/TypeScript ecosystem.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | React/TypeScript/Zustand are industry-standard choices for this use case, well-documented and proven |
| Features | MEDIUM-HIGH | Table stakes features are clear from competitor analysis, differentiators based on user pain points observed across multiple sources |
| Architecture | MEDIUM | Patterns are well-established (pure functions, Zustand stores, component separation), specific to this domain's needs |
| Pitfalls | HIGH | Money math pitfalls are well-documented across fintech domain, mobile UX pitfalls verified through multiple sources |

**Overall confidence:** MEDIUM-HIGH

The stack and pitfall research is highly confident due to established patterns and well-documented approaches. Feature research is slightly lower confidence due to reliance on competitive analysis rather than direct user research, but table stakes features are clear. Architecture confidence is medium because while patterns are standard, the specific application to this domain's needs is inferred.

### Gaps to Address

**Feature validation gaps:**
- **User preference for flow style:** Research assumes linear wizard is better than all-at-once form, but this is inferred from competitor analysis. Consider A/B testing or user interviews early in Phase 3 to validate.
- **Share/export format:** Research doesn't specify whether users prefer text, screenshot, or structured data format. Defer to Phase 5 and determine based on user feedback during MVP testing.

**Technical validation gaps:**
- **Mobile keyboard handling specifics:** visualViewport API browser support is high, but testing needed across iOS Safari, Chrome Mobile, and Android browsers to verify behavior consistency.
- **localStorage limits:** Assumes 5-10MB localStorage is sufficient for history feature, but need to monitor actual usage and implement rotation/cleanup if users hit limits.

**Mitigation strategy:**
- **Phase 1-2:** No validation needed, technical foundation is well-established
- **Phase 3:** Conduct usability testing on linear flow before committing to full implementation
- **Phase 4:** Test on real mobile devices across iOS/Android before considering complete
- **Phase 5:** Gather user feedback on share/export needs before implementation

## Sources

### Primary (HIGH confidence)
- **React Official Documentation** — Component patterns, TypeScript integration, React 19 features
- **MDN Web Docs** — localStorage API, visualViewport API, mobile input handling
- **Zustand Official Documentation** — State management patterns, persist middleware
- **IEEE 754 Floating Point Specification** — Why money must be integers, not floats

### Secondary (MEDIUM confidence)
- **Splitwise Product Analysis** — Feature expectations, competitive landscape
- **Tab App Product Analysis** — Linear flow patterns, mobile-first approach
- **Stack Overflow Mobile UX Patterns** — Keyboard handling, touch target sizing
- **Developer Community Consensus** — TypeScript for money math, Vite over CRA

### Tertiary (LOW confidence)
- **General UX Principles** — Linear wizard flow reduces cognitive load (needs validation)
- **Assumed User Behavior** — Restaurant use case assumptions (single-session focus)

---
*Research completed: 2026-02-09*
*Ready for roadmap: yes*
