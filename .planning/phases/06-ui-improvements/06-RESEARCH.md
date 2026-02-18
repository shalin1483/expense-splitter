# Phase 6: UI Improvements - Research

**Researched:** 2026-02-18
**Domain:** React UI polish — Tailwind CSS v4, shadcn/ui, dark mode, micro-animations
**Confidence:** HIGH (core stack verified against official docs), MEDIUM (design heuristics)

---

## Summary

The existing Expense Splitter app is fully functional with ~680 lines of plain CSS. The v2 UI improvement goal is to upgrade to a modern, polished, mobile-first design with dark mode support. The app already uses React 19 + Vite + TypeScript + Zustand, and already has the `@` path alias configured in both `tsconfig.json` and `vite.config.ts`, which significantly reduces setup friction.

The 2025/2026 standard React UI stack is **Tailwind CSS v4 + shadcn/ui (new-york style)**. shadcn/ui copies component source into the project (zero runtime overhead), is built on Radix UI primitives for accessibility, and as of February 2025 fully supports React 19 and Tailwind v4. The existing plain CSS in `App.css` should be **replaced** by Tailwind utility classes incrementally, component by component.

Dark mode is implemented with a CSS custom-variant in Tailwind v4 (the `@custom-variant dark` directive) combined with a `.dark` class toggled on `<html>`. This is stored in `localStorage` and initialized from `prefers-color-scheme`, with no flash on load. Step transition animations use `motion` (the rebranded Framer Motion package), which weighs ~4.6 KB with `LazyMotion`. Toast notifications for save confirmations use `sonner` (2–3 KB, adopted by shadcn/ui officially).

**Primary recommendation:** Install Tailwind CSS v4 + shadcn/ui on top of existing Vite setup, migrate CSS component-by-component, add dark mode via Tailwind `@custom-variant`, add step slide animations with `motion`, and fire save confirmations with `sonner`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | v4.x | Utility-first CSS framework | JIT, CSS-first config, no PostCSS required, 5x faster builds vs v3 |
| @tailwindcss/vite | v4.x | Vite plugin for Tailwind v4 | Official Vite integration, replaces PostCSS setup entirely |
| shadcn/ui | latest (CLI) | Component collection (copy-paste) | Built on Radix UI, Tailwind styled, React 19 + Tailwind v4 compatible as of Feb 2025 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion | v11.x | React animations (fka Framer Motion) | Wizard step transitions, badge tap feedback, expand/collapse |
| sonner | ^1.x | Toast notifications | Save-to-history confirmation, success/error states |
| lucide-react | latest | Icon set used by shadcn/ui | Installed automatically via shadcn CLI, use for chevrons, check marks, etc. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Mantine v7 | Mantine is a full component library (npm dep). Heavier but includes more out-of-box. Overkill here. |
| shadcn/ui | Chakra UI | Similar to Mantine. Not zero-runtime. Higher bundle cost. |
| shadcn/ui | Radix UI (direct) | Radix is the unstyled layer shadcn/ui builds on. Requires hand-styling everything. |
| motion | CSS transitions only | CSS is fine for simple fades. Motion adds directional slide-in/out for wizard steps and spring physics. Use CSS for trivial hovers, motion for wizard transitions. |
| sonner | react-hot-toast | react-hot-toast is 5 KB, sonner is 2–3 KB. Sonner auto dark-mode, adopted by shadcn/ui as official toast. |
| Tailwind dark: classes | CSS custom properties only | Both work. Tailwind `dark:` is more ergonomic in JSX. CSS custom properties are best as the underlying token layer. Use both together. |

**Installation (full stack):**
```bash
npm install tailwindcss @tailwindcss/vite
npm install motion sonner
npm install -D @types/node
npx shadcn@latest init
```

Then add individual shadcn components as needed:
```bash
npx shadcn@latest add button card badge progress
npx shadcn@latest add sonner
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ui/               # shadcn/ui generated components (owned by project)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── sonner.tsx
│   ├── BillWizard.tsx    # Unchanged import, CSS → Tailwind classes
│   ├── PeopleStep.tsx
│   ├── ItemsStep.tsx
│   ├── AssignmentStep.tsx
│   ├── TaxTipStep.tsx
│   ├── ResultsStep.tsx
│   └── HistoryList.tsx
├── hooks/
│   └── useDarkMode.ts    # theme toggle + localStorage + prefers-color-scheme
├── App.css               # Replaced: keep only @import "tailwindcss" + @custom-variant + @theme
└── App.tsx               # Add dark mode toggle button
```

### Pattern 1: Tailwind v4 CSS-First Configuration

**What:** All configuration lives in CSS using `@theme` directive. No `tailwind.config.ts` file needed.
**When to use:** All new Tailwind v4 projects. For this app, define brand colors as OKLCH values in `App.css`.

```css
/* src/App.css — replaces all existing CSS */
@import "tailwindcss";

/* Dark mode via .dark class on <html> */
@custom-variant dark (&:where(.dark, .dark *));

/* Brand design tokens */
@theme {
  --color-brand: oklch(0.524 0.204 264.3);      /* #2563eb equivalent */
  --color-brand-hover: oklch(0.455 0.212 264.2); /* #1d4ed8 equivalent */
  --color-success: oklch(0.510 0.141 147.1);     /* #16a34a equivalent */
  --color-danger: oklch(0.537 0.224 27.4);       /* #dc2626 equivalent */

  /* Dark mode surface tokens (reference in dark: classes) */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Source:** Official Tailwind CSS v4 docs — https://tailwindcss.com/docs/theme

### Pattern 2: shadcn/ui Component Usage

**What:** shadcn/ui copies component source into `src/components/ui/`. You own the files and customize them freely. Never modify via npm — edit the source directly.
**When to use:** For all interactive primitives (Button, Card, Badge, Progress indicator).

```tsx
// Source: https://ui.shadcn.com/docs/components/card
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

// Person result card
<Card className="mb-2">
  <CardHeader>
    <CardTitle className="text-base">{person.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="font-semibold tabular-nums">${formatCents(total)}</p>
  </CardContent>
</Card>
```

### Pattern 3: Dark Mode Toggle — useDarkMode Hook

**What:** A custom hook that reads from `localStorage`, falls back to `prefers-color-scheme`, and toggles `.dark` on `<html>`. No external library needed.
**When to use:** Add this hook before writing any dark: classes.

```tsx
// src/hooks/useDarkMode.ts
// Pattern: localStorage + prefers-color-scheme + .dark class on <html>
// Source: https://blog.logrocket.com/dark-mode-react-in-depth-guide/
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  // 1. Check stored preference
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  // 2. Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, toggle };
}
```

**Important:** Call `getInitialTheme()` as a state initializer (not inside useEffect) to prevent flash of wrong theme on first render.

### Pattern 4: Wizard Step Transitions with motion

**What:** Use `motion` (npm package, formerly Framer Motion) with `AnimatePresence` to animate wizard steps sliding in/out based on direction.
**When to use:** The BillWizard step transition — forward slides left-to-right, back slides right-to-left.

```tsx
// Source: https://motion.dev/docs/react-animate-presence
// npm install motion
import { motion, AnimatePresence } from "motion/react";

// Track direction in BillWizard
const [direction, setDirection] = useState<1 | -1>(1);

const handleNext = () => { setDirection(1); /* ... advance step */ };
const handleBack = () => { setDirection(-1); /* ... retreat step */ };

const variants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    {/* current step component */}
  </motion.div>
</AnimatePresence>
```

**Bundle note:** Full `motion` package is ~34 KB. For this small app, use full import. If bundle size becomes a concern, use `LazyMotion` with `domAnimation` feature set to reduce to ~15 KB.

### Pattern 5: Step Progress Bar

**What:** Replace the plain text "Step N of 5" with a visual progress bar using shadcn/ui `Progress` component.
**When to use:** BillWizard.tsx progress indicator.

```tsx
// Source: https://ui.shadcn.com/docs/components/radix/progress
import { Progress } from "@/components/ui/progress";

// In BillWizard:
const progressValue = ((currentIndex + 1) / STEPS.length) * 100;

<div className="mb-4">
  <div className="flex justify-between text-sm text-muted-foreground mb-1">
    <span>{stepLabels[currentStep]}</span>
    <span>{currentIndex + 1} / {STEPS.length}</span>
  </div>
  <Progress value={progressValue} className="h-1.5" />
</div>
```

### Pattern 6: Sonner Toast for Save Confirmation

**What:** Replace any inline "saved" state feedback with a toast notification.
**When to use:** ResultsStep "Save to History" button confirmation.

```tsx
// Source: https://github.com/emilkowalski/sonner
// npm install sonner  (or: npx shadcn@latest add sonner)
import { Toaster, toast } from "sonner";

// In App.tsx root — add once:
<Toaster position="bottom-center" />

// In ResultsStep.tsx — on save action:
toast.success("Split saved to history!");
```

### Anti-Patterns to Avoid

- **Keeping App.css as a global override file alongside Tailwind:** Creates specificity wars. Once you add `@import "tailwindcss"`, delete all non-token CSS from App.css. Move component styles to Tailwind classes in JSX.
- **Using @apply liberally:** The Tailwind v4 team and community discourage `@apply`. Extract to React components instead of CSS abstractions.
- **Animating layout-heavy properties (width, height, top, left):** These trigger layout recalculation. Animate `transform` and `opacity` only. Motion's default transitions already do this.
- **Setting dark mode colors on every element individually:** Use the CSS custom properties layer. Define `--background`, `--foreground`, `--card`, `--muted` tokens in `:root` and `.dark`, then reference them via Tailwind's theme. shadcn/ui generates this pattern automatically on `init`.
- **Using multiple React re-renders to manage theme:** The `useDarkMode` hook above toggles a class on `<html>` — no React re-renders cascade through the component tree.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast/save feedback | Custom "saved" boolean state + conditional text | sonner | Handles queuing, dismiss timing, accessibility announcements, dark mode auto-styling |
| Wizard step animation | CSS keyframe `@keyframes stepSlide` | motion (AnimatePresence) | Exit animations require knowing when element leaves DOM — CSS can't do this without JS hacks |
| Dark mode persistence | Manual localStorage read/write in every component | useDarkMode hook + Tailwind `dark:` | One hook manages system preference + stored preference + flash prevention |
| Progress indicator | `<div style={{ width: `${pct}%` }}>` | shadcn/ui Progress | Radix UI Progress includes ARIA `role="progressbar"` and `aria-valuenow` accessibility |
| Interactive badges/chips | Custom toggle logic + border manipulation | Tailwind `data-[state=active]:` or cn() | Consistent state-driven styling without conditional className concatenation |
| Icon set | SVG inline or custom icons | lucide-react (bundled with shadcn/ui) | Consistent stroke width, tree-shakeable, already a peer dep of shadcn/ui |

**Key insight:** The most dangerous hand-roll zone is exit animations. CSS transitions cannot animate removal from the DOM. Every "fade out on close" hand-roll requires setting display/visibility manually, which breaks animation. `AnimatePresence` from motion solves this declaratively.

---

## Common Pitfalls

### Pitfall 1: CSS Specificity Conflict During Migration

**What goes wrong:** Existing `.person-badge { border: 2px solid #2563eb }` overrides Tailwind utility class `border-brand` because the selector is more specific.
**Why it happens:** Plain CSS classes are still in the cascade alongside Tailwind utilities.
**How to avoid:** Migrate one component at a time. Delete all CSS for a component before adding Tailwind classes. Don't leave partial CSS files.
**Warning signs:** Tailwind classes appear in DevTools but are not applied; a plain CSS class is shown as winning specificity.

### Pitfall 2: Dark Mode Flash on Initial Load

**What goes wrong:** Page loads with light mode visibly, then flips to dark mode after React hydrates.
**Why it happens:** React reads `localStorage` in `useEffect` (runs after paint), so first paint uses default light mode.
**How to avoid:** Initialize state with a function passed to `useState` (not inside `useEffect`): `useState(getInitialTheme)`. The initializer runs synchronously before first render.
**Warning signs:** Visible white flash when refreshing in dark mode.

### Pitfall 3: Tailwind v4 Class Name Changes

**What goes wrong:** `shadow-sm` produces slightly different values in v4 vs v3; some baseline spacing values changed.
**Why it happens:** Tailwind v4 refined some default values during the v3 → v4 migration.
**How to avoid:** Start fresh with v4 rather than migrating from v3. Since this project has no v3 Tailwind, this is not a concern — install v4 directly.
**Warning signs:** N/A for new installs.

### Pitfall 4: shadcn/ui Peer Dependency Warnings with npm

**What goes wrong:** `npm install` during `npx shadcn@latest init` shows peer dependency warnings for React 19.
**Why it happens:** Some Radix UI packages haven't updated their peer dep declaration to include React 19 yet.
**How to avoid:** Use `--force` flag when prompted by the shadcn CLI, or use `pnpm`/`bun` which handle peer deps more gracefully.
**Warning signs:** `npm ERR! peer dep missing` during init. The CLI will prompt you automatically.

### Pitfall 5: motion Package Name Changed

**What goes wrong:** Installing `framer-motion` and importing from `framer-motion` works but uses the legacy package.
**Why it happens:** Framer Motion was rebranded to Motion in 2025. The new package is `motion` and import path is `motion/react`.
**How to avoid:** Install `motion`, import from `motion/react`.

```bash
# Correct
npm install motion

# Import
import { motion, AnimatePresence } from "motion/react";
```

**Warning signs:** You have `framer-motion` in package.json instead of `motion`. Both work, but `motion` is the maintained forward path.

### Pitfall 6: Animating the Wrong CSS Properties on Mobile

**What goes wrong:** Animating `left`, `top`, `width`, `height` causes 60fps drops on mobile devices.
**Why it happens:** These properties trigger layout recalculation on every frame.
**How to avoid:** Only animate `transform` (translate, scale) and `opacity`. Motion's defaults use `transform: translateX()` which runs on the compositor thread.
**Warning signs:** Animation looks choppy on a real device but smooth in Chrome DevTools.

### Pitfall 7: Tailwind ESLint Plugin Not Compatible with v4

**What goes wrong:** `eslint-plugin-tailwindcss` throws errors or fails silently after upgrading to Tailwind v4.
**Why it happens:** The ESLint plugin has not been updated for Tailwind v4's CSS-first configuration as of February 2026.
**How to avoid:** Remove or disable `eslint-plugin-tailwindcss` if present. The Prettier plugin (`prettier-plugin-tailwindcss`) does support v4 and can be used for class sorting.
**Warning signs:** ESLint errors about unknown Tailwind config file or broken class ordering.

---

## Code Examples

### Setting Up Vite Config for Tailwind v4

```typescript
// vite.config.ts — add tailwindcss plugin
// Source: https://tailwindcss.com/docs/installation/using-vite
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';   // NEW
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // NEW — replaces any PostCSS config
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  }
});
```

### App.css After Migration (Minimal)

```css
/* src/App.css — stripped to tokens only */
/* Source: https://tailwindcss.com/docs/dark-mode */
@import "tailwindcss";

/* Enable .dark class-based dark mode */
@custom-variant dark (&:where(.dark, .dark *));

/* Brand tokens — auto-generates bg-brand, text-brand, border-brand utilities */
@theme {
  --color-brand: oklch(0.524 0.204 264.3);        /* blue-600 */
  --color-brand-hover: oklch(0.455 0.212 264.2);  /* blue-700 */
  --color-success: oklch(0.510 0.141 147.1);       /* green-600 */
  --color-danger: oklch(0.537 0.224 27.4);         /* red-600 */
}

/* Base layer: body defaults */
@layer base {
  body {
    @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
    padding: 16px;
  }
}
```

### Before/After: Person Badge (AssignmentStep)

```tsx
// BEFORE — plain CSS class names
<button
  className={`person-badge ${isAssigned ? 'assigned' : ''}`}
  onClick={() => toggle(person.id)}
>
  {person.name}
</button>

// AFTER — Tailwind utility classes
<button
  className={cn(
    "px-4 py-2 rounded-full text-sm min-h-[44px] border-2 transition-colors",
    "border-brand text-brand",
    "hover:bg-brand/10",
    isAssigned && "bg-brand text-white hover:bg-brand-hover"
  )}
  onClick={() => toggle(person.id)}
>
  {person.name}
</button>
```

Note: `cn()` is the class merging utility installed by shadcn/ui at `@/lib/utils`.

### Before/After: Results Card (ResultsStep)

```tsx
// BEFORE — details/summary with CSS classes
<details className="person-total">
  <summary className="person-total__summary">
    <span className="person-total__name">{person.name}</span>
    <span className="person-total__amount">{formatCents(total)}</span>
  </summary>
  <div className="person-total__breakdown">...</div>
</details>

// AFTER — shadcn/ui Card with Tailwind
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card
  className="mb-2 cursor-pointer"
  onClick={() => toggleExpanded(person.id)}
>
  <CardHeader className="flex-row items-center justify-between py-3 px-4">
    <CardTitle className="text-base font-medium">{person.name}</CardTitle>
    <div className="flex items-center gap-2">
      <span className="font-semibold tabular-nums">{formatCents(total)}</span>
      <ChevronDown
        className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
      />
    </div>
  </CardHeader>
  {expanded && (
    <CardContent className="pt-0 text-sm text-muted-foreground">
      ...breakdown rows...
    </CardContent>
  )}
</Card>
```

### Dark Mode Token Pattern (shadcn/ui auto-generates this)

```css
/* Generated by shadcn init — src/index.css or App.css */
@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --border: oklch(0.922 0 0);
  }

  .dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --border: oklch(1 0 0 / 10%);
  }
}
```

---

## High-Impact Changes

Ranked by **impact / effort ratio** for a utility app like this:

| Rank | Change | Effort | Impact | Notes |
|------|--------|--------|--------|-------|
| 1 | **Dark mode** | Medium | Very High | ENH-02 requirement; direct UX need for restaurant use |
| 2 | **Card surfaces for result cards** | Low | High | Elevated surface (shadow + rounded-xl) makes results scannable |
| 3 | **Progress bar** replacing text "Step N of 5" | Very Low | High | Immediate visual indication of task completion |
| 4 | **Tip preset button visual state** | Very Low | Medium | Already has .active — just needs rounding + better selected state |
| 5 | **Consistent spacing system** | Medium | Medium | Tailwind 4px grid eliminates visual inconsistency |
| 6 | **Wizard step transition animation** | Low | Medium | Slide direction tells user if moving forward/back |
| 7 | **Touch feedback on interactive elements** | Very Low | Medium | `active:scale-95` on badges and buttons for tap confirmation |
| 8 | **Empty state illustrations** | Low | Low-Medium | "No history yet" and "No items assigned" states |
| 9 | **Save to history toast** | Very Low | Low | Replaces button state text with toast notification |
| 10 | **Header elevation / sticky** | Low | Low | Position: sticky + shadow-sm for scroll context |

**Top 3 are the highest priority.** Dark mode is a stated requirement. Card surfaces and a progress bar are the highest-ratio visual improvements for the least code change.

---

## Dark Mode Strategy

**Approach: Tailwind v4 `@custom-variant dark` + `.dark` class on `<html>` + `useDarkMode` hook**

This is the recommended pattern for React SPAs in 2025/2026 per the Tailwind v4 docs and multiple verified sources.

### Why This Approach

- **No flash:** Initializing theme state synchronously (not in `useEffect`) prevents a white flash before dark mode activates.
- **System preference respected:** Falls back to `prefers-color-scheme: dark` if no stored preference.
- **User override preserved:** Stored in `localStorage` under key `'theme'`.
- **Tailwind-native:** The `dark:` class prefix works out of the box once `@custom-variant dark` is configured.
- **shadcn/ui compatible:** shadcn/ui components use `dark:` classes internally; they work automatically once `.dark` is on `<html>`.

### Color Values for Expense Splitter Dark Mode

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | white / oklch(1 0 0) | oklch(0.145 0 0) ≈ gray-950 | Body, page background |
| `--card` | white | oklch(0.205 0 0) ≈ gray-900 | Card surfaces |
| `--foreground` | oklch(0.145 0 0) ≈ gray-950 | oklch(0.985 0 0) ≈ white | Primary text |
| `--muted-foreground` | gray-500 | gray-400 | Secondary text (labels, hints) |
| `--border` | gray-200 | oklch(1 0 0 / 10%) | Borders, dividers |
| `--brand` (custom) | blue-600 | blue-400 (lighter for dark bg) | Primary action color |

### Implementation Steps

1. Run `npx shadcn@latest init` — it generates the full token set in `src/index.css` automatically.
2. Add `@custom-variant dark (&:where(.dark, .dark *));` to the CSS file.
3. Add `useDarkMode` hook to `src/hooks/useDarkMode.ts`.
4. Wire toggle button into `App.tsx` header.
5. Use `dark:` class variants on components that need custom dark overrides beyond shadcn/ui defaults.

### Dark Mode for Restaurant Context

The restaurant use case (dim lighting, quick glances) means dark mode should use:
- **Higher contrast** text on dark surfaces (avoid mid-gray on dark-gray)
- **Blue-400 instead of blue-600** for primary action buttons (blue-600 is too dim on dark bg)
- **Slightly elevated card surfaces** (gray-900 not black) to preserve card hierarchy

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PostCSS config for Tailwind | `@tailwindcss/vite` plugin, zero PostCSS | Tailwind v4 (Jan 2025) | Simpler Vite setup, faster builds |
| `tailwind.config.ts` | `@theme {}` in CSS | Tailwind v4 (Jan 2025) | All config in CSS, no JS config file needed |
| `tailwindcss-animate` | `tw-animate-css` | Feb 2025 (shadcn/ui) | New projects get tw-animate-css by default |
| `framer-motion` npm package | `motion` npm package, import from `motion/react` | Feb 2025 (rebranding) | Lighter package, same API |
| shadcn/ui toast component | sonner | Feb 2025 (deprecation) | Officially deprecated in shadcn/ui; use sonner |
| `forwardRef` in shadcn/ui components | Direct ref prop (React 19) | Feb 2025 | React 19 makes forwardRef unnecessary |
| HSL colors in shadcn/ui | OKLCH colors | Feb 2025 | Better color consistency, wider gamut |
| `default` style in shadcn/ui | `new-york` style | Feb 2025 | Default deprecated; new-york is the recommended style |

**Deprecated/outdated:**
- `toast` component from shadcn/ui: Replaced by `sonner` — do not add the old toast component.
- `tailwindcss-animate`: Use `tw-animate-css` instead — shadcn CLI installs it automatically.
- `framer-motion` package: Still works but `motion` is the maintained package going forward.

---

## Open Questions

1. **Whether to use `<details>/<summary>` or controlled state for expandable cards**
   - What we know: Current app uses native `<details>/<summary>` which can't be animated smoothly with CSS (open/close is instant). Motion can animate controlled state expansion.
   - What's unclear: Whether the accessibility trade-off of native `<details>` vs a controlled `div` matters for this app.
   - Recommendation: Switch to controlled state (`useState` per card) to enable `AnimatePresence` height animations. Use `aria-expanded` to maintain accessibility.

2. **Whether to migrate all 680 lines of CSS at once or incrementally**
   - What we know: Incremental migration is safer and recommended by industry practitioners.
   - What's unclear: Whether leaving some plain CSS alongside Tailwind is maintainable long-term.
   - Recommendation: Migrate component-by-component. Delete all CSS for a component before adding Tailwind classes. Do NOT leave both CSS and Tailwind classes in parallel.

3. **shadcn/ui `new-york` vs `default` style**
   - What we know: shadcn/ui deprecated the `default` style in Feb 2025. New projects use `new-york`.
   - What's unclear: Visual differences matter — `new-york` has sharper corners (`rounded-md` instead of `rounded-lg`), which affects card appearance.
   - Recommendation: Use `new-york`. It's the modern default. Adjust individual corner radii via `className` overrides if needed.

---

## Sources

### Primary (HIGH confidence)

- https://tailwindcss.com/docs/installation/using-vite — Official Tailwind v4 Vite installation
- https://tailwindcss.com/docs/dark-mode — `@custom-variant dark` syntax verified
- https://tailwindcss.com/docs/theme — `@theme` directive and OKLCH configuration verified
- https://ui.shadcn.com/docs/installation/vite — Official shadcn/ui Vite setup steps
- https://ui.shadcn.com/docs/tailwind-v4 — shadcn/ui Tailwind v4 breaking changes (Feb 2025)
- https://ui.shadcn.com/docs/changelog/2025-02-tailwind-v4 — Component updates, toast deprecation, OKLCH migration
- https://ui.shadcn.com/docs/components/radix/progress — Progress component API
- https://ui.shadcn.com/docs/components/card — Card component API and subcomponents

### Secondary (MEDIUM confidence)

- https://motion.dev/docs/react-animate-presence — AnimatePresence React API (verified via multiple WebSearch results)
- https://github.com/emilkowalski/sonner — Sonner toast library (verified, ~2–3 KB, adopted by shadcn/ui)
- https://blog.logrocket.com/dark-mode-react-in-depth-guide/ — Dark mode hook pattern (verified against official Tailwind docs)
- https://motion.dev — `npm install motion`, import from `motion/react` (verified via multiple sources)

### Tertiary (LOW confidence)

- Various Medium articles on migration strategy — consulted for pitfall patterns but not individually verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Tailwind v4 + shadcn/ui verified against official docs; React 19 compatibility confirmed
- Architecture patterns: HIGH — vite.config pattern, @custom-variant syntax verified against official Tailwind docs
- Dark mode strategy: HIGH — `@custom-variant dark` syntax verified against https://tailwindcss.com/docs/dark-mode
- Animation approach: MEDIUM — motion package name and import path verified via WebSearch; WebFetch could not access motion.dev docs pages
- High-impact ranking: MEDIUM — based on design heuristics and UX research; not empirically validated for this specific app
- Pitfalls: HIGH for migration/specificity (well-documented); MEDIUM for others

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (Tailwind and shadcn/ui change fast; re-verify if > 30 days)
