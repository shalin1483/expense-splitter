import { useState } from 'react';
import { useItems, useBillActions } from '@/stores/billStore';
import type { Item } from '@/lib/types/bill';
import { formatCurrency } from '@/lib/types/money';

export function ItemsStep() {
  const [itemName, setItemName] = useState('');
  const [priceString, setPriceString] = useState('');
  const items = useItems();
  const { addItem, removeItem } = useBillActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = itemName.trim();
    const priceNum = parseFloat(priceString);

    // Validate inputs
    if (!trimmedName || isNaN(priceNum) || priceNum <= 0) return;

    // Convert dollars to cents with Math.round to avoid floating-point errors
    const priceInCents = Math.round(priceNum * 100);

    addItem(trimmedName, priceInCents);
    setItemName('');
    setPriceString('');
  };

  // Calculate total if items exist
  const total = items.reduce((sum, item) => sum + item.priceInCents, 0);

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name (e.g., Caesar Salad)"
          autoFocus
          required
          className="flex-1 px-3 py-3 text-base border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[44px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={priceString}
          onChange={(e) => setPriceString(e.target.value)}
          placeholder="0.00"
          required
          className="w-28 px-3 py-3 text-base border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[44px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-mono"
        />
        <button
          type="submit"
          className="px-4 py-3 text-base rounded-md bg-brand text-white hover:bg-brand-hover min-h-[44px] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <ul className="list-none p-0 m-0">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2 items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="flex-1 text-zinc-900 dark:text-zinc-50">{item.name}</span>
            <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{formatCurrency(item.priceInCents)}</span>
            <button
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name}`}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md bg-transparent text-danger hover:bg-danger-light dark:hover:bg-danger/10 transition-colors text-xl"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="text-right font-semibold mt-2 pt-2 border-t border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50">
          Total: {formatCurrency(total)}
        </div>
      )}
    </div>
  );
}

export function canProceedFromItems(items: Item[]): boolean {
  return items.length >= 1;
}
