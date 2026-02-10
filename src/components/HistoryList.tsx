import { useState } from 'react';
import { useSavedBills, useHistoryActions } from '@/stores/historyStore';
import { formatCurrency } from '@/lib/types/money';
import { computePersonTotals } from '@/lib/calculations/personTotals';

interface HistoryListProps {
  onBack: () => void;
}

export function HistoryList({ onBack }: HistoryListProps) {
  const bills = useSavedBills();
  const { deleteBill, clearHistory } = useHistoryActions();
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleDelete = (id: string) => {
    deleteBill(id);
  };

  const handleClearHistory = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      setTimeout(() => setConfirmingClear(false), 3000);
    } else {
      clearHistory();
      setConfirmingClear(false);
    }
  };

  return (
    <div className="history-list">
      <div className="history-header">
        <h2>Past Splits</h2>
        <button onClick={onBack}>Back to Split</button>
      </div>

      {bills.length === 0 ? (
        <div className="history-empty">
          No saved splits yet. Complete a split and save it to see it here.
        </div>
      ) : (
        <>
          {bills.map((bill) => {
            const date = new Intl.DateTimeFormat('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(bill.timestamp);

            // Recompute breakdown for expandable view
            const summary = computePersonTotals(
              bill.people,
              bill.items,
              bill.assignments,
              bill.taxInput,
              bill.tipRate
            );

            return (
              <details key={bill.id} className="history-item">
                <summary className="history-item__summary">
                  <div>
                    <div className="history-meta">
                      <strong>{date}</strong>
                    </div>
                    <div className="history-meta">
                      {formatCurrency(bill.totalInCents)} • {bill.people.length} people • {bill.items.length} items
                    </div>
                  </div>
                  <button
                    className="history-delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(bill.id);
                    }}
                  >
                    Delete
                  </button>
                </summary>

                <div className="history-item__details">
                  <div>
                    <strong>Bill Breakdown:</strong>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    Subtotal: {formatCurrency(summary.billSubtotal)}
                  </div>
                  <div>Tax: {formatCurrency(summary.totalTax)}</div>
                  <div>Tip: {formatCurrency(summary.totalTip)}</div>
                  <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                    Grand Total: {formatCurrency(summary.grandTotal)}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <strong>Per Person:</strong>
                  </div>
                  {summary.personBreakdowns.map((breakdown) => (
                    <div key={breakdown.personId} style={{ marginTop: '8px' }}>
                      <div style={{ fontWeight: '500' }}>
                        {breakdown.personName}: {formatCurrency(breakdown.total)}
                      </div>
                      {breakdown.items.length > 0 && (
                        <ul style={{ marginLeft: '16px', fontSize: '0.875rem' }}>
                          {breakdown.items.map((item) => (
                            <li key={item.itemId}>
                              {item.itemName}{' '}
                              <span style={{ color: '#666' }}>
                                {item.isCustomSplit ? '(custom)' : `(1/${item.splitCount})`}
                              </span>
                              : {formatCurrency(item.shareInCents)}
                            </li>
                          ))}
                          {breakdown.taxShare > 0 && (
                            <li style={{ color: '#666' }}>
                              Tax share: {formatCurrency(breakdown.taxShare)}
                            </li>
                          )}
                          {breakdown.tipShare > 0 && (
                            <li style={{ color: '#666' }}>
                              Tip share: {formatCurrency(breakdown.tipShare)}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}

                  {bill.taxInput && (
                    <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#666' }}>
                      Tax: {bill.taxInput.type === 'rate'
                        ? `${(bill.taxInput.rate * 100).toFixed(2)}%`
                        : `$${(bill.taxInput.amount / 100).toFixed(2)}`}
                    </div>
                  )}
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Tip: {(bill.tipRate * 100).toFixed(0)}%
                  </div>
                </div>
              </details>
            );
          })}

          <button
            className={`clear-history-btn ${confirmingClear ? 'confirming' : ''}`}
            onClick={handleClearHistory}
          >
            {confirmingClear ? 'Are you sure?' : 'Clear All History'}
          </button>
        </>
      )}
    </div>
  );
}
