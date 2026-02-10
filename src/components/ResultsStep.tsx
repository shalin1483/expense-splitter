import { usePeople, useItems, useAssignments, useTaxInput, useTipRate } from '@/stores/billStore';
import { computePersonTotals } from '@/lib/calculations/personTotals';
import { formatCurrency } from '@/lib/types/money';

export function ResultsStep() {
  // Read all store state via selector hooks
  const people = usePeople();
  const items = useItems();
  const assignments = useAssignments();
  const taxInput = useTaxInput();
  const tipRate = useTipRate();

  // Derive totals (no useState, no useEffect -- direct computation per research guidance)
  const summary = computePersonTotals(people, items, assignments, taxInput, tipRate);

  // Check if any items are assigned
  const hasAssignments = summary.personBreakdowns.some(p => p.items.length > 0);

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
    </div>
  );
}
