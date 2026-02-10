---
status: complete
phase: 04-tax-tip-and-assignment
source:
  - 04-01-SUMMARY.md
  - 04-02-SUMMARY.md
started: 2026-02-10T06:52:00Z
updated: 2026-02-10T07:06:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Tap person badge to assign item
expected: Tap person badge on an item. Badge highlights blue when assigned, returns to default when tapped again (tap-to-toggle).
result: pass

### 2. View assignment summary
expected: When 1 person assigned to item, shows "Assigned to [Name]". When 2+ people assigned, shows "Split equally among [N] people".
result: pass

### 3. Custom split button appears
expected: When 2+ people are assigned to an item, "Custom Split" button appears below the item.
result: pass

### 4. Open custom split editor
expected: Click "Custom Split" button. Inline editor appears below item showing percentage inputs for each assigned person with running total.
result: pass

### 5. Custom split percentage validation
expected: Enter percentages in custom split editor. Running total shows green when sum = 100%, red otherwise. Save button disabled until total = 100%.
result: pass

### 6. Save custom split
expected: Set percentages to total 100% in custom split editor. Save button becomes enabled. Click Save. Editor closes and summary shows "Custom split applied".
result: pass

### 7. Revert to equal split
expected: When custom split is active on an item, "Revert to Equal" button appears. Click it - custom split is removed and item returns to equal split among assigned people.
result: pass

### 8. Tax mode toggle
expected: Navigate to Tax & Tip step (step 4). See radio buttons for "Tax Rate (%)" and "Exact Amount ($)". Click each - input field changes to match mode (percentage or dollar input).
result: pass

### 9. Tax rate configuration
expected: Select "Tax Rate (%)" mode. Enter a percentage (e.g., 8.5). Preview text updates to show "Tax: 8.5%". Value persists when navigating back/forward.
result: pass

### 10. Tax exact amount configuration
expected: Select "Exact Amount ($)" mode. Enter dollar amount (e.g., 8.25). Preview text updates to show "Tax: $8.25". Value persists when navigating back/forward.
result: pass

### 11. No tax option
expected: Click "No Tax" button. Tax configuration clears. Preview shows "No tax configured".
result: pass

### 12. Tip preset buttons
expected: See three preset buttons: 15%, 18%, 20%. Click 18% - button highlights with active state (aria-pressed). Preview shows "Tip: 18%".
result: pass

### 13. Tip custom percentage
expected: Enter custom percentage in tip input (e.g., 22). Tip updates to 22%. Preview shows "Tip: 22%". If preset was active, it deactivates.
result: pass

### 14. Wizard navigation with 4 steps
expected: Complete People (2+ people) → Items (1+ item) → Assignment (1+ assigned) → Tax & Tip. Next button enabled/disabled based on validation gates. Back button works at each step.
result: pass

### 15. Auto-advance on refresh
expected: Complete steps 1-3 (People, Items, Assignment). Refresh page. App auto-advances to Tax & Tip step (step 4) instead of starting at People.
result: pass

## Summary

total: 15
passed: 15
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
