# Feature Research

**Domain:** Bill-splitting / expense splitting apps
**Researched:** 2026-02-09
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Add people to split** | Core requirement - can't split without knowing who | LOW | Name input |
| **Add items/expenses** | Need to know what's being split | LOW | Item name + amount |
| **Basic equal split** | Most common use case at restaurants | LOW | Divide total by number of people |
| **Per-person assignment** | "I had the burger, you had the salad" | MEDIUM | Item-to-person mapping |
| **Tax calculation** | Restaurants always have tax | LOW | Either percentage or fixed amount |
| **Tip calculation** | Expected at restaurants, especially in US | LOW | Percentage-based presets |
| **Final totals per person** | Clear "you owe X" summary | MEDIUM | Aggregate items + proportional tax/tip |
| **Mobile-friendly interface** | Used at dinner table on phones | MEDIUM | Touch targets, responsive design |
| **No sign-up required** | Friction of account creation kills usage | LOW | Local storage only |
| **Clear visual feedback** | Users need to see what's assigned to whom | MEDIUM | Visual indicators, checkmarks |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Shared item splitting** | "We split the appetizer 3 ways" | MEDIUM | UI for selecting sharers, split logic |
| **Custom split percentages** | "70/30 split" for unequal sharing | MEDIUM | Input validation, must total 100% |
| **Session history** | "What did we pay last time?" | LOW | LocalStorage, no backend |
| **Instant calculations** | No "calculate" button - updates live | MEDIUM | Reactive state management |
| **Flexible tax input** | Some receipts show amount, not rate | LOW | Toggle between percentage and fixed |
| **Quick presets** | Common tip percentages (15%, 18%, 20%) | LOW | Button UI, reduces typing |
| **Edit/undo flow** | Mistakes happen with touch | MEDIUM | State history, clear affordances |
| **Print/share results** | Send breakdown to group chat | MEDIUM | Format for sharing |
| **Offline-first** | Works without internet at restaurant | LOW | No backend dependency |
| **Linear guided flow** | Reduces cognitive load at dinner table | MEDIUM | Step-by-step wizard |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Venmo/PayPal integration** | "Pay right from the app!" | Requires auth, backend, PCI compliance | Show amounts, users pay via preferred method |
| **Photo receipt scanning** | "Take a picture!" | OCR inaccuracy, slow, camera permissions | Manual entry is faster for small bills |
| **User accounts/profiles** | "Remember my friends!" | Adds complexity, kills quick usage | Local storage for history |
| **Multi-currency support** | "For international trips!" | Exchange rate APIs, complexity | Focus on single-currency restaurant use |
| **Debt tracking over time** | "Who owes me from last month?" | Becomes different product, requires backend | Single-session focus |
| **Group balancing** | "Optimize who pays whom" | Complex algorithm, confusing UX | Simple per-person totals |
| **Social features** | "Share on social media!" | Privacy concerns, scope creep | Keep utility-focused |
| **Custom categories** | "Tag this as 'date night'" | Adds cognitive overhead | Keep flow simple and fast |

## Feature Dependencies

```
[Per-person assignment]
    └──requires──> [Add people]
    └──requires──> [Add items]

[Shared item splitting]
    └──requires──> [Per-person assignment]

[Final totals per person]
    └──requires──> [Per-person assignment]
    └──requires──> [Tax calculation]
    └──requires──> [Tip calculation]

[Session history]
    └──requires──> [Final totals per person]

[Custom split percentages] ──enhances──> [Shared item splitting]
```

## MVP Definition

### Launch With (v1)

- [ ] Add people
- [ ] Add items with amounts
- [ ] Per-person item assignment
- [ ] Basic shared item splitting (equal only)
- [ ] Tax as percentage
- [ ] Tip with presets (15%, 18%, 20%)
- [ ] Final totals per person
- [ ] Linear flow (people → items → assignments → tip/tax → results)
- [ ] Mobile-responsive design
- [ ] Instant calculations

### Add After Validation (v1.x)

- [ ] Custom split percentages
- [ ] Tax as fixed amount
- [ ] Custom tip percentage
- [ ] Session history
- [ ] Edit/undo flow
- [ ] Share/export results

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Add people | HIGH | LOW | P1 |
| Add items | HIGH | LOW | P1 |
| Per-person assignment | HIGH | MEDIUM | P1 |
| Basic shared splitting | HIGH | MEDIUM | P1 |
| Tax (percentage) | HIGH | LOW | P1 |
| Tip with presets | HIGH | LOW | P1 |
| Final totals | HIGH | MEDIUM | P1 |
| Linear flow | HIGH | MEDIUM | P1 |
| Mobile responsive | HIGH | MEDIUM | P1 |
| Instant calculations | HIGH | MEDIUM | P1 |
| Custom split percentages | MEDIUM | MEDIUM | P2 |
| Tax (fixed amount) | MEDIUM | LOW | P2 |
| Session history | MEDIUM | LOW | P2 |
| Edit/undo | MEDIUM | MEDIUM | P2 |
| Share results | MEDIUM | MEDIUM | P2 |

## Competitor Analysis

| Feature | Splitwise | Tab | Our Approach |
|---------|-----------|-----|--------------|
| Per-person items | Yes, complex UI | Yes, simple tap | Simple tap assignment, linear flow |
| Shared items | Custom amounts only | Equal split only | Equal + custom percentages |
| Tax/Tip | Manual | Auto-proportional | Auto-proportional with clear controls |
| User accounts | Required | Required | Not required (local only) |
| Flow style | All-at-once form | Linear wizard | Linear wizard |
| Offline support | Partial | No | Full (no backend) |
| Speed | Slow (sync) | Medium | Instant (local, reactive) |

**Key differentiation:** Faster and simpler for single-bill restaurant scenarios. No accounts, no internet needed, instant calculations.
