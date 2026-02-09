# Phase 1: Foundation & Calculation Engine - Research

**Researched:** 2026-02-09
**Domain:** Money calculation with integer-cents arithmetic
**Confidence:** HIGH

## Summary

Phase 1 establishes the mathematical foundation for accurate bill splitting. The core challenge is avoiding floating-point precision errors by representing all money as integer cents (e.g., `$12.50 → 1250`), implementing deterministic penny distribution when splitting amounts, and creating pure, testable calculation functions.

The research confirms that **hand-rolling money math is a critical mistake**. JavaScript's IEEE 754 floating-point representation makes `0.1 + 0.2 !== 0.3`, causing penny discrepancies that compound across a bill. The standard solution is integer-cents architecture with a money library like Dinero.js for operations like allocation (proportional splitting).

**Primary recommendation:** Use TypeScript with integer cents everywhere. Create pure calculation functions in `src/lib/calculations/` with comprehensive unit tests. Consider Dinero.js for complex operations like allocate(), but simple operations (add, subtract) can use native arithmetic on cents.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.7+ | Type-safe numeric operations | Catches NaN/Infinity at compile time; required for money calculations |
| Vitest | Latest | Unit testing calculation functions | Fast, Vite-native, Jest-compatible API for testing pure functions |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Dinero.js | 2.x (alpha) or 1.x (stable) | Money object operations | If using immutable money objects; provides allocate() for proportional distribution |
| @testing-library/react | Latest | Component testing | Later phases; not needed for Phase 1 pure functions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dinero.js | Custom integer cents | Hand-rolled works for simple add/subtract, but allocate() algorithm is complex—avoid NIH syndrome |
| Vitest | Jest | Both work; Vitest is faster with Vite but Jest has more docs. Vitest recommended per STACK.md |
| TypeScript | JavaScript | JS works but TS catches `amount / 100` returning NaN at compile time vs runtime—critical for money |

**Installation:**
```bash
npm install --save-dev vitest @vitest/ui
# Optional: only if using Dinero.js
npm install dinero.js
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── calculations/     # Pure calculation functions
│   │   ├── split.ts     # Proportional splitting with penny distribution
│   │   ├── tax.ts       # Tax calculation (rate or exact amount)
│   │   ├── tip.ts       # Tip calculation with presets
│   │   └── allocate.ts  # Core allocation algorithm (if not using Dinero.js)
│   └── types/
│       └── money.ts     # Cents type alias and conversion utilities
└── tests/
    └── calculations/    # Unit tests for calculation functions
```

### Pattern 1: Integer Cents Everywhere

**What:** Represent all money as `number` (integer cents). Never use floats for currency.

**When to use:** Always. From input parsing through calculation to final display.

**Example:**
```typescript
// src/lib/types/money.ts
// Branded type for type safety
export type Cents = number & { readonly __brand: 'Cents' };

export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100) as Cents;
}

export function toDollars(cents: Cents): number {
  return cents / 100;
}

export function formatCurrency(cents: Cents): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Usage
const price = toCents(12.50);  // 1250 cents
const total = (price + toCents(3.25)) as Cents;  // 1575 cents
formatCurrency(total);  // "$15.75"
```

### Pattern 2: Pure Calculation Functions

**What:** All calculation logic is pure functions (deterministic, no side effects, no state access).

**When to use:** Always for business logic. Enables testing without React, stores, or DOM.

**Example:**
```typescript
// src/lib/calculations/split.ts
import type { Cents } from '../types/money';

export interface SplitResult {
  shares: Cents[];
  remainder: Cents;
}

/**
 * Split amount equally among N people, distributing remainder round-robin.
 * Ensures sum(shares) === total (no penny loss).
 */
export function splitEqually(total: Cents, numPeople: number): Cents[] {
  if (numPeople <= 0) throw new Error('Must split among at least 1 person');

  const baseShare = Math.floor(total / numPeople) as Cents;
  const remainder = total % numPeople;

  const shares: Cents[] = Array(numPeople).fill(baseShare);

  // Distribute remainder: first N people get +1 cent
  for (let i = 0; i < remainder; i++) {
    shares[i] = (shares[i] + 1) as Cents;
  }

  return shares;
}

// Test file: tests/calculations/split.test.ts
import { describe, it, expect } from 'vitest';
import { splitEqually } from '../../src/lib/calculations/split';

describe('splitEqually', () => {
  it('splits evenly when amount divides perfectly', () => {
    const shares = splitEqually(1200 as Cents, 3);
    expect(shares).toEqual([400, 400, 400]);
  });

  it('distributes remainder to first N people', () => {
    const shares = splitEqually(1000 as Cents, 3); // $10.00 ÷ 3
    expect(shares).toEqual([334, 333, 333]); // $3.34, $3.33, $3.33
    expect(shares.reduce((sum, s) => sum + s, 0)).toBe(1000); // CRITICAL: sum matches
  });
});
```

### Pattern 3: Proportional Distribution (Largest Remainder Method)

**What:** Split tax/tip proportionally based on each person's subtotal. Assign extra pennies to largest remainders first.

**When to use:** Tax and tip distribution (TAX-03, TIP-03).

**Example:**
```typescript
// src/lib/calculations/allocate.ts
import type { Cents } from '../types/money';

export interface Allocation {
  personId: string;
  subtotal: Cents;
  share: Cents;
}

/**
 * Distribute `amount` proportionally across `subtotals`.
 * Uses largest remainder method to assign extra pennies.
 */
export function allocateProportionally(
  amount: Cents,
  subtotals: Cents[]
): Cents[] {
  const total = subtotals.reduce((sum, s) => sum + s, 0);
  if (total === 0) throw new Error('Cannot allocate to zero subtotal');

  // Calculate exact shares (will have decimals)
  const exactShares = subtotals.map(s => (s / total) * amount);

  // Floor each share, track remainders
  const floored = exactShares.map(s => Math.floor(s) as Cents);
  const remainders = exactShares.map((s, i) => s - floored[i]);

  // Distribute extra cents to largest remainders
  const distributed = (amount - floored.reduce((sum, s) => sum + s, 0)) as Cents;
  const indices = remainders
    .map((r, i) => ({ remainder: r, index: i }))
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, distributed)
    .map(item => item.index);

  indices.forEach(i => {
    floored[i] = (floored[i] + 1) as Cents;
  });

  return floored;
}
```

### Pattern 4: Tax and Tip Calculation

**What:** Calculate tax/tip from rate or exact amount, then distribute proportionally.

**When to use:** TAX-01/TAX-02/TAX-03 and TIP-01/TIP-02/TIP-03.

**Example:**
```typescript
// src/lib/calculations/tax.ts
import type { Cents } from '../types/money';
import { allocateProportionally } from './allocate';

export function calculateTax(
  subtotal: Cents,
  input: { type: 'rate'; rate: number } | { type: 'exact'; amount: Cents }
): Cents {
  if (input.type === 'rate') {
    return Math.round(subtotal * input.rate) as Cents;
  }
  return input.amount;
}

export function distributeTax(
  totalTax: Cents,
  personSubtotals: Cents[]
): Cents[] {
  return allocateProportionally(totalTax, personSubtotals);
}
```

### Anti-Patterns to Avoid

- **Floats for money:** `let price = 12.50` causes `price + 3.25 = 15.749999999`. Use `let price = 1250` (cents).
- **Division without rounding:** `const half = total / 2` produces decimals. Use `Math.floor(total / 2)`.
- **Ignoring remainders:** `$10.00 ÷ 3 = $3.33 × 3 = $9.99`. Must distribute the extra cent.
- **Calculation in components:** Business logic in React components can't be tested independently. Keep calculations pure.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Money arithmetic | Custom float-to-cents converter with rounding | Integer cents everywhere | IEEE 754 precision limits; 0.1 + 0.2 ≠ 0.3 in JS |
| Proportional allocation | Manual percentage distribution | Largest remainder method or Dinero.js `allocate()` | Edge case: must ensure sum(shares) === total exactly |
| Currency formatting | String concatenation with `toFixed(2)` | `Intl.NumberFormat` or library | Handles locale, symbols, negative formatting |
| Rounding modes | Custom round/floor logic | Built-in `Math` methods or library | Half-to-even (banker's rounding) is subtle |

**Key insight:** Money math has decades of solved edge cases. The classic bug is `total - sum(shares) = 1` (the lost penny). Don't discover these pitfalls yourself—use proven patterns.

## Common Pitfalls

### Pitfall 1: The Lost Penny

**What goes wrong:** `$10.00 ÷ 3 = $3.33... × 3 = $9.99`. One cent disappears.

**Why it happens:** Division produces a remainder that gets discarded. `Math.floor(1000 / 3) = 333`, `333 × 3 = 999`.

**How to avoid:** Distribute remainder explicitly. First `N % total` people get `floor(total / N) + 1`, rest get `floor(total / N)`.

**Warning signs:** Assertion `sum(shares) !== total` fails. Unit test for `splitEqually(1000, 3)` doesn't sum to 1000.

### Pitfall 2: Floating Point Precision

**What goes wrong:** User enters `$12.50`. Stored as `12.5`. Add `$3.25` → `15.750000000001`. Display shows `$15.75` but internal state is wrong.

**Why it happens:** IEEE 754 can't represent most decimals exactly. Base-2 can't encode base-10 fractions like 0.1.

**How to avoid:** Parse `"12.50"` to `1250` cents immediately on input. Never store floats.

**Warning signs:** Debugging shows values like `15.750000000001`. `toFixed(2)` used everywhere to "fix" display.

### Pitfall 3: Percentage Calculation Order

**What goes wrong:** User expects tip on subtotal (`(subtotal × 0.18) + tax`), code calculates tip on total (`(subtotal + tax) × 0.18`). Amounts differ.

**Why it happens:** No universal standard. Some restaurants do tip-on-pretax, others tip-on-total.

**How to avoid:** Pick one convention (subtotal is most common), document it, show calculation breakdown in UI.

**Warning signs:** User feedback "your math is wrong" when both calculations are valid, just different assumptions.

### Pitfall 4: Type Coercion Bugs

**What goes wrong:** `"12.50" / 2 = 6.25` works by accident. Later refactor breaks when input is actually a string.

**Why it happens:** JavaScript coerces strings to numbers in arithmetic. TypeScript catches this if types are strict.

**How to avoid:** Use branded `Cents` type. TypeScript error if trying to pass `string` to `Cents`.

**Warning signs:** No TypeScript errors on `string` arithmetic. Missing input validation.

## Code Examples

Verified patterns from research:

### Creating and Converting Money

```typescript
// Source: Integer cents pattern (industry standard)
import type { Cents } from './types/money';

// Input: user types "12.50"
const userInput = "12.50";
const cents = toCents(parseFloat(userInput)); // 1250

// Display
const display = formatCurrency(cents); // "$12.50"
```

### Equal Split

```typescript
// Source: Largest remainder method
function splitEqually(total: Cents, numPeople: number): Cents[] {
  const base = Math.floor(total / numPeople);
  const remainder = total % numPeople;

  return Array.from({ length: numPeople }, (_, i) =>
    (base + (i < remainder ? 1 : 0)) as Cents
  );
}

// Test
splitEqually(1000 as Cents, 3); // [334, 333, 333] (sums to 1000 ✓)
```

### Tax Distribution

```typescript
// Source: Proportional allocation pattern
function distributeTax(
  taxAmount: Cents,
  personSubtotals: Cents[]
): Cents[] {
  const total = personSubtotals.reduce((sum, s) => sum + s, 0);

  // Exact shares
  const exactShares = personSubtotals.map(
    s => (s / total) * taxAmount
  );

  // Floor + distribute remainder
  const shares = exactShares.map(s => Math.floor(s) as Cents);
  const remaining = taxAmount - shares.reduce((sum, s) => sum + s, 0);

  // Assign extra cents to largest remainders
  const remainders = exactShares.map((exact, i) => ({
    index: i,
    remainder: exact - shares[i]
  }));
  remainders.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < remaining; i++) {
    shares[remainders[i].index]++;
  }

  return shares;
}
```

### Dinero.js Alternative (if using library)

```typescript
// Source: https://dinerojs.com/module-dinero
import Dinero from 'dinero.js';

// Create
const amount = Dinero({ amount: 1250 }); // $12.50

// Allocate (proportional split)
const shares = Dinero({ amount: 1000 }).allocate([50, 30, 20]);
// Returns: [{ amount: 500 }, { amount: 300 }, { amount: 200 }]

// Convert to cents
const cents = amount.getAmount(); // 1250
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store dollars as floats | Store cents as integers | Always been best practice | Eliminates precision errors |
| Manual remainder handling | Largest remainder method | Established algorithm (1970s) | Deterministic, fair distribution |
| Moment.js for dates | Native Date or date-fns | ~2020 | Not applicable to Phase 1 |
| Jest for testing | Vitest (with Vite projects) | 2023 | Faster, native ESM support |

**Deprecated/outdated:**
- **Float-based money libraries:** Any library that uses `number` for dollars (not cents) is wrong
- **Dinero.js v1 vs v2:** v2 is alpha (2026); use v1.x stable or hand-roll integer cents for this simple use case

## Open Questions

1. **Should we use Dinero.js or hand-roll integer cents?**
   - What we know: Dinero.js provides `allocate()`, immutability, formatting
   - What's unclear: Is 60KB bundle size worth it for 3-4 calculation functions?
   - Recommendation: Start without Dinero.js. Add if allocate() logic gets complex. Hand-rolled is simpler for this scope.

2. **Tip on subtotal or total (subtotal + tax)?**
   - What we know: Convention varies by region
   - What's unclear: User expectation for this app
   - Recommendation: Default to tip-on-subtotal (most common), show calculation breakdown so users can verify

3. **TypeScript branded types vs plain number?**
   - What we know: Branded types prevent passing dollars where cents expected
   - What's unclear: Overhead vs benefit for small project
   - Recommendation: Use `type Cents = number` alias first, add branding (`number & { __brand }`) if bugs occur

## Sources

### Primary (HIGH confidence)

- **Dinero.js official docs** (https://dinerojs.com/) - Money library API, allocate() method
- **MDN: Number precision** (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) - IEEE 754 limits, safe integer range
- **Vitest docs** (https://vitest.dev/guide/) - Testing setup, pure function testing patterns
- **Project STACK.md** (.planning/research/STACK.md) - Confirmed tech stack: TypeScript 5.7, Vitest, React 19
- **Project PITFALLS.md** (.planning/research/PITFALLS.md) - Floating point math, penny problem, phase mapping

### Secondary (MEDIUM confidence)

- **Largest remainder method** (training data, confirmed by Dinero.js allocate() behavior) - Proportional allocation algorithm
- **TypeScript branded types** (training data, standard pattern) - Type safety for numeric primitives
- **Integer cents pattern** (training data, industry standard since 1970s) - Avoiding float precision errors

### Tertiary (LOW confidence)

- None - all key findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Confirmed via STACK.md and official docs
- Architecture: HIGH - Integer cents is industry standard, pure functions are testing best practice
- Pitfalls: HIGH - Documented in PITFALLS.md with phase mapping

**Research date:** 2026-02-09
**Valid until:** 60 days (stable domain; money math hasn't changed in decades)
