import { useState } from 'react';
import { useItems, usePeople, useAssignments, useBillActions } from '@/stores/billStore';
import type { Item, Assignment, Person } from '@/lib/types/bill';
import { formatCurrency } from '@/lib/types/money';
import type { Cents } from '@/lib/types/money';
import './AssignmentStep.css';

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
          <div key={item.id} className="item-assignment">
            {/* Item header */}
            <div className="item-header">
              <span className="item-name">{item.name}</span>
              <span className="item-price">{formatCurrency(item.priceInCents)}</span>
            </div>

            {/* Person badges */}
            <div
              className="person-badges"
              role="group"
              aria-label={`Assign ${item.name} to people`}
            >
              {people.map((person) => {
                const isAssigned = assignedPersonIds.includes(person.id);
                return (
                  <button
                    key={person.id}
                    className={`person-badge ${isAssigned ? 'assigned' : 'unassigned'}`}
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
              <div className="assignment-summary">
                {!hasCustomSplit && assignedPersonIds.length === 1 && (
                  <span className="split-info">
                    Assigned to {people.find(p => p.id === assignedPersonIds[0])?.name}
                  </span>
                )}
                {!hasCustomSplit && assignedPersonIds.length >= 2 && (
                  <>
                    <span className="split-info">
                      Split equally among {assignedPersonIds.map(id => people.find(p => p.id === id)?.name).join(', ')}
                    </span>
                    {!isEditingThisItem && (
                      <button
                        className="custom-split-btn"
                        onClick={() => setEditingCustomSplitItemId(item.id)}
                      >
                        Custom Split
                      </button>
                    )}
                  </>
                )}
                {hasCustomSplit && (
                  <>
                    <span className="split-info custom">Custom split applied</span>
                    <button
                      className="revert-btn"
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
    <div className="custom-split-editor">
      <h4 className="editor-title">Custom Split</h4>

      {assignedPeople.map(person => (
        <div key={person.id} className="split-input-row">
          <label htmlFor={`split-${itemId}-${person.id}`} className="person-label">
            {person.name}
          </label>
          <div className="percentage-input-group">
            <input
              id={`split-${itemId}-${person.id}`}
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentages[person.id] || 0}
              onChange={(e) => handlePercentageChange(person.id, e.target.value)}
              className="percentage-input"
            />
            <span className="percentage-symbol">%</span>
          </div>
        </div>
      ))}

      <div className={`split-total ${isValid ? 'valid' : 'invalid'}`}>
        Total: {totalPercentage}%
      </div>

      <div className="editor-actions">
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!isValid} className="save-btn">
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
