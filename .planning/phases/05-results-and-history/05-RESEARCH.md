# Phase 5: Results & History - Research

**Researched:** 2026-02-10
**Domain:** React state management, localStorage persistence, progressive disclosure UI
**Confidence:** HIGH

## Summary

This phase requires implementing a summary screen with expandable itemized breakdowns and persistent history storage. The technical focus is on **derived state patterns** (computing totals from existing state without storing them separately), **localStorage persistence** with FIFO limits, and **progressive disclosure UI** (accordion/expandable patterns for detailed breakdowns).

**Key architectural insight:** Since requirements specify "calculations update instantly as user changes inputs" (UX-03), totals should be **computed/derived** from store state, not stored separately. This eliminates synchronization bugs and follows React best practices for 2026.

**Primary recommendation:** Use React's derived state pattern with `useMemo` for expensive calculations, native HTML `<details>`/`<summary>` elements for progressive disclosure (zero dependencies, built-in accessibility), `useLocalStorage` custom hook for persistence with error handling, and `Intl.NumberFormat` for currency display (zero dependencies).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (existing) | 18.x | Component framework | Already in use (Phase 3) |
| Native HTML | N/A | `<details>`/`<summary>` for expandables | Built-in, accessible, zero dependencies |
| Intl API (browser) | Native | Currency & date formatting | Native browser API, zero dependencies, locale-aware |
| localStorage API | Native | Persistent history storage | Native browser API, synchronous, 5MB quota |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useMemo | React 18 | Memoize expensive calculations | Only if performance measured as bottleneck |
| useCallback | React 18 | Stabilize function references | Only if causing unnecessary re-renders |
| useEffect | React 18 | Sync state to localStorage | On history save/load operations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<details>` | Component library accordion (MUI, Radix UI) | Library adds bundle size; native element is sufficient for this use case |
| Intl.NumberFormat | currency.js, react-currency-format | Libraries add dependencies; Intl API handles all requirements |
| Custom localStorage | IndexedDB, localForage | IndexedDB is async and overkill for simple array storage |
| localStorage directly | use-local-storage-state package | Package adds dependency; custom hook is 10 lines and type-safe |

**Installation:**
```bash
# No new dependencies required - all native APIs
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── ResultsSummary.jsx     # Main summary screen
│   ├── PersonTotal.jsx         # Expandable person row with <details>
│   └── HistoryList.jsx         # Past splits list
├── hooks/
│   └── useLocalStorage.js      # Persistence hook with error handling
└── utils/
    └── formatters.js           # Currency & date formatters
```

### Pattern 1: Derived State for Real-Time Calculations

**What:** Compute totals directly from store state in component render, don't store calculated values in state
**When to use:** When calculations are cheap (<16ms) or when using useMemo for expensive ones
**Why:** Eliminates synchronization bugs, follows React best practices, ensures consistency

**Example:**
```javascript
// BAD: Storing derived state (creates sync bugs)
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]); // Easy to forget dependencies

// GOOD: Derive state during render
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0);

// BEST: Memoize only if performance issue measured
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

**Source:** [React Computed Properties](https://www.robinwieruch.de/react-computed-properties/), [Don't Sync State. Derive It!](https://kentcdodds.com/blog/dont-sync-state-derive-it)

### Pattern 2: useLocalStorage Hook with Error Handling

**What:** Custom hook that syncs state with localStorage, handles JSON serialization/errors
**When to use:** For all localStorage operations (history save/load)
**Why:** Encapsulates error handling, prevents data leaks between tests, graceful degradation

**Example:**
```javascript
// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Initialize state from localStorage or default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync to localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // Handle quota exceeded, private browsing
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      } else {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

**Source:** [Using localStorage with React Hooks](https://blog.logrocket.com/using-localstorage-react-hooks/), [Mastering State Persistence](https://www.usehooks.io/blog/mastering-persistent-state-the-uselocalstorage-hook)

### Pattern 3: Progressive Disclosure with Native `<details>`

**What:** Use HTML `<details>`/`<summary>` elements for expandable itemized breakdowns
**When to use:** For showing/hiding person-level details without JavaScript state
**Why:** Built-in accessibility, zero bundle size, native keyboard support

**Example:**
```javascript
// components/PersonTotal.jsx
function PersonTotal({ person, items, taxShare, tipShare }) {
  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)
                     + taxShare + tipShare;

  return (
    <details className="person-total">
      <summary>
        <span className="person-name">{person.name}</span>
        <span className="person-amount">{formatCurrency(totalCents)}</span>
      </summary>

      <div className="breakdown">
        <h4>Items</h4>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>{formatCurrency(item.priceCents)}</span>
            </li>
          ))}
        </ul>

        <div className="shares">
          <div>
            <span>Tax Share:</span>
            <span>{formatCurrency(taxShare)}</span>
          </div>
          <div>
            <span>Tip Share:</span>
            <span>{formatCurrency(tipShare)}</span>
          </div>
        </div>

        <div className="total">
          <strong>Total:</strong>
          <strong>{formatCurrency(totalCents)}</strong>
        </div>
      </div>
    </details>
  );
}
```

**Source:** [Progressive Disclosure - NN/G](https://www.nngroup.com/articles/progressive-disclosure/), [React Accordion component - Material UI](https://mui.com/material-ui/react-accordion/)

### Pattern 4: FIFO History Management

**What:** Store history array with fixed limit (50 items), remove oldest when full
**When to use:** When saving completed split to history
**Why:** Prevents localStorage quota errors, maintains reasonable data size

**Example:**
```javascript
// Saving to history with FIFO limit
function saveToHistory(splitData) {
  const [history, setHistory] = useLocalStorage('billSplitterHistory', []);

  const newEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...splitData
  };

  setHistory(prevHistory => {
    const updated = [newEntry, ...prevHistory];
    // Keep only last 50 entries (FIFO)
    return updated.slice(0, 50);
  });
}
```

**Source:** [localstorage-fifo package](https://www.npmjs.com/package/localstorage-fifo), [Storage quotas - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

### Pattern 5: Currency Formatting from Integer Cents

**What:** Display integer cents as currency using Intl.NumberFormat
**When to use:** Anywhere displaying monetary amounts
**Why:** Respects locale, handles symbols/decimals, zero dependencies

**Example:**
```javascript
// utils/formatters.js
export function formatCurrency(cents) {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

// Usage in component
<span>{formatCurrency(1234)} {/* Displays: $12.34 */}</span>
```

**Source:** [Simplify Currency Formatting in React](https://dev.to/josephciullo/simplify-currency-formatting-in-react-a-zero-dependency-solution-with-intl-api-3kok), [Currency handling in React](https://www.jacobparis.com/content/currency-handling)

### Pattern 6: Date Formatting for History Timestamps

**What:** Format timestamps using Intl.DateTimeFormat or relative time
**When to use:** Displaying history entries with dates
**Why:** Locale-aware, native API, no dependencies

**Example:**
```javascript
// utils/formatters.js
export function formatDate(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(timestamp);
}

// Relative time for recent entries
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}
```

**Source:** [Formatting dates in React](https://carlrippon.com/formatting-dates-and-numbers-in-react/), [React timestamp formatting](https://www.npmjs.com/package/react-timestamp)

### Anti-Patterns to Avoid

- **Storing calculated totals in state:** Causes sync bugs, violates single source of truth
- **Using useState for derived values:** Forces manual synchronization with useEffect
- **Omitting useEffect dependency array:** Causes infinite render loops
- **Passing objects/arrays as dependencies without memoization:** Creates infinite loops (reference equality)
- **Ignoring localStorage error handling:** Breaks app in private browsing/quota exceeded
- **Updating state that's in useEffect dependencies:** Classic infinite loop pattern

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Manual string manipulation with $ and decimals | `Intl.NumberFormat` | Handles locale, currency symbols, rounding, negative numbers |
| Date/time formatting | Manual date string building | `Intl.DateTimeFormat` | Handles locale, timezones, formats |
| Expandable UI | Custom JavaScript show/hide logic | Native `<details>`/`<summary>` | Built-in accessibility, keyboard support, no JS needed |
| localStorage JSON handling | Manual JSON.stringify/parse with try-catch everywhere | `useLocalStorage` hook | Encapsulates error handling, prevents code duplication |
| Unique IDs for history | `Math.random()` or timestamp-based IDs | `crypto.randomUUID()` | Native, cryptographically strong, RFC 4122 compliant |

**Key insight:** Modern browser APIs (Intl, crypto, native elements) handle 90% of common tasks better than custom solutions or libraries. Only reach for libraries when native APIs are insufficient.

## Common Pitfalls

### Pitfall 1: Infinite Render Loop from useEffect Dependencies

**What goes wrong:** useEffect updates state that's in its dependency array, triggering re-render, which triggers effect again

**Why it happens:** Missing functional setState updates, object/array reference changes

**How to avoid:**
- Use functional setState: `setValue(prev => prev + 1)` instead of `setValue(value + 1)`
- Never update a state variable that's in the dependency array without functional update
- Use `useRef` for objects that shouldn't trigger re-renders
- Use `useCallback` to stabilize function references

**Warning signs:**
- Browser freezes/becomes unresponsive
- React DevTools shows hundreds of renders
- Console floods with logs from useEffect

**Source:** [Preventing infinite re-renders](https://maxrozen.com/learn-useeffect-dependency-array-react-hooks), [Stop the Loop](https://preparefrontend.com/blog/blog/preventing-infinite-rerenders-react-guide)

### Pitfall 2: localStorage QuotaExceededError

**What goes wrong:** Saving to localStorage throws exception when 5MB limit reached

**Why it happens:** No size monitoring, no FIFO cleanup, attempting to store too much data

**How to avoid:**
- Implement FIFO cleanup (keep only last N entries)
- Wrap ALL localStorage operations in try-catch
- Calculate approximate size before saving (1 char ≈ 2 bytes in UTF-16)
- Use sessionStorage for temporary data
- Consider IndexedDB for >5MB datasets

**Warning signs:**
- `QuotaExceededError` exception
- localStorage.setItem silently fails in private browsing
- Data doesn't persist after refresh

**Source:** [localStorage Quota Exceeded Errors](https://medium.com/@zahidbashirkhan/understanding-and-resolving-localstorage-quota-exceeded-errors-5ce72b1d577a), [Storage quotas - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

### Pitfall 3: Stale Closures in useEffect

**What goes wrong:** useEffect uses old prop/state values even after they change

**Why it happens:** Missing dependencies in dependency array (ignored ESLint warnings)

**How to avoid:**
- ALWAYS include all reactive values used inside useEffect in dependency array
- Don't disable eslint-plugin-react-hooks warnings
- Use `useCallback` for stable function references
- Consider React 19's `useEffectEvent` for non-reactive callbacks

**Warning signs:**
- Effect uses old values despite state changes
- Calculations show stale data
- ESLint warning: "React Hook useEffect has a missing dependency"

**Source:** [useEffect - React Docs](https://react.dev/reference/react/useEffect), [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)

### Pitfall 4: Storing Derived State

**What goes wrong:** Storing calculated totals separately from source data causes sync bugs

**Why it happens:** Not understanding derived state pattern, premature optimization

**How to avoid:**
- Compute values during render from source state
- Only use `useMemo` if performance measured as problem (>16ms)
- Never duplicate data that can be calculated
- Follow "single source of truth" principle

**Warning signs:**
- Totals don't update when items change
- Need multiple useEffect to keep values in sync
- State updates in wrong order cause temporary incorrect values

**Source:** [Don't Sync State. Derive It!](https://kentcdodds.com/blog/dont-sync-state-derive-it), [React Computed Properties](https://www.robinwieruch.de/react-computed-properties/)

### Pitfall 5: Private Browsing Mode localStorage Failure

**What goes wrong:** localStorage operations throw exceptions in Safari/Firefox private mode

**Why it happens:** Private browsing disables persistent storage APIs

**How to avoid:**
- Always wrap localStorage in try-catch
- Provide in-memory fallback when localStorage unavailable
- Test app in private browsing mode
- Show user-friendly message when persistence fails

**Warning signs:**
- App crashes on load in private browsing
- `SecurityError: The operation is insecure` in Firefox
- localStorage.setItem succeeds but data doesn't persist

**Source:** [localStorage in JavaScript: A complete guide](https://blog.logrocket.com/localstorage-javascript-complete-guide/), [How to fix 'Failed to execute setItem on Storage'](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/)

### Pitfall 6: Missing Touch Target Size on Mobile

**What goes wrong:** Expandable summary elements too small to tap reliably on mobile

**Why it happens:** Forgetting 44px minimum touch target size requirement

**How to avoid:**
- Ensure `<summary>` elements have min-height: 44px
- Add padding to increase tappable area while keeping visual size small
- Test on actual mobile devices, not just browser DevTools
- Add 8px spacing between interactive elements

**Warning signs:**
- Users accidentally tap wrong person's total
- Difficult to expand/collapse on mobile
- Need precise tapping to hit interactive elements

**Source:** [Understanding Success Criterion 2.5.5: Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html), [Mobile-First UX Design: Best Practices for 2026](https://www.trinergydigital.com/news/mobile-first-ux-design-best-practices-in-2026)

## Code Examples

Verified patterns from official sources and research:

### Real-Time Total Calculation (Derived State)

```javascript
// components/ResultsSummary.jsx
import { useMemo } from 'react';

function ResultsSummary({ items, people, taxCents, tipCents }) {
  // Derive person totals from store state (no separate useState)
  const personTotals = useMemo(() => {
    return people.map(person => {
      // Get this person's items
      const personItems = items.filter(item =>
        item.assignedTo.includes(person.id)
      );

      // Calculate item subtotal
      const itemsSubtotal = personItems.reduce((sum, item) => {
        const splitCount = item.assignedTo.length;
        return sum + Math.floor(item.priceCents / splitCount);
      }, 0);

      // Calculate proportional tax and tip shares
      const allItemsSubtotal = items.reduce((sum, item) => sum + item.priceCents, 0);
      const proportion = itemsSubtotal / allItemsSubtotal;

      const taxShare = Math.floor(taxCents * proportion);
      const tipShare = Math.floor(tipCents * proportion);

      return {
        person,
        items: personItems,
        itemsSubtotal,
        taxShare,
        tipShare,
        total: itemsSubtotal + taxShare + tipShare
      };
    });
  }, [items, people, taxCents, tipCents]);

  return (
    <div className="results-summary">
      {personTotals.map(pt => (
        <PersonTotal key={pt.person.id} {...pt} />
      ))}
    </div>
  );
}
```

### Progressive Disclosure with Accessible HTML

```javascript
// components/PersonTotal.jsx
import { formatCurrency } from '../utils/formatters';

function PersonTotal({ person, items, itemsSubtotal, taxShare, tipShare, total }) {
  return (
    <details className="person-total">
      <summary
        className="person-total__summary"
        aria-label={`${person.name}: ${formatCurrency(total)}`}
      >
        <span className="person-total__name">{person.name}</span>
        <span className="person-total__amount">{formatCurrency(total)}</span>
      </summary>

      <div className="person-total__breakdown">
        {items.length > 0 && (
          <section>
            <h4>Items ({formatCurrency(itemsSubtotal)})</h4>
            <ul>
              {items.map(item => (
                <li key={item.id} className="breakdown-item">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.priceCents)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="shares">
          <div className="share-line">
            <span>Tax Share:</span>
            <span>{formatCurrency(taxShare)}</span>
          </div>
          <div className="share-line">
            <span>Tip Share:</span>
            <span>{formatCurrency(tipShare)}</span>
          </div>
        </section>

        <div className="total-line">
          <strong>Total Owed:</strong>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>
    </details>
  );
}
```

**CSS for mobile-first touch targets:**
```css
.person-total__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* 44px minimum touch target (WCAG) */
  min-height: 44px;
  padding: 12px 16px;

  /* Visual feedback */
  cursor: pointer;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;

  /* Prevent text selection on touch */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.person-total__summary:hover {
  background: var(--color-surface-hover);
}

.person-total__summary:active {
  transform: scale(0.98);
}

/* Spacing between interactive elements (WCAG) */
.person-total + .person-total {
  margin-top: 8px;
}
```

### History Persistence with Error Handling

```javascript
// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Consider clearing old data.');
      } else if (error.name === 'SecurityError') {
        console.warn('localStorage unavailable (private browsing?)');
      } else {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// Usage in component
function ResultsSummary() {
  const [history, setHistory] = useLocalStorage('billSplitterHistory', []);

  function saveToHistory(splitData) {
    const newEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...splitData
    };

    setHistory(prevHistory => {
      const updated = [newEntry, ...prevHistory];
      // FIFO: Keep only last 50 entries
      return updated.slice(0, 50);
    });
  }

  return (
    <div>
      <button onClick={() => saveToHistory(currentSplit)}>
        Save to History
      </button>
    </div>
  );
}
```

### History List with Date Formatting

```javascript
// components/HistoryList.jsx
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

function HistoryList({ history, onSelect }) {
  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p>No saved splits yet.</p>
        <p>Complete a split and save it to see it here.</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      <h2>Past Splits</h2>
      <ul>
        {history.map(entry => (
          <li key={entry.id} className="history-item">
            <button
              onClick={() => onSelect(entry)}
              className="history-button"
            >
              <div className="history-header">
                <span className="history-date">
                  {formatRelativeTime(entry.timestamp)}
                </span>
                <span className="history-total">
                  {formatCurrency(entry.grandTotal)}
                </span>
              </div>
              <div className="history-details">
                <span>{entry.people.length} people</span>
                <span>•</span>
                <span>{entry.items.length} items</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js for dates | Intl.DateTimeFormat | ~2020 | Native API, zero dependencies, smaller bundles |
| jQuery accordion plugins | Native `<details>`/`<summary>` | ~2020 | No JS needed, built-in accessibility |
| Zustand/Redux for local state | useState + derived values | 2024-2025 | Simpler, less boilerplate for local-only state |
| useMemo/useCallback everywhere | Only when measured bottleneck | 2025+ (React 19 compiler) | React compiler auto-memoizes, manual optimization usually premature |
| currency.js for formatting | Intl.NumberFormat | ~2021 | Native API, locale-aware, zero dependencies |
| Custom UUID generation | crypto.randomUUID() | ~2022 | Native, cryptographically strong, standards-compliant |

**Deprecated/outdated:**
- **Storing derived state:** Modern React guides emphasize computing values during render
- **useCallback/useMemo by default:** React 19 compiler makes manual memoization less necessary
- **Third-party accordion libraries:** Native `<details>` has excellent browser support (97%+)
- **localStorage without error handling:** Private browsing mode awareness is now expected

## Open Questions

1. **Should history entries be editable/deletable?**
   - What we know: Requirements mention "recall details" but not editing
   - What's unclear: User expectations for history management
   - Recommendation: Start with view-only, add delete if users request it

2. **How to handle very large bills (many people/items)?**
   - What we know: Calculations are O(n*m) for n people, m items
   - What's unclear: Performance at scale (100+ items?)
   - Recommendation: Start without virtualization, add react-window if performance issues measured

3. **Should history sync across devices?**
   - What we know: localStorage is device-local only
   - What's unclear: Whether multi-device sync is desired
   - Recommendation: Out of scope for Phase 5, potential future enhancement

4. **How to handle localStorage unavailable (private browsing)?**
   - What we know: Should degrade gracefully
   - What's unclear: Should we show warning message to user?
   - Recommendation: Silent fallback to in-memory state, optionally show info message

## Sources

### Primary (HIGH confidence)

**React Patterns & State Management:**
- [Don't Sync State. Derive It! - Kent C. Dodds](https://kentcdodds.com/blog/dont-sync-state-derive-it)
- [React Computed Properties - Robin Wieruch](https://www.robinwieruch.de/react-computed-properties/)
- [useEffect - React Official Docs](https://react.dev/reference/react/useEffect)
- [Removing Effect Dependencies - React Docs](https://react.dev/learn/removing-effect-dependencies)

**localStorage Patterns:**
- [Using localStorage with React Hooks - LogRocket](https://blog.logrocket.com/using-localstorage-react-hooks/)
- [localStorage in JavaScript: A complete guide - LogRocket](https://blog.logrocket.com/localstorage-javascript-complete-guide/)
- [Storage quotas and eviction criteria - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

**Progressive Disclosure & Accessibility:**
- [Progressive Disclosure - Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
- [Understanding Success Criterion 2.5.5: Target Size - W3C](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [React Accordion component - Material UI](https://mui.com/material-ui/react-accordion/)

**Formatting & Browser APIs:**
- [Simplify Currency Formatting in React - DEV](https://dev.to/josephciullo/simplify-currency-formatting-in-react-a-zero-dependency-solution-with-intl-api-3kok)
- [Currency handling in React - Jacob Paris](https://www.jacobparis.com/content/currency-handling)
- [Formatting dates and numbers in React - Carl Rippon](https://carlrippon.com/formatting-dates-and-numbers-in-react/)

### Secondary (MEDIUM confidence)

**State Management in 2026:**
- [React State Management in 2025: What You Actually Need](https://www.developerway.com/posts/react-state-management-2025)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [ReactJS State Management in 2025: Best Options for Scaling Apps](https://makersden.io/blog/reactjs-state-management-in-2025-best-options-for-scaling-apps)

**Performance & List Rendering:**
- [10 Proven Ways to Optimize Large List Rendering in React](https://www.fegno.com/10-proven-ways-to-optimize-large-list-rendering-in-react/)
- [React & Next.js Best Practices in 2026](https://fabwebstudio.com/blog/react-nextjs-best-practices-2026-performance-scale)
- [Rendering large lists in React: 5 methods with examples](https://blog.logrocket.com/render-large-lists-react-5-methods-examples/)

**Common Pitfalls:**
- [Preventing infinite re-renders when using useEffect and useState](https://maxrozen.com/learn-useeffect-dependency-array-react-hooks)
- [How to Prevent Infinite Loops When Using useEffect() in ReactJS](https://www.freecodecamp.org/news/prevent-infinite-loops-when-using-useeffect-in-reactjs/)
- [Understanding and Resolving LocalStorage Quota Exceeded Errors](https://medium.com/@zahidbashirkhan/understanding-and-resolving-localstorage-quota-exceeded-errors-5ce72b1d577a)

**Testing:**
- [Mocking browser APIs in Jest (localStorage, fetch and more!)](https://bholmes.dev/blog/mocking-browser-apis-fetch-localstorage-dates-the-easy-way-with-jest/)
- [jest-localstorage-mock - npm](https://www.npmjs.com/package/jest-localstorage-mock)

### Tertiary (LOW confidence - contextual support)

**Additional Patterns:**
- [localstorage-fifo - npm](https://www.npmjs.com/package/localstorage-fifo) - Demonstrates FIFO pattern
- [Mobile-First UX Design: Best Practices for 2026](https://www.trinergydigital.com/news/mobile-first-ux-design-best-practices-in-2026)
- [Progressive disclosure in UX design: Types and use cases](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All recommendations based on official React docs, MDN, and established 2026 patterns
- Architecture: HIGH - Patterns verified from official sources (React docs, MDN, W3C)
- Pitfalls: HIGH - Documented from React official docs and reputable sources (LogRocket, freeCodeCamp)
- Code examples: HIGH - Based on official APIs and best practices from authoritative sources

**Research date:** 2026-02-10
**Valid until:** ~60 days (stable domain - React fundamentals, browser APIs don't change rapidly)

**Notes:**
- No CONTEXT.md found - research covers full solution space
- All recommendations use zero external dependencies (native APIs only)
- Patterns aligned with prior decisions (integer cents architecture, mobile-first CSS, real-time updates)
- Progressive disclosure with `<details>` element has 97.6% browser support (caniuse.com)
