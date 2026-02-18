# Expense Splitter

A mobile-first restaurant bill splitter that accurately divides a bill — including shared items, tax, and tip — so everyone pays exactly their fair share.

## Features

- **5-step wizard flow** — People → Items → Assign → Tax/Tip → Results
- **Flexible item assignment** — assign items to one or multiple people, with equal split by default or custom percentages
- **Tax & tip options** — enter tax as a percentage rate or exact dollar amount; choose tip from presets (15/18/20%) or custom
- **Itemized breakdown** — expandable per-person view showing items, tax share, and tip share
- **Save to history** — save completed splits and recall them later
- **Dark mode** — toggle between light and dark themes, persists across sessions
- **Mobile-optimized** — 44px touch targets, decimal keyboard on mobile, usable at the dinner table

## Tech Stack

- **React 19** + TypeScript + Vite
- **Tailwind CSS v4** with shadcn/ui (new-york style)
- **Zustand** for state management with localStorage persistence
- **motion** (Framer Motion) for wizard step animations
- **sonner** for toast notifications
- **Vitest** for testing (160 tests)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Running Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── BillWizard.tsx    # 5-step wizard shell with animations
│   ├── PeopleStep.tsx    # Add/remove people
│   ├── ItemsStep.tsx     # Add items with prices
│   ├── AssignmentStep.tsx # Assign items to people
│   ├── TaxTipStep.tsx    # Tax and tip entry
│   ├── ResultsStep.tsx   # Final totals + save to history
│   └── HistoryList.tsx   # Past splits
├── hooks/
│   └── useDarkMode.ts    # Dark mode with localStorage persistence
├── lib/
│   ├── calculations/     # Pure money math (integer cents)
│   └── types/            # TypeScript types
└── stores/
    ├── billStore.ts      # Active bill state
    └── historyStore.ts   # Saved splits history
```

## Key Design Decisions

- **Integer cents math** throughout — eliminates floating-point precision errors
- **Largest remainder method** for penny distribution — mathematically fairest allocation
- **Proportional tax/tip distribution** — each person's share based on their item subtotal
- **No backend** — everything runs locally in the browser with localStorage
