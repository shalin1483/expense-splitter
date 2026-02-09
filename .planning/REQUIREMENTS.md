# Requirements: Expense Splitter

**Defined:** 2026-02-09
**Core Value:** Accurately split a restaurant bill so every person pays exactly their fair share, including shared items, tip, and tax

## v1 Requirements

### People Management

- [ ] **PEOPLE-01**: User can add people to the bill by name
- [ ] **PEOPLE-02**: User can remove a person from the bill

### Items & Assignment

- [ ] **ITEM-01**: User can add items with name and price
- [ ] **ITEM-02**: User can assign an item to one or more people
- [ ] **ITEM-03**: Shared items split equally among assigned people by default
- [ ] **ITEM-04**: User can override with custom split amounts for shared items

### Tax & Tip

- [ ] **TAX-01**: User can enter tax as a percentage rate
- [ ] **TAX-02**: User can enter tax as an exact dollar amount
- [ ] **TAX-03**: Tax distributed proportionally across each person's subtotal
- [ ] **TIP-01**: User can select tip from presets (15%, 18%, 20%)
- [ ] **TIP-02**: User can enter a custom tip percentage
- [ ] **TIP-03**: Tip distributed proportionally across each person's subtotal

### Results

- [ ] **RESULT-01**: User sees summary with each person's total amount owed
- [ ] **RESULT-02**: User can expand to see per-person itemized breakdown (items, tax share, tip share)
- [ ] **RESULT-03**: User can save completed splits to history for later reference

### UX & Flow

- [ ] **UX-01**: App is mobile-responsive and usable on phone at dinner table
- [ ] **UX-02**: Linear wizard flow guides user through people → items → assign → tip/tax → results
- [ ] **UX-03**: Calculations update instantly as user enters data

## v2 Requirements

### Sharing & Export

- **SHARE-01**: User can share results via link or text
- **SHARE-02**: User can export results as image/screenshot

### Enhanced UX

- **ENH-01**: Edit/undo flow for correcting mistakes
- **ENH-02**: Dark mode for low-light restaurant settings
- **ENH-03**: Receipt templates for frequent dining spots

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment integration (Venmo, PayPal) | Requires auth, backend, PCI compliance — just show amounts |
| Receipt photo scanning (OCR) | Slow, inaccurate, complex — manual entry is faster for small bills |
| User accounts/profiles | Kills quick usage model, adds backend complexity |
| Multi-currency support | Overkill for restaurant use case |
| Debt tracking over time | Different product entirely, requires backend |
| Per-person tip percentages | Group tip covers 90% of cases, keeps UX simple |
| Native mobile app | Mobile-friendly web covers the use case |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PEOPLE-01 | Phase 3 | Pending |
| PEOPLE-02 | Phase 3 | Pending |
| ITEM-01 | Phase 3 | Pending |
| ITEM-02 | Phase 4 | Pending |
| ITEM-03 | Phase 4 | Pending |
| ITEM-04 | Phase 4 | Pending |
| TAX-01 | Phase 4 | Pending |
| TAX-02 | Phase 4 | Pending |
| TAX-03 | Phase 4 | Pending |
| TIP-01 | Phase 4 | Pending |
| TIP-02 | Phase 4 | Pending |
| TIP-03 | Phase 4 | Pending |
| RESULT-01 | Phase 5 | Pending |
| RESULT-02 | Phase 5 | Pending |
| RESULT-03 | Phase 5 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 1, Phase 5 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-09*
*Last updated: 2026-02-09 after roadmap creation*
