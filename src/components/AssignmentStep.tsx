import { useState } from 'react';
import { useItems, usePeople, useAssignments, useBillActions } from '@/stores/billStore';
import type { Item, Assignment, Person } from '@/lib/types/bill';
import { formatCurrency } from '@/lib/types/money';
import type { Cents } from '@/lib/types/money';

export function AssignmentStep() {
  const items = useItems();
  const people = usePeople();
  const assignments = useAssignments();
  const { assignItem, setCustomSplit, clearCustomSplit } = useBillActions();
  const [editingCustomSplitItemId, setEditingCustomSplitItemId] = useState<string | null>(null);

  const togglePersonOnItem = (itemId: string, personId: string) => {
    const assignment = assignments[itemId];
    const currentPersonIds = assignment?.personIds || [];

    let newPersonIds: string[];
    if (currentPersonIds.includes(personId)) {
      // Remove person
      newPersonIds = currentPersonIds.filter(id => id !== personId);
    } else {
      // Add person
      newPersonIds = [...currentPersonIds, personId];
    }

    assignItem(itemId, newPersonIds);
  };

  const handleCustomSplitSave = (itemId: string, customSplit: Array<{ personId: string; amountInCents: Cents }>) => {
    setCustomSplit(itemId, customSplit);
    setEditingCustomSplitItemId(null);
  };

  const handleCustomSplitCancel = () => {
    setEditingCustomSplitItemId(null);
  };

  const handleRevertToEqual = (itemId: string) => {
    clearCustomSplit(itemId);
  };

  return (
    <div>
      {items.map((item) => {
        const assignment = assignments[item.id];
        const assignedPersonIds = assignment?.personIds || [];
        const hasCustomSplit = assignment?.customSplit !== undefined;
        const isEditingThisItem = editingCustomSplitItemId === item.id;

        return (
          <div key={item.id} className="mb-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
            {/* Item header */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.name}</span>
              <span className="text-sm font-mono tabular-nums text-zinc-600 dark:text-zinc-400">{formatCurrency(item.priceInCents)}</span>
            </div>

            {/* Person badges */}
            <div
              className="flex flex-wrap gap-2 mt-2"
              role="group"
              aria-label={`Assign ${item.name} to people`}
            >
              {people.map((person) => {
                const isAssigned = assignedPersonIds.includes(person.id);
                return (
                  <button
                    key={person.id}
                    className={`px-4 py-2 rounded-full text-sm min-h-[44px] border-2 border-brand cursor-pointer flex items-center transition-colors active:scale-95 ${
                      isAssigned
                        ? 'bg-brand text-white hover:bg-brand-hover'
                        : 'bg-white dark:bg-zinc-900 text-brand hover:bg-brand-light dark:hover:bg-zinc-800'
                    }`}
                    aria-pressed={isAssigned}
                    onClick={() => togglePersonOnItem(item.id, person.id)}
                  >
                    {person.name}
                  </button>
                );
              })}
            </div>

            {/* Assignment summary and custom split controls */}
            {assignedPersonIds.length > 0 && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 flex items-center gap-2 flex-wrap">
                {!hasCustomSplit && assignedPersonIds.length === 1 && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Assigned to {people.find(p => p.id === assignedPersonIds[0])?.name}
                  </span>
                )}
                {!hasCustomSplit && assignedPersonIds.length >= 2 && (
                  <>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Split equally among {assignedPersonIds.map(id => people.find(p => p.id === id)?.name).join(', ')}
                    </span>
                    {!isEditingThisItem && (
                      <button
                        className="text-sm px-3 py-1.5 min-h-[32px] rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        onClick={() => setEditingCustomSplitItemId(item.id)}
                      >
                        Custom Split
                      </button>
                    )}
                  </>
                )}
                {hasCustomSplit && (
                  <>
                    <span className="text-sm text-brand font-medium">Custom split applied</span>
                    <button
                      className="text-sm px-3 py-1.5 min-h-[32px] rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      onClick={() => handleRevertToEqual(item.id)}
                    >
                      Revert to equal
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Custom split editor */}
            {isEditingThisItem && assignedPersonIds.length >= 2 && (
              <div className="mt-2">
                <CustomSplitEditor
                  itemId={item.id}
                  itemPriceInCents={item.priceInCents}
                  assignedPeople={assignedPersonIds.map(id => {
                    const person = people.find(p => p.id === id);
                    return { id, name: person?.name || 'Unknown' };
                  })}
                  onSave={(customSplit) => handleCustomSplitSave(item.id, customSplit)}
                  onCancel={handleCustomSplitCancel}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CustomSplitEditorProps {
  itemId: string;
  itemPriceInCents: Cents;
  assignedPeople: Array<{ id: string; name: string }>;
  onSave: (customSplit: Array<{ personId: string; amountInCents: Cents }>) => void;
  onCancel: () => void;
}

function CustomSplitEditor({ itemId, itemPriceInCents, assignedPeople, onSave, onCancel }: CustomSplitEditorProps) {
  // Initialize with equal split percentages
  const equalPercentage = Math.floor(100 / assignedPeople.length);
  const remainder = 100 - (equalPercentage * assignedPeople.length);

  const initialPercentages: Record<string, number> = {};
  assignedPeople.forEach((person, index) => {
    // Give the remainder to the first person
    initialPercentages[person.id] = equalPercentage + (index === 0 ? remainder : 0);
  });

  const [percentages, setPercentages] = useState<Record<string, number>>(initialPercentages);

  const handlePercentageChange = (personId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setPercentages({ ...percentages, [personId]: 0 });
    } else {
      setPercentages({ ...percentages, [personId]: Math.max(0, Math.min(100, numValue)) });
    }
  };

  // Calculate total percentage
  const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + p, 0);
  const isValid = totalPercentage === 100;

  const handleSave = () => {
    if (!isValid) return;

    // Convert percentages to cents amounts
    const customSplit = assignedPeople.map(person => {
      const percentage = percentages[person.id] || 0;
      const amountInCents = Math.round((itemPriceInCents * percentage) / 100);
      return { personId: person.id, amountInCents };
    });

    // Check if sum matches item price (handle rounding errors)
    const totalCents = customSplit.reduce((sum, split) => sum + split.amountInCents, 0);
    const difference = itemPriceInCents - totalCents;

    if (difference !== 0) {
      // Find the person with the largest percentage and adjust their amount
      const largestSplit = customSplit.reduce((max, split) => {
        const currentPercentage = percentages[split.personId] || 0;
        const maxPercentage = percentages[max.personId] || 0;
        return currentPercentage > maxPercentage ? split : max;
      });

      largestSplit.amountInCents += difference;
    }

    onSave(customSplit);
  };

  return (
    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md">
      <h4 className="text-base font-medium mb-3 text-zinc-900 dark:text-zinc-50">Custom Split</h4>

      {assignedPeople.map(person => (
        <div key={person.id} className="flex justify-between items-center mb-2">
          <label htmlFor={`split-${itemId}-${person.id}`} className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
            {person.name}
          </label>
          <div className="flex items-center gap-1">
            <input
              id={`split-${itemId}-${person.id}`}
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentages[person.id] || 0}
              onChange={(e) => handlePercentageChange(person.id, e.target.value)}
              className="w-[70px] px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[36px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
          </div>
        </div>
      ))}

      <div className={`mt-3 mb-3 font-medium text-center p-2 rounded-md ${
        isValid
          ? 'text-success bg-success-light dark:bg-success/10'
          : 'text-danger bg-danger-light dark:bg-danger/10'
      }`}>
        Total: {totalPercentage}%
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="min-w-[80px] px-4 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!isValid} className="min-w-[80px] px-4 py-2 rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}

export function canProceedFromAssignment(items: Item[], assignments: Record<string, Assignment>): boolean {
  // At least one item must be assigned to at least one person
  for (const itemId in assignments) {
    const assignment = assignments[itemId];
    if (assignment.personIds.length > 0) {
      return true;
    }
  }
  return false;
}
