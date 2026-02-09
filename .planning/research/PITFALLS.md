# Pitfalls Research: Expense Splitter

## Critical Pitfalls

### 1. Floating Point Math for Currency
**What:** JavaScript `0.1 + 0.2 ≠ 0.3`. Using native floats for money causes penny mismatches.
**Why it matters:** Bill totals won't add up. Users will notice and lose trust immediately.
**Prevention:** Store all amounts in integer cents. `$12.50 → 1250`. Only convert to dollars for display.
**Warning signs:** Sum of individual shares ≠ bill total. Off-by-one-cent errors.
**Phase:** Phase 1 (Foundation) — architecture decision, extremely costly to change later.

### 2. Unbalanced Splits (Penny Problem)
**What:** `$10.00 ÷ 3 = $3.33 × 3 = $9.99`. One penny is lost.
**Why it matters:** Someone has to absorb the remainder. If not handled, totals don't balance.
**Prevention:** Implement deterministic remainder distribution — assign extra cents round-robin to participants.
**Warning signs:** Assertion `sum(shares) !== total` fails.
**Phase:** Phase 1 (Foundation) — core calculation engine must handle this from day one.

### 3. Tax-Then-Tip vs Tip-Then-Tax
**What:** Regional variation in whether tip is calculated before or after tax.
**Why it matters:** Can cause 5-10% difference in individual amounts. Users will argue about correctness.
**Prevention:** Default to tip-on-subtotal (most common), show calculation breakdown transparently.
**Warning signs:** Users reporting "wrong" totals — likely a calculation order mismatch with expectations.
**Phase:** Phase 2 (Core features) — tip/tax calculation logic.

### 4. Lost Context After Refresh
**What:** No persistence means users lose everything if they accidentally refresh or switch apps on mobile.
**Why it matters:** At a dinner table, someone will bump the phone or switch to texts. Losing all input is catastrophic.
**Prevention:** Auto-save to localStorage on every state change via Zustand persist middleware.
**Warning signs:** Any state not flowing through the persisted store.
**Phase:** Phase 1 (Foundation) — wire up persistence from the start.

### 5. Mobile Keyboard Obscures Input
**What:** Virtual keyboard takes 40-50% of screen height, covering input fields and action buttons.
**Why it matters:** Users can't see what they're typing or find the "Add" button. Frustration at the table.
**Prevention:** Use `visualViewport` API to detect keyboard. Scroll active input into view. Place actions above keyboard.
**Warning signs:** Testing only in desktop DevTools — must test on real mobile devices.
**Phase:** Phase 1 (Foundation) — CSS architecture decision for mobile-first layout.

### 6. Custom Split Ratios Don't Balance
**What:** User enters custom splits that don't add up to 100% (e.g., 40% + 30% + 20% = 90%).
**Why it matters:** Remaining 10% is unaccounted for. Silent data loss.
**Prevention:** Real-time validation showing remaining amount. Don't allow submission until balanced.
**Warning signs:** No validation on custom split inputs.
**Phase:** Phase 2 (Core features) — shared item assignment logic.

### 7. Equal Split Ignores Opt-Outs
**What:** "Split appetizer equally" charges someone who didn't eat it.
**Why it matters:** Unfairness — the core problem the app is supposed to solve.
**Prevention:** Per-item participant tracking. Only split among assigned people, not all diners.
**Warning signs:** No way to exclude someone from a shared item.
**Phase:** Phase 2 (Core features) — item assignment UI.

### 8. Results Screen is an Afterthought
**What:** The final "who pays what" screen is unclear, buried, or doesn't show enough detail.
**Why it matters:** This IS the product. If people still pull out calculators after seeing results, the app failed.
**Prevention:** Design results screen first. Show summary + expandable detail. Make totals prominent.
**Warning signs:** Results screen designed last. No user testing on this screen.
**Phase:** Phase 3 (Results/Polish) — but design mockup should inform Phase 1 architecture.

## Technical Debt Patterns

| Pattern | Risk | Prevention |
|---------|------|------------|
| Floats for money | High | Integer cents from day one |
| Manual DOM for mobile keyboard | Medium | Use visualViewport API |
| Inline styles instead of design system | Medium | TailwindCSS utilities from start |
| Giant monolithic component | Medium | Split by flow step early |
| No calculation tests | High | Unit test split/tip/tax logic immediately |

## UX Pitfalls

| Pitfall | Impact | Fix |
|---------|--------|-----|
| Tiny tap targets on mobile | Users can't hit buttons | 44px minimum touch targets |
| No decimal keyboard on price inputs | Users type letters | `inputMode="decimal"` on number fields |
| No undo for item deletion | Accidental data loss | Confirmation or undo toast |
| Flow isn't skippable | Can't go back to fix mistakes | Allow navigation between steps |
| No empty state guidance | Users stare at blank screen | Clear CTAs: "Add your first person" |
| Calculation not visible | Users don't trust the math | Show running total and per-person preview |

## Pitfall-to-Phase Mapping

| Pitfall | Phase | Priority |
|---------|-------|----------|
| Floating point math | 1 - Foundation | Critical |
| Penny problem | 1 - Foundation | Critical |
| localStorage persistence | 1 - Foundation | Critical |
| Mobile keyboard handling | 1 - Foundation | High |
| Tax/tip calculation order | 2 - Core Features | High |
| Per-item participant tracking | 2 - Core Features | High |
| Custom split validation | 2 - Core Features | Medium |
| Results screen clarity | 3 - Results | High |
