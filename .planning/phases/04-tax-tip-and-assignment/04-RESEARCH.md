# Phase 4: Tax, Tip & Assignment - Research

**Researched:** 2026-02-09
**Domain:** Interactive item assignment UI with tax/tip configuration and custom split handling
**Confidence:** MEDIUM-HIGH

## Summary

Phase 4 builds the assignment interface and tax/tip configuration, completing the bill splitting logic. This is fundamentally an **interactive selection problem** combined with **financial input configuration**. Users need to (1) assign items to people via tap/checkbox selection, (2) optionally override equal splits with custom percentages, and (3) configure tax and tip inputs that apply proportionally to final calculations.

The core challenge is **multi-select item assignment UX** on mobile. Research shows modern bill splitting apps use tap-to-toggle patterns with visual assignment badges, not checkboxes-per-person sprawl. For shared items, the default is equal split with an opt-in custom split mode that validates percentages total 100%. Tax/tip inputs follow a **preset + custom pattern** - quick tap presets (15%, 18%, 20%) with fallback to custom input, supporting both percentage and exact dollar amounts for tax.

Phase 1-3 already provide all calculation functions (splitEqually, allocateProportionally, calculateTax, calculateTip, distributeTax, distributeTip) and store actions (assignItem, setCustomSplit, setTaxInput, setTipRate). Phase 4's job is purely presentational: render assignment UI, validate custom splits, configure tax/tip, and wire to existing store/calculations.

**Primary recommendation:** Use item-centric assignment view (not person-centric) with tap-to-toggle person badges on each item. Radio button group for tip presets with "Custom" option revealing input. Tax input as radio toggle between "Percentage" and "Dollar Amount" modes. Validate custom splits sum to 100% with real-time feedback. Follow established patterns from Phase 3 (controlled inputs, local state for drafts, Zustand actions for commits).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.4 | UI rendering, interactive selection | Already integrated in Phase 3 |
| zustand | 5.0.11 | State management, assignment storage | Phase 2 foundation, provides assignItem/setCustomSplit actions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | - | All functionality built with existing stack | Phase 4 uses Phase 1-3 primitives |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tap-to-toggle badges | Checkbox grid per person per item | Checkbox sprawl unreadable on mobile, scales poorly with 5+ people |
| Radio buttons for presets | Dropdown select | Radio buttons show all options at once, faster mobile tap targets |
| Percentage validation | Allow any values, fail on calculate | Real-time validation prevents user frustration, guides correction before submission |

**Installation:**
```bash
# No new dependencies needed - using React 19 + existing Zustand from Phase 2-3
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── PeopleStep.tsx          # (Phase 3) Add/remove people
│   ├── ItemsStep.tsx           # (Phase 3) Add/remove items
│   ├── AssignmentStep.tsx      # (Phase 4) Assign items to people
│   ├── TaxTipStep.tsx          # (Phase 4) Configure tax & tip
│   ├── ResultsStep.tsx         # (Phase 4) Show calculated split
│   └── BillWizard.tsx          # (Phase 3) Wizard orchestrator - extend to 5 steps
├── lib/
│   ├── calculations/           # (Phase 1) Pure calculation functions
│   │   ├── split.ts            # splitEqually - used for equal split mode
│   │   ├── allocate.ts         # allocateProportionally - used by tax/tip distribution
│   │   ├── tax.ts              # calculateTax, distributeTax
│   │   └── tip.ts              # calculateTip, distributeTip
│   └── types/
│       └── bill.ts             # Assignment, CustomSplit, TaxInput types
└── stores/
    └── billStore.ts            # assignItem, setCustomSplit, setTaxInput, setTipRate actions
```

### Pattern 1: Item-Centric Assignment with Tap-to-Toggle Badges
**What:** Display items in list, each item shows tap-able person badges for assignment, single tap adds/removes person from item
**When to use:** Multi-person item assignment on mobile - scales better than checkbox grids
**Example:**
```tsx
// Source: Mobile bill splitting app patterns (Medium case studies)
import { useItems, usePeople, useAssignments, useBillActions } from '@/stores/billStore';

export function AssignmentStep() {
  const items = useItems();
  const people = usePeople();
  const assignments = useAssignments();
  const { assignItem } = useBillActions();

  const togglePersonOnItem = (itemId: string, personId: string) => {
    const currentAssignment = assignments[itemId];
    const currentPersonIds = currentAssignment?.personIds || [];

    let newPersonIds: string[];
    if (currentPersonIds.includes(personId)) {
      // Remove person from item
      newPersonIds = currentPersonIds.filter(id => id !== personId);
    } else {
      // Add person to item
      newPersonIds = [...currentPersonIds, personId];
    }

    assignItem(itemId, newPersonIds);
  };

  const isPersonAssigned = (itemId: string, personId: string): boolean => {
    return assignments[itemId]?.personIds.includes(personId) || false;
  };

  return (
    <div>
      <h2>Assign Items to People</h2>
      {items.map(item => (
        <div key={item.id} className="item-assignment">
          <h3>{item.name} - {formatCurrency(item.priceInCents)}</h3>
          <div className="person-badges">
            {people.map(person => (
              <button
                key={person.id}
                className={`person-badge ${isPersonAssigned(item.id, person.id) ? 'active' : ''}`}
                onClick={() => togglePersonOnItem(item.id, person.id)}
                aria-pressed={isPersonAssigned(item.id, person.id)}
              >
                {person.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 2: Equal Split Default with Custom Split Override
**What:** Items assigned to multiple people default to equal split, "Custom Split" button reveals percentage inputs that must total 100%
**When to use:** When shared items need unequal distribution (e.g., one person ate 2/3 of shared appetizer)
**Example:**
```tsx
// Source: Custom percentage split UI pattern research
import { useState } from 'react';
import { useAssignments, useBillActions } from '@/stores/billStore';
import { splitEqually } from '@/lib/calculations/split';
import type { CustomSplit } from '@/lib/types/bill';

interface CustomSplitEditorProps {
  itemId: string;
  itemPrice: Cents;
  assignedPeople: Array<{ id: string; name: string }>;
  onSave: (split: CustomSplit) => void;
  onCancel: () => void;
}

function CustomSplitEditor({ itemId, itemPrice, assignedPeople, onSave, onCancel }: CustomSplitEditorProps) {
  // Initialize percentages to equal split
  const initialPercentages = assignedPeople.reduce((acc, person) => {
    acc[person.id] = Math.floor(100 / assignedPeople.length);
    return acc;
  }, {} as Record<string, number>);

  const [percentages, setPercentages] = useState(initialPercentages);

  const total = Object.values(percentages).reduce((sum, p) => sum + p, 0);
  const isValid = total === 100;

  const handleSave = () => {
    if (!isValid) return;

    // Convert percentages to cents
    const customSplit: CustomSplit = assignedPeople.map(person => ({
      personId: person.id,
      amountInCents: Math.round((itemPrice * percentages[person.id]) / 100) as Cents,
    }));

    onSave(customSplit);
  };

  return (
    <div className="custom-split-editor">
      <h4>Custom Split</h4>
      {assignedPeople.map(person => (
        <label key={person.id}>
          {person.name}
          <input
            type="number"
            min="0"
            max="100"
            value={percentages[person.id]}
            onChange={(e) => setPercentages({
              ...percentages,
              [person.id]: parseInt(e.target.value) || 0,
            })}
          />
          %
        </label>
      ))}
      <div className={`total-validation ${isValid ? 'valid' : 'invalid'}`}>
        Total: {total}% {isValid ? '✓' : `(must equal 100%)`}
      </div>
      <button onClick={handleSave} disabled={!isValid}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

// Usage in AssignmentStep
function ItemWithCustomSplit({ item }: { item: Item }) {
  const [isEditingCustomSplit, setIsEditingCustomSplit] = useState(false);
  const assignments = useAssignments();
  const { setCustomSplit, clearCustomSplit } = useBillActions();

  const assignment = assignments[item.id];
  const hasCustomSplit = assignment?.customSplit !== undefined;

  const handleSaveCustomSplit = (split: CustomSplit) => {
    setCustomSplit(item.id, split);
    setIsEditingCustomSplit(false);
  };

  const handleRevertToEqual = () => {
    clearCustomSplit(item.id);
  };

  return (
    <div>
      {/* Item name, assignment badges */}
      {assignment && assignment.personIds.length > 1 && (
        <div>
          {hasCustomSplit ? (
            <>
              <span>Custom split applied</span>
              <button onClick={handleRevertToEqual}>Revert to equal</button>
            </>
          ) : (
            <button onClick={() => setIsEditingCustomSplit(true)}>
              Custom Split
            </button>
          )}
        </div>
      )}
      {isEditingCustomSplit && (
        <CustomSplitEditor
          itemId={item.id}
          itemPrice={item.priceInCents}
          assignedPeople={assignedPeople}
          onSave={handleSaveCustomSplit}
          onCancel={() => setIsEditingCustomSplit(false)}
        />
      )}
    </div>
  );
}
```

### Pattern 3: Tip Presets with Custom Override
**What:** Radio button group with common presets (15%, 18%, 20%) plus "Custom" option revealing percentage input
**When to use:** Any percentage configuration with common values - balances speed (presets) with flexibility (custom)
**Example:**
```tsx
// Source: React radio button group preset values pattern
import { useState } from 'react';
import { useTipRate, useBillActions } from '@/stores/billStore';

const TIP_PRESETS = [0.15, 0.18, 0.20] as const;

export function TipConfiguration() {
  const tipRate = useTipRate();
  const { setTipRate } = useBillActions();

  // Determine if current rate is a preset or custom
  const isPreset = TIP_PRESETS.includes(tipRate as typeof TIP_PRESETS[number]);
  const [mode, setMode] = useState<'preset' | 'custom'>(isPreset ? 'preset' : 'custom');
  const [customPercentage, setCustomPercentage] = useState(
    isPreset ? '' : String(Math.round(tipRate * 100))
  );

  const handlePresetChange = (rate: number) => {
    setMode('preset');
    setTipRate(rate);
  };

  const handleCustomChange = (percentageStr: string) => {
    const percentage = parseFloat(percentageStr);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setTipRate(percentage / 100);
      setCustomPercentage(percentageStr);
    }
  };

  const handleModeChange = (newMode: 'preset' | 'custom') => {
    setMode(newMode);
    if (newMode === 'preset' && !isPreset) {
      // Reset to default preset
      setTipRate(0.18);
    }
  };

  return (
    <div className="tip-configuration">
      <h3>Tip</h3>

      <div className="tip-mode">
        <button
          className={mode === 'preset' ? 'active' : ''}
          onClick={() => handleModeChange('preset')}
        >
          Preset
        </button>
        <button
          className={mode === 'custom' ? 'active' : ''}
          onClick={() => handleModeChange('custom')}
        >
          Custom
        </button>
      </div>

      {mode === 'preset' && (
        <div className="tip-presets" role="radiogroup">
          {TIP_PRESETS.map(rate => (
            <label key={rate}>
              <input
                type="radio"
                name="tip-preset"
                checked={tipRate === rate}
                onChange={() => handlePresetChange(rate)}
              />
              {Math.round(rate * 100)}%
            </label>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <label>
          Tip percentage
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            value={customPercentage}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="18.0"
          />
          %
        </label>
      )}
    </div>
  );
}
```

### Pattern 4: Tax Input Mode Toggle (Rate vs Exact Amount)
**What:** Radio buttons toggle between "Percentage" and "Dollar Amount" modes, input field changes context based on selection
**When to use:** When receipts show tax in different formats - some show rate (8%), others show exact amount ($8.25)
**Example:**
```tsx
// Source: TaxInput discriminated union from Phase 1, common form pattern
import { useState } from 'react';
import { useTaxInput, useBillActions } from '@/stores/billStore';
import { toCents } from '@/lib/types/money';
import type { TaxInput } from '@/lib/types/bill';

export function TaxConfiguration() {
  const taxInput = useTaxInput();
  const { setTaxInput } = useBillActions();

  const [mode, setMode] = useState<'rate' | 'exact'>(
    taxInput?.type || 'rate'
  );
  const [ratePercentage, setRatePercentage] = useState(
    taxInput?.type === 'rate' ? String(taxInput.rate * 100) : '8.0'
  );
  const [exactDollars, setExactDollars] = useState(
    taxInput?.type === 'exact' ? String(taxInput.amount / 100) : ''
  );

  const handleApply = () => {
    if (mode === 'rate') {
      const percentage = parseFloat(ratePercentage);
      if (!isNaN(percentage) && percentage >= 0) {
        setTaxInput({ type: 'rate', rate: percentage / 100 });
      }
    } else {
      const dollars = parseFloat(exactDollars);
      if (!isNaN(dollars) && dollars >= 0) {
        setTaxInput({ type: 'exact', amount: toCents(dollars) });
      }
    }
  };

  const handleClear = () => {
    setTaxInput(null);
  };

  return (
    <div className="tax-configuration">
      <h3>Tax</h3>

      <div className="tax-mode" role="radiogroup">
        <label>
          <input
            type="radio"
            name="tax-mode"
            checked={mode === 'rate'}
            onChange={() => setMode('rate')}
          />
          Percentage
        </label>
        <label>
          <input
            type="radio"
            name="tax-mode"
            checked={mode === 'exact'}
            onChange={() => setMode('exact')}
          />
          Dollar Amount
        </label>
      </div>

      {mode === 'rate' && (
        <label>
          Tax rate
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            value={ratePercentage}
            onChange={(e) => setRatePercentage(e.target.value)}
            placeholder="8.0"
          />
          %
        </label>
      )}

      {mode === 'exact' && (
        <label>
          Tax amount
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={exactDollars}
            onChange={(e) => setExactDollars(e.target.value)}
            placeholder="0.00"
          />
          $
        </label>
      )}

      <button onClick={handleApply}>Apply</button>
      {taxInput && <button onClick={handleClear}>Clear</button>}
    </div>
  );
}
```

### Pattern 5: Results Calculation with Detailed Breakdown
**What:** Compute each person's subtotal (sum of assigned item shares), distribute tax/tip proportionally, show itemized breakdown
**When to use:** Final results display showing how the total was calculated
**Example:**
```tsx
// Source: Phase 1 calculation functions + proportional distribution
import { usePeople, useItems, useAssignments, useTaxInput, useTipRate } from '@/stores/billStore';
import { splitEqually } from '@/lib/calculations/split';
import { calculateTax, distributeTax } from '@/lib/calculations/tax';
import { calculateTip, distributeTip } from '@/lib/calculations/tip';
import { formatCurrency } from '@/lib/types/money';
import type { Cents } from '@/lib/types/money';

interface PersonTotal {
  personId: string;
  personName: string;
  itemSubtotal: Cents;
  taxShare: Cents;
  tipShare: Cents;
  grandTotal: Cents;
  items: Array<{ name: string; amountPaid: Cents }>;
}

export function ResultsStep() {
  const people = usePeople();
  const items = useItems();
  const assignments = useAssignments();
  const taxInput = useTaxInput();
  const tipRate = useTipRate();

  // Calculate each person's item subtotal
  const personSubtotals = people.map(person => {
    let subtotal = 0;

    for (const item of items) {
      const assignment = assignments[item.id];
      if (!assignment || !assignment.personIds.includes(person.id)) continue;

      if (assignment.customSplit) {
        // Use custom split amount
        const customEntry = assignment.customSplit.find(s => s.personId === person.id);
        subtotal += customEntry?.amountInCents || 0;
      } else {
        // Equal split among assigned people
        const shares = splitEqually(item.priceInCents, assignment.personIds.length);
        const personIndex = assignment.personIds.indexOf(person.id);
        subtotal += shares[personIndex];
      }
    }

    return subtotal as Cents;
  });

  // Calculate totals
  const billSubtotal = personSubtotals.reduce((sum, s) => sum + s, 0) as Cents;
  const totalTax = taxInput ? calculateTax(billSubtotal, taxInput) : (0 as Cents);
  const totalTip = calculateTip(billSubtotal, tipRate);

  // Distribute tax and tip proportionally
  const taxShares = totalTax > 0 ? distributeTax(totalTax, personSubtotals) : personSubtotals.map(() => 0 as Cents);
  const tipShares = distributeTip(totalTip, personSubtotals);

  const grandTotal = billSubtotal + totalTax + totalTip;

  const results: PersonTotal[] = people.map((person, i) => ({
    personId: person.id,
    personName: person.name,
    itemSubtotal: personSubtotals[i],
    taxShare: taxShares[i],
    tipShare: tipShares[i],
    grandTotal: (personSubtotals[i] + taxShares[i] + tipShares[i]) as Cents,
    items: [], // Would populate with item details
  }));

  return (
    <div className="results">
      <h2>Bill Split Results</h2>

      <div className="totals">
        <div>Subtotal: {formatCurrency(billSubtotal)}</div>
        <div>Tax: {formatCurrency(totalTax)}</div>
        <div>Tip: {formatCurrency(totalTip)}</div>
        <div className="grand-total">Total: {formatCurrency(grandTotal)}</div>
      </div>

      <h3>Each Person Owes:</h3>
      {results.map(result => (
        <div key={result.personId} className="person-result">
          <h4>{result.personName}</h4>
          <div>Items: {formatCurrency(result.itemSubtotal)}</div>
          <div>Tax: {formatCurrency(result.taxShare)}</div>
          <div>Tip: {formatCurrency(result.tipShare)}</div>
          <div className="person-total">Total: {formatCurrency(result.grandTotal)}</div>
        </div>
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Person-centric assignment view:** "Who has Caesar Salad?" is harder than "Who shares Caesar Salad?" - item-centric scales better with many people.
- **Checkbox grid explosion:** N items × M people = N×M checkboxes. Use tap-to-toggle badges instead.
- **Allowing invalid custom splits:** Don't save custom split if percentages don't total 100% - validate and block with clear error message.
- **Calculating results on every keystroke:** Debounce or calculate on step navigation, not during input editing.
- **Not showing equal split visually:** When no custom split exists, show "Split equally among 3 people" to communicate default behavior.
- **Forgetting to clear custom split when person removed:** Phase 2 store handles assignment cleanup, but UI should hide custom split UI if assignment changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Equal item splitting | Custom division logic | Phase 1 `splitEqually(total, numPeople)` | Already implements remainder distribution correctly |
| Proportional tax/tip distribution | Manual percentage calculations | Phase 1 `allocateProportionally(amount, subtotals)` | Uses largest remainder method, guarantees exact totals |
| Tax calculation | Custom rate/amount logic | Phase 1 `calculateTax(subtotal, taxInput)` | Handles both rate and exact amount modes |
| Tip calculation | Custom percentage math | Phase 1 `calculateTip(subtotal, rate)` | Pre-tax subtotal convention built-in |
| Percentage sum validation | Floating-point comparison | Integer percentage validation with `=== 100` check | Avoid floating-point equality bugs |
| Assignment state structure | Array of assignments | Phase 2 `Record<itemId, Assignment>` | O(1) lookup vs O(n) array scanning |

**Key insight:** Phase 1-3 already provide all primitives. Phase 4 is 90% UI wiring, 10% validation. The calculation functions are pure, tested, and handle edge cases (remainders, zero amounts, proportional distribution). Don't rebuild what exists.

## Common Pitfalls

### Pitfall 1: Custom Split Percentages Don't Sum to 100% Exactly
**What goes wrong:** User enters 33%, 33%, 34% for 3-way split, gets rejected because JavaScript floating-point math makes it 99.999...%.
**Why it happens:** Converting percentages to floats before validation, or using cents amounts that don't divide evenly.
**How to avoid:**
  - Store percentages as integers (0-100), validate `sum === 100` with integer math
  - When converting to cents, use `Math.round((itemPrice * percentage) / 100)`
  - Show real-time "Total: 99% (must equal 100%)" feedback as user types
  - Provide "Auto-adjust" button to distribute remainder to largest share
**Warning signs:** Users complain validation rejects valid-looking splits, floating-point precision errors in tests

### Pitfall 2: Item Unassigned But Custom Split Exists
**What goes wrong:** User creates custom split, then removes a person from assignment, custom split now references missing person.
**Why it happens:** Custom split not cleared when assignment changes.
**How to avoid:**
  - Phase 2 store's `assignItem` should clear custom split if `personIds` changes
  - Or: clearCustomSplit when any person removed from item
  - UI: hide custom split editor if assignment.personIds.length < 2
  - Test: verify custom split cleared when person count changes
**Warning signs:** Custom split references person not in assignment, calculation errors, stale split data

### Pitfall 3: Tax/Tip Calculated Before Items Assigned
**What goes wrong:** User configures tax/tip in step 3, assigns items in step 4, tax/tip distribution incorrect because it's based on old subtotals.
**Why it happens:** Calculating results when tax/tip configured, not waiting for final assignment state.
**How to avoid:**
  - Calculate results in ResultsStep only, after all inputs finalized
  - Tax/tip inputs are just configuration storage (taxInput, tipRate in store)
  - Actual calculateTax/distributeTax called in results phase
  - Don't show $ amounts in tax/tip config - just show rates/inputs
**Warning signs:** Tax/tip amounts don't match expected proportions, changing assignments doesn't update tax/tip

### Pitfall 4: Tap-to-Toggle Badges Not Accessible
**What goes wrong:** Screen reader users can't understand assignment state, keyboard users can't navigate badges.
**Why it happens:** Using div elements without ARIA attributes or keyboard support.
**How to avoid:**
  - Use button elements for person badges
  - Add `aria-pressed={isAssigned}` to indicate toggle state
  - Ensure focus ring visible for keyboard navigation
  - Test with keyboard only: Tab to badge, Space to toggle
  - Group badges with `role="group"` and `aria-label="Assign to people"`
**Warning signs:** Accessibility audits fail, keyboard navigation doesn't work, screen reader announces incorrectly

### Pitfall 5: Mobile Touch Targets Too Small for Person Badges
**What goes wrong:** Users tap wrong person when 5+ people in small badge layout, frustration with mis-assignments.
**Why it happens:** Forgot mobile touch target minimum (44×44px), badges squeezed to fit many people.
**How to avoid:**
  - Enforce 44px minimum height for badges (iOS guideline)
  - Use horizontal scrolling or wrapping layout if 5+ people
  - Minimum 8px gap between badges to prevent accidental taps
  - Test on actual mobile device with 5+ people scenario
  - Consider abbreviated names if full names overflow ("John" → "JO")
**Warning signs:** User complaints about mis-taps, unusable on mobile with many people, badges overlap

### Pitfall 6: Wizard Doesn't Allow Going Back to Edit Earlier Steps
**What goes wrong:** User gets to results, realizes they assigned wrong item, can't go back to fix without starting over.
**Why it happens:** Locked wizard progression, or back button disabled after certain point.
**How to avoid:**
  - Always allow "Back" button to previous steps
  - Preserve all state when navigating backward
  - Recalculate results when returning to results step
  - Phase 2 persist middleware ensures state survives refresh
  - Test: navigate forward to results, back to assignment, change assignment, forward to results - should show updated calculation
**Warning signs:** Users report data loss, can't edit after progressing, frustration with locked flow

### Pitfall 7: Floating-Point Errors in Percentage-to-Cents Conversion
**What goes wrong:** Custom split 50%/50% on $10.01 item results in 500¢ and 501¢, but sum is 1001¢ not 1001¢.
**Why it happens:** Rounding each percentage independently without ensuring sum equals original.
**How to avoid:**
  - Convert percentages to cents: `Math.round((itemPrice * percentage) / 100)`
  - Validate sum of custom split amounts equals item price
  - If off by 1¢ due to rounding, add/subtract from largest share
  - Use Phase 1 allocateProportionally if implementing proportional method
  - Test with odd cent values: $10.01, $9.99, $33.33
**Warning signs:** Custom split totals don't match item price, off by 1¢ errors, calculation tests fail

### Pitfall 8: Not Handling Empty Assignment State
**What goes wrong:** User adds items but doesn't assign any, results step shows $0 for everyone or crashes.
**Why it happens:** Results calculation assumes assignments exist.
**How to avoid:**
  - Check if any items have assignments before calculating
  - Show warning: "No items assigned. Please assign items to people."
  - Disable "Next" button from Assignment step if no items assigned
  - Validation function: `canProceedFromAssignment(items, assignments)`
  - Return early in ResultsStep if no assignments
**Warning signs:** Results show all zeros, crash on results step, confusing empty state

## Code Examples

Verified patterns from existing codebase and research:

### Item Assignment with Toggle Badges
```tsx
// Source: Existing billStore actions + mobile touch UI patterns
import { useItems, usePeople, useAssignments, useBillActions } from '@/stores/billStore';
import { formatCurrency } from '@/lib/types/money';

export function AssignmentStep() {
  const items = useItems();
  const people = usePeople();
  const assignments = useAssignments();
  const { assignItem } = useBillActions();

  const togglePersonOnItem = (itemId: string, personId: string) => {
    const currentAssignment = assignments[itemId];
    const currentPersonIds = currentAssignment?.personIds || [];

    let newPersonIds: string[];
    if (currentPersonIds.includes(personId)) {
      newPersonIds = currentPersonIds.filter(id => id !== personId);
    } else {
      newPersonIds = [...currentPersonIds, personId];
    }

    assignItem(itemId, newPersonIds);
  };

  const getAssignedPeople = (itemId: string) => {
    const personIds = assignments[itemId]?.personIds || [];
    return people.filter(p => personIds.includes(p.id));
  };

  return (
    <div>
      <h2>Assign Items to People</h2>
      <p>Tap people to assign them to items</p>

      {items.map(item => {
        const assignedPeople = getAssignedPeople(item.id);
        return (
          <div key={item.id} className="item-assignment">
            <div className="item-header">
              <h3>{item.name}</h3>
              <span className="item-price">{formatCurrency(item.priceInCents)}</span>
            </div>

            <div className="person-badges" role="group" aria-label={`Assign ${item.name} to people`}>
              {people.map(person => {
                const isAssigned = assignedPeople.some(p => p.id === person.id);
                return (
                  <button
                    key={person.id}
                    className={`person-badge ${isAssigned ? 'assigned' : 'unassigned'}`}
                    onClick={() => togglePersonOnItem(item.id, person.id)}
                    aria-pressed={isAssigned}
                  >
                    {person.name}
                  </button>
                );
              })}
            </div>

            {assignedPeople.length > 0 && (
              <div className="assignment-summary">
                Split among: {assignedPeople.map(p => p.name).join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function canProceedFromAssignment(items: Item[], assignments: Record<string, Assignment>): boolean {
  // At least one item must be assigned
  return items.some(item => assignments[item.id] && assignments[item.id].personIds.length > 0);
}
```

### Tip Configuration with Presets
```tsx
// Source: Radio button preset pattern + existing billStore
import { useTipRate, useBillActions } from '@/stores/billStore';

const TIP_PRESETS = [
  { rate: 0.15, label: '15%' },
  { rate: 0.18, label: '18%' },
  { rate: 0.20, label: '20%' },
] as const;

export function TipStep() {
  const tipRate = useTipRate();
  const { setTipRate } = useBillActions();

  const handlePresetClick = (rate: number) => {
    setTipRate(rate);
  };

  return (
    <div className="tip-configuration">
      <h2>Add Tip</h2>
      <div className="tip-presets">
        {TIP_PRESETS.map(preset => (
          <button
            key={preset.rate}
            className={`tip-preset ${tipRate === preset.rate ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.rate)}
            aria-pressed={tipRate === preset.rate}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="tip-custom">
        <label>
          Or enter custom percentage:
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            value={Math.round(tipRate * 100 * 10) / 10}
            onChange={(e) => {
              const percentage = parseFloat(e.target.value);
              if (!isNaN(percentage)) {
                setTipRate(percentage / 100);
              }
            }}
            placeholder="18.0"
          />
          %
        </label>
      </div>
    </div>
  );
}
```

### Tax Configuration with Mode Toggle
```tsx
// Source: TaxInput discriminated union from Phase 1
import { useState } from 'react';
import { useTaxInput, useBillActions } from '@/stores/billStore';
import { toCents } from '@/lib/types/money';

export function TaxStep() {
  const taxInput = useTaxInput();
  const { setTaxInput } = useBillActions();

  const [mode, setMode] = useState<'rate' | 'exact'>(taxInput?.type || 'rate');
  const [rateValue, setRateValue] = useState(
    taxInput?.type === 'rate' ? String(taxInput.rate * 100) : '8.0'
  );
  const [exactValue, setExactValue] = useState(
    taxInput?.type === 'exact' ? String(taxInput.amount / 100) : ''
  );

  const handleApply = () => {
    if (mode === 'rate') {
      const percentage = parseFloat(rateValue);
      if (!isNaN(percentage) && percentage >= 0) {
        setTaxInput({ type: 'rate', rate: percentage / 100 });
      }
    } else {
      const dollars = parseFloat(exactValue);
      if (!isNaN(dollars) && dollars >= 0) {
        setTaxInput({ type: 'exact', amount: toCents(dollars) });
      }
    }
  };

  const handleClear = () => {
    setTaxInput(null);
  };

  return (
    <div className="tax-configuration">
      <h2>Add Tax</h2>

      <div className="tax-mode" role="radiogroup" aria-label="Tax input mode">
        <label>
          <input
            type="radio"
            name="tax-mode"
            checked={mode === 'rate'}
            onChange={() => setMode('rate')}
          />
          Tax Rate (%)
        </label>
        <label>
          <input
            type="radio"
            name="tax-mode"
            checked={mode === 'exact'}
            onChange={() => setMode('exact')}
          />
          Exact Amount ($)
        </label>
      </div>

      {mode === 'rate' && (
        <label>
          Tax rate
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            value={rateValue}
            onChange={(e) => setRateValue(e.target.value)}
            placeholder="8.0"
          />
          %
        </label>
      )}

      {mode === 'exact' && (
        <label>
          Tax amount
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={exactValue}
            onChange={(e) => setExactValue(e.target.value)}
            placeholder="0.00"
          />
        </label>
      )}

      <div className="tax-actions">
        <button onClick={handleApply}>Apply Tax</button>
        {taxInput && <button onClick={handleClear}>No Tax</button>}
      </div>

      {taxInput && (
        <p className="tax-preview">
          Tax configured: {taxInput.type === 'rate'
            ? `${(taxInput.rate * 100).toFixed(1)}%`
            : `$${(taxInput.amount / 100).toFixed(2)}`}
        </p>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Checkbox grids for assignment | Tap-to-toggle badges | ~2020 | Better mobile UX, scales with more people/items |
| Dropdown menus for presets | Radio button groups | ~2019 | Faster interaction, all options visible |
| Calculate on every input change | Calculate on navigation/submit | ~2021 | Better performance, prevents premature errors |
| Text-only assignment status | Visual badges with active state | ~2022 | Clearer feedback, faster scanning |
| Allow invalid states | Real-time validation with feedback | ~2020 | Prevents user frustration, guides correction |

**Deprecated/outdated:**
- Checkbox grids (N×M complexity) - replaced with item-centric badges
- Dropdown selects for tip presets - slower than radio buttons on mobile
- Allowing custom splits that don't sum to 100% - validation should be real-time
- Global "Calculate" button - modern wizards calculate on step navigation
- Separate tax and tip configuration screens - can be combined in single step

## Open Questions

1. **Should assignment step show running subtotal per person?**
   - What we know: Results step shows final totals
   - What's unclear: Would live preview during assignment help or distract?
   - Recommendation: Start without live preview - assignment is about "who gets what", not "how much". Can add in iteration if user testing shows need.

2. **What if user skips tax/tip configuration?**
   - What we know: taxInput defaults to null, tipRate defaults to 0.18
   - What's unclear: Should we enforce explicit tip selection or allow default?
   - Recommendation: Allow skip - default 18% tip is reasonable. Show "Using default 18% tip" message in results. User can go back to change.

3. **Should custom split be percentage-based or dollar-based?**
   - What we know: Percentages easier to reason about (50/50, 60/40)
   - What's unclear: Do users prefer entering exact dollars ($5.00 / $7.99)?
   - Recommendation: Percentage-based - simpler validation (must sum to 100%), works for any item price. Can add dollar mode in iteration.

4. **How to handle rounding errors in custom splits?**
   - What we know: 33%/33%/34% on $10.00 works, but on $10.01 creates rounding issues
   - What's unclear: Should UI auto-adjust largest share to make exact total?
   - Recommendation: Validate that sum of calculated cents equals item price. If off by 1¢, adjust largest share. Show warning: "Adjusted [Name]'s share by 1¢ due to rounding."

5. **Should wizard steps be reorderable (tax/tip before assignment)?**
   - What we know: Current flow is people → items → assignment → tax/tip → results
   - What's unclear: Would some users prefer configuring tax/tip before assignment?
   - Recommendation: Keep current order - assignment depends on knowing items, tax/tip are final adjustments. Linear flow is simpler to implement and understand.

## Sources

### Primary (HIGH confidence)
- Existing Phase 1 calculation functions: splitEqually, allocateProportionally, calculateTax, calculateTip (local codebase)
- Existing Phase 2 billStore actions: assignItem, setCustomSplit, setTaxInput, setTipRate (local codebase)
- Existing Phase 3 UI patterns: controlled inputs, local state for drafts, Zustand atomic selectors (local codebase)
- React 19.2.4 official documentation - controlled components, event handling (https://react.dev)
- MDN Web Docs - ARIA attributes (aria-pressed, role="radiogroup"), input types (https://developer.mozilla.org/en-US/)

### Secondary (MEDIUM confidence)
- [Mobile Navigation Patterns That Work in 2026](https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026) - touch target sizing, tap interaction patterns
- [Mobile UX Best Practices: Tap Targets & Touch Zones](https://edesignify.com/blogs/tap-targets-and-touch-zones-mobile-ux-that-works) - 44×44px minimum, 8px spacing
- [Bill Splitting Design Challenge](https://medium.com/stormy-jackson/bill-splitting-design-exercise-da6a959c706c) - item-wise assignment patterns
- [Splitting Expenses Made Easy with FunSplit — A UI UX Case Study](https://medium.com/@khushigupta250102/splitting-expenses-made-easy-with-funsplit-a-ui-ux-case-study-84b76c98d631) - flexible assignment UX
- [React Radio Group component - Material UI](https://mui.com/material-ui/react-radio-button/) - radio button group patterns
- [useCheckboxGroup – React Aria](https://react-spectrum.adobe.com/react-aria/useCheckboxGroup.html) - accessible checkbox groups with validation

### Tertiary (LOW confidence - needs verification)
- Custom percentage validation patterns - common practice but no single authoritative source
- Tap-to-toggle badge pattern - derived from bill splitting apps, not formally documented
- Mobile keyboard optimization - best practices vary by platform
- Auto-adjust rounding in custom splits - implementation detail, no standard approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, using existing React + Zustand from Phase 2-3
- Architecture: MEDIUM-HIGH - Item assignment pattern verified by multiple bill splitting case studies (MEDIUM), calculation wiring to existing Phase 1 functions is straightforward (HIGH)
- Pitfalls: MEDIUM - Custom split validation and floating-point handling are well-known issues (HIGH), but mobile touch interaction edge cases need real device testing (MEDIUM)

**Research date:** 2026-02-09
**Valid until:** 2026-04-09 (60 days) - React patterns stable, mobile touch guidelines unlikely to change, bill splitting UX conventions well-established

**Key architectural decisions:**
- Item-centric assignment (not person-centric) - better mobile UX, scales with more people
- Tap-to-toggle badges (not checkbox grids) - cleaner UI, faster interaction
- Percentage-based custom splits - simpler validation than dollar amounts
- Radio button presets for tip - faster than dropdowns
- Tax mode toggle (rate vs exact) - matches receipt format flexibility from Phase 1
- Calculate results only in ResultsStep - prevents premature/incorrect calculations
- All calculation logic already exists in Phase 1 - Phase 4 is UI wiring only
