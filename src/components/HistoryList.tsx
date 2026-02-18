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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Past Splits</h2>
        <button
          className="px-3 py-2 text-sm rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors min-h-[36px]"
          onClick={onBack}
        >
          Back to Split
        </button>
      </div>

      {bills.length === 0 ? (
        <div className="text-center text-zinc-500 dark:text-zinc-400 py-8 px-4">
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
              <details key={bill.id} className="mb-2 group">
                <summary className="flex justify-between items-center min-h-[44px] px-4 py-3 cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl list-none [&::-webkit-details-marker]:hidden select-none hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <strong>{date}</strong>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatCurrency(bill.totalInCents)} • {bill.people.length} people • {bill.items.length} items
                    </div>
                  </div>
                  <button
                    className="px-2 py-1 text-xs rounded-md bg-transparent text-danger hover:bg-danger-light dark:hover:bg-danger/10 transition-colors min-h-[32px] min-w-[32px]"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(bill.id);
                    }}
                  >
                    Delete
                  </button>
                </summary>

                <div className="px-4 py-3 -mt-px border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">
                  <div>
                    <strong>Bill Breakdown:</strong>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(summary.billSubtotal)}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(summary.totalTax)}</span></div>
                    <div className="flex justify-between"><span>Tip</span><span>{formatCurrency(summary.totalTip)}</span></div>
                    <div className="flex justify-between font-bold mt-1 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                      <span>Grand Total</span><span>{formatCurrency(summary.grandTotal)}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <strong>Per Person:</strong>
                  </div>
                  {summary.personBreakdowns.map((breakdown) => (
                    <div key={breakdown.personId} className="mt-2">
                      <div className="font-medium">
                        {breakdown.personName}: {formatCurrency(breakdown.total)}
                      </div>
                      {breakdown.items.length > 0 && (
                        <ul className="ml-4 text-sm">
                          {breakdown.items.map((item) => (
                            <li key={item.itemId}>
                              {item.itemName}{' '}
                              <span className="text-zinc-500 dark:text-zinc-400">
                                {item.isCustomSplit ? '(custom)' : `(1/${item.splitCount})`}
                              </span>
                              : {formatCurrency(item.shareInCents)}
                            </li>
                          ))}
                          {breakdown.taxShare > 0 && (
                            <li className="text-zinc-500 dark:text-zinc-400">
                              Tax share: {formatCurrency(breakdown.taxShare)}
                            </li>
                          )}
                          {breakdown.tipShare > 0 && (
                            <li className="text-zinc-500 dark:text-zinc-400">
                              Tip share: {formatCurrency(breakdown.tipShare)}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}

                  {bill.taxInput && (
                    <div className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                      Tax: {bill.taxInput.type === 'rate'
                        ? `${(bill.taxInput.rate * 100).toFixed(2)}%`
                        : `$${(bill.taxInput.amount / 100).toFixed(2)}`}
                    </div>
                  )}
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Tip: {(bill.tipRate * 100).toFixed(0)}%
                  </div>
                </div>
              </details>
            );
          })}

          <button
            className={`w-full mt-4 px-4 py-3 text-sm rounded-xl transition-colors ${
              confirmingClear
                ? 'bg-danger text-white hover:bg-danger/90'
                : 'bg-zinc-100 dark:bg-zinc-800 text-danger hover:bg-danger-light dark:hover:bg-danger/10'
            }`}
            onClick={handleClearHistory}
          >
            {confirmingClear ? 'Are you sure?' : 'Clear All History'}
          </button>
        </>
      )}
    </div>
  );
}
