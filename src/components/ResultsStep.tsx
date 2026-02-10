import { useState } from 'react';
import { usePeople, useItems, useAssignments, useTaxInput, useTipRate, useBillActions } from '@/stores/billStore';
import { useHistoryActions } from '@/stores/historyStore';
import { computePersonTotals } from '@/lib/calculations/personTotals';
import { formatCurrency } from '@/lib/types/money';

export function ResultsStep() {
  // Read all store state via selector hooks
  const people = usePeople();
  const items = useItems();
  const assignments = useAssignments();
  const taxInput = useTaxInput();
  const tipRate = useTipRate();
  const billActions = useBillActions();
  const historyActions = useHistoryActions();

  // State for save button feedback
  const [isSaved, setIsSaved] = useState(false);

  // Derive totals (no useState, no useEffect -- direct computation per research guidance)
  const summary = computePersonTotals(people, items, assignments, taxInput, tipRate);

  // Check if any items are assigned
  const hasAssignments = summary.personBreakdowns.some(p => p.items.length > 0);

  // Handle save to history
  const handleSaveToHistory = () => {
    const billData = {
      people,
      items,
      assignments,
      taxInput,
      tipRate,
      totalInCents: summary.grandTotal,
    };
    historyActions.saveBill(billData);

    // Show feedback
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Handle new split
  const handleNewSplit = () => {
    billActions.reset();
  };

  if (!hasAssignments) {
    return (
      <div className="results-step">
        <div className="results-empty">
          Assign items to people to see the breakdown
        </div>
      </div>
    );
  }

  return (
    <div className="results-step">
      {/* Bill overview header */}
      <div className="bill-overview">
        <div className="overview-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(summary.billSubtotal)}</span>
        </div>
        <div className="overview-row">
          <span>Tax:</span>
          <span>{formatCurrency(summary.totalTax)}</span>
        </div>
        <div className="overview-row">
          <span>Tip:</span>
          <span>{formatCurrency(summary.totalTip)}</span>
        </div>
        <div className="overview-row grand-total">
          <span>Grand Total:</span>
          <span>{formatCurrency(summary.grandTotal)}</span>
        </div>
      </div>

      {/* Per-person breakdowns */}
      {summary.personBreakdowns.map((breakdown) => (
        <details key={breakdown.personId} className="person-total">
          <summary className="person-total__summary">
            <span className="person-total__name">{breakdown.personName}</span>
            <span className="person-total__amount">{formatCurrency(breakdown.total)}</span>
          </summary>

          <div className="person-total__breakdown">
            {/* Items list */}
            {breakdown.items.map((item) => (
              <div key={item.itemId} className="breakdown-item">
                <span>
                  {item.itemName}{' '}
                  <span className="split-indicator">
                    {item.isCustomSplit ? '(custom)' : `(1/${item.splitCount})`}
                  </span>
                </span>
                <span>{formatCurrency(item.shareInCents)}</span>
              </div>
            ))}

            {/* Tax share */}
            {breakdown.taxShare > 0 && (
              <div className="share-line">
                <span>Tax share:</span>
                <span>{formatCurrency(breakdown.taxShare)}</span>
              </div>
            )}

            {/* Tip share */}
            {breakdown.tipShare > 0 && (
              <div className="share-line">
                <span>Tip share:</span>
                <span>{formatCurrency(breakdown.tipShare)}</span>
              </div>
            )}

            {/* Total */}
            <div className="total-line">
              <span>Total:</span>
              <span>{formatCurrency(breakdown.total)}</span>
            </div>
          </div>
        </details>
      ))}

      {/* Save and New Split actions */}
      <div className="results-actions">
        <button
          className={`save-history-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveToHistory}
          disabled={isSaved}
        >
          {isSaved ? 'Saved!' : 'Save to History'}
        </button>
        <button className="new-split-btn" onClick={handleNewSplit}>
          New Split
        </button>
      </div>
    </div>
  );
}
