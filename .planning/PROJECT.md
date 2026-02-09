# Expense Splitter

## What This Is

A mobile-friendly web app that splits restaurant bills fairly among friends. It handles the messy reality of shared appetizers, group tip calculations, and tax — turning the awkward end-of-dinner math into a quick, clear breakdown of what each person owes.

## Core Value

Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax — no more overpaying or awkward rounding.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Add people to the table by name
- [ ] Add items from the receipt with prices
- [ ] Assign items to one or more people
- [ ] Shared items split equally by default with custom split override
- [ ] Group tip percentage applied proportionally to each person's subtotal
- [ ] Tax entered as percentage rate or exact dollar amount from receipt
- [ ] Tax split proportionally across each person's subtotal
- [ ] Summary view showing each person's total
- [ ] Detailed view with per-person itemized breakdown (items, tip share, tax share)
- [ ] Save split history for past reference

### Out of Scope

- Per-person tip percentages — group tip keeps it simple, avoids complexity
- Native mobile app — mobile-friendly web covers the use case
- Shareable links — save history is sufficient for v1
- User accounts/authentication — local storage is fine for v1
- Payment integration (Venmo, PayPal) — just show amounts, users pay however they want

## Context

This solves a universal pain point: the messy bill-splitting moment at restaurants. Current solutions (calculator apps, Splitwise) either don't handle shared items well or require everyone to have an account. This app should be quick to use — someone pulls it up at the table, enters the bill, and everyone knows what they owe in under 2 minutes.

The flow is intentionally linear: people → items → assignments → tip/tax → results. This mirrors how someone naturally reads a receipt.

## Constraints

- **Platform**: Mobile-friendly web app (responsive, works on phone browsers at the dinner table)
- **Performance**: Must feel instant — no loading spinners for calculations
- **Simplicity**: Usable by anyone at a dinner table without instructions
- **Storage**: Local storage for history (no backend required for v1)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Group tip (not per-person) | Simplifies UX, covers 90% of real-world cases | — Pending |
| People-first flow | Mirrors natural receipt reading; need to know who's at the table before assigning items | — Pending |
| Local storage for history | No backend complexity, still useful for personal reference | — Pending |
| Tax as rate OR exact amount | Some receipts show rate, others show total tax — support both | — Pending |

---
*Last updated: 2026-02-09 after initialization*
