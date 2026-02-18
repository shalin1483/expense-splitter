import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
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
    toast.success('Split saved to history!', { duration: 2500 });
  };

  // Handle new split
  const handleNewSplit = () => {
    billActions.reset();
  };

  if (!hasAssignments) {
    return (
      <div>
        <div className="text-center text-zinc-500 dark:text-zinc-400 py-8 px-4">
          Assign items to people to see the breakdown
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Bill overview header */}
      <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
        <div className="flex justify-between py-1 text-[0.9375rem] text-zinc-700 dark:text-zinc-300">
          <span>Subtotal:</span>
          <span>{formatCurrency(summary.billSubtotal)}</span>
        </div>
        <div className="flex justify-between py-1 text-[0.9375rem] text-zinc-700 dark:text-zinc-300">
          <span>Tax:</span>
          <span>{formatCurrency(summary.totalTax)}</span>
        </div>
        <div className="flex justify-between py-1 text-[0.9375rem] text-zinc-700 dark:text-zinc-300">
          <span>Tip:</span>
          <span>{formatCurrency(summary.totalTip)}</span>
        </div>
        <div className="flex justify-between pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700 font-bold text-lg text-zinc-900 dark:text-zinc-50">
          <span>Grand Total:</span>
          <span>{formatCurrency(summary.grandTotal)}</span>
        </div>
      </div>

      {/* Per-person breakdowns */}
      {summary.personBreakdowns.map((breakdown) => (
        <details key={breakdown.personId} className="mb-2 group">
          <summary className="flex justify-between items-center min-h-[44px] px-4 py-3 cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl list-none [&::-webkit-details-marker]:hidden select-none">
            <div className="flex items-center gap-2">
              <ChevronRight size={14} className="text-zinc-400 transition-transform group-open:rotate-90" />
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{breakdown.personName}</span>
            </div>
            <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{formatCurrency(breakdown.total)}</span>
          </summary>

          <div className="px-4 py-3 -mt-px border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl bg-zinc-50 dark:bg-zinc-800">
            {/* Items list */}
            {breakdown.items.map((item) => (
              <div key={item.itemId} className="flex justify-between py-1 text-sm text-zinc-700 dark:text-zinc-300">
                <span>
                  {item.itemName}{' '}
                  <span className="text-zinc-400 dark:text-zinc-500 text-xs ml-1">
                    {item.isCustomSplit ? '(custom)' : `(1/${item.splitCount})`}
                  </span>
                </span>
                <span>{formatCurrency(item.shareInCents)}</span>
              </div>
            ))}

            {/* Tax share */}
            {breakdown.taxShare > 0 && (
              <div className="flex justify-between py-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span>Tax share:</span>
                <span>{formatCurrency(breakdown.taxShare)}</span>
              </div>
            )}

            {/* Tip share */}
            {breakdown.tipShare > 0 && (
              <div className="flex justify-between py-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span>Tip share:</span>
                <span>{formatCurrency(breakdown.tipShare)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-zinc-50">
              <span>Total:</span>
              <span>{formatCurrency(breakdown.total)}</span>
            </div>
          </div>
        </details>
      ))}

      {/* Save and New Split actions */}
      <div className="flex gap-3 mt-6">
        <button
          className="flex-1 px-4 py-3 text-base rounded-xl bg-success text-white hover:bg-success/90 transition-colors active:scale-95"
          onClick={handleSaveToHistory}
        >
          Save to History
        </button>
        <button
          className="flex-1 px-4 py-3 text-base rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95"
          onClick={handleNewSplit}
        >
          New Split
        </button>
      </div>
    </div>
  );
}
