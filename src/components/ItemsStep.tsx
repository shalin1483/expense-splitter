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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name (e.g., Caesar Salad)"
          autoFocus
          required
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
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id} className="item-row">
            <span>{item.name}</span>
            <span className="item-price">{formatCurrency(item.priceInCents)}</span>
            <button
              className="remove-btn"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="items-total">
          Total: {formatCurrency(total)}
        </div>
      )}
    </div>
  );
}

export function canProceedFromItems(items: Item[]): boolean {
  return items.length >= 1;
}
