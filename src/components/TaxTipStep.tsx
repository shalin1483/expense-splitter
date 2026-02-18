import { useState, useEffect } from 'react';
import { useTaxInput, useTipRate, useBillActions } from '@/stores/billStore';
import { toCents } from '@/lib/types/money';
import type { TaxInput } from '@/lib/types/bill';

export function TaxTipStep() {
  const taxInput = useTaxInput();
  const tipRate = useTipRate();
  const { setTaxInput, setTipRate } = useBillActions();

  // Local state for tax inputs
  const [taxMode, setTaxMode] = useState<'rate' | 'exact'>('rate');
  const [taxRateStr, setTaxRateStr] = useState('');
  const [taxExactStr, setTaxExactStr] = useState('');

  // Local state for tip input
  const [tipPercentageStr, setTipPercentageStr] = useState('');

  // Initialize local state from store on mount
  useEffect(() => {
    if (taxInput) {
      if (taxInput.type === 'rate') {
        setTaxMode('rate');
        setTaxRateStr((taxInput.rate * 100).toString());
        setTaxExactStr('');
      } else if (taxInput.type === 'exact') {
        setTaxMode('exact');
        setTaxExactStr((taxInput.amount / 100).toFixed(2));
        setTaxRateStr('');
      }
    }

    setTipPercentageStr((tipRate * 100).toFixed(1));
  }, []);

  // Handle tax mode toggle
  const handleTaxModeChange = (mode: 'rate' | 'exact') => {
    setTaxMode(mode);
    // Clear opposite input when switching modes
    if (mode === 'rate') {
      setTaxExactStr('');
    } else {
      setTaxRateStr('');
    }
  };

  // Handle tax rate input
  const handleTaxRateChange = (value: string) => {
    setTaxRateStr(value);

    if (value.trim() === '') {
      setTaxInput(null);
      return;
    }

    const percentage = parseFloat(value);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setTaxInput({ type: 'rate', rate: percentage / 100 });
    } else if (!isNaN(percentage) && percentage < 0) {
      setTaxInput(null);
    }
  };

  // Handle tax exact amount input
  const handleTaxExactChange = (value: string) => {
    setTaxExactStr(value);

    if (value.trim() === '') {
      setTaxInput(null);
      return;
    }

    const dollars = parseFloat(value);
    if (!isNaN(dollars) && dollars >= 0) {
      setTaxInput({ type: 'exact', amount: toCents(dollars) });
    } else if (!isNaN(dollars) && dollars < 0) {
      setTaxInput(null);
    }
  };

  // Handle no tax button
  const handleNoTax = () => {
    setTaxInput(null);
    setTaxRateStr('');
    setTaxExactStr('');
  };

  // Handle tip preset selection
  const handleTipPreset = (rate: number) => {
    setTipRate(rate);
    setTipPercentageStr((rate * 100).toFixed(1));
  };

  // Handle custom tip input
  const handleCustomTipChange = (value: string) => {
    setTipPercentageStr(value);

    if (value.trim() === '') {
      // Don't clear tip rate - keep previous value
      return;
    }

    const percentage = parseFloat(value);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setTipRate(percentage / 100);
    }
  };

  // Determine which tip preset is active
  const activeTipPreset = (rate: number): boolean => {
    return Math.abs(tipRate - rate) < 0.001; // Floating point tolerance
  };

  // Generate tax preview text
  const getTaxPreview = (): string => {
    if (!taxInput) return 'No tax configured';
    if (taxInput.type === 'rate') {
      return `Tax: ${(taxInput.rate * 100).toFixed(1)}%`;
    } else {
      return `Tax: $${(taxInput.amount / 100).toFixed(2)}`;
    }
  };

  return (
    <div>
      {/* Tax Configuration Section */}
      <section className="mb-6">
        <h3 className="text-base font-semibold mb-3 text-zinc-800 dark:text-zinc-200">Tax</h3>

        <div className="flex gap-6 mb-3" role="radiogroup" aria-label="Tax input mode">
          <label className="flex items-center gap-1.5 text-[0.9375rem] text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="radio"
              name="tax-mode"
              value="rate"
              checked={taxMode === 'rate'}
              onChange={() => handleTaxModeChange('rate')}
            />
            Tax Rate (%)
          </label>
          <label className="flex items-center gap-1.5 text-[0.9375rem] text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="radio"
              name="tax-mode"
              value="exact"
              checked={taxMode === 'exact'}
              onChange={() => handleTaxModeChange('exact')}
            />
            Exact Amount ($)
          </label>
        </div>

        {taxMode === 'rate' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="100"
              placeholder="8.0"
              value={taxRateStr}
              onChange={(e) => handleTaxRateChange(e.target.value)}
              aria-label="Tax rate percentage"
              className="w-[100px] px-3 py-2 text-base border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[44px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
            <button onClick={handleNoTax} className="px-3 py-2 ml-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] transition-colors">
              No Tax
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={taxExactStr}
              onChange={(e) => handleTaxExactChange(e.target.value)}
              aria-label="Exact tax amount in dollars"
              className="w-[100px] px-3 py-2 text-base border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[44px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <button onClick={handleNoTax} className="px-3 py-2 ml-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] transition-colors">
              No Tax
            </button>
          </div>
        )}

        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{getTaxPreview()}</div>
      </section>

      {/* Tip Configuration Section */}
      <section className="mb-6">
        <h3 className="text-base font-semibold mb-3 text-zinc-800 dark:text-zinc-200">Tip</h3>

        <div className="flex gap-2 mb-3">
          <button
            className={`flex-1 py-3 text-base border-2 border-brand rounded-lg min-h-[44px] cursor-pointer text-center transition-colors ${
              activeTipPreset(0.15)
                ? 'bg-brand text-white hover:bg-brand-hover'
                : 'bg-white dark:bg-zinc-900 text-brand hover:bg-brand-light dark:hover:bg-zinc-800'
            }`}
            onClick={() => handleTipPreset(0.15)}
            aria-pressed={activeTipPreset(0.15)}
          >
            15%
          </button>
          <button
            className={`flex-1 py-3 text-base border-2 border-brand rounded-lg min-h-[44px] cursor-pointer text-center transition-colors ${
              activeTipPreset(0.18)
                ? 'bg-brand text-white hover:bg-brand-hover'
                : 'bg-white dark:bg-zinc-900 text-brand hover:bg-brand-light dark:hover:bg-zinc-800'
            }`}
            onClick={() => handleTipPreset(0.18)}
            aria-pressed={activeTipPreset(0.18)}
          >
            18%
          </button>
          <button
            className={`flex-1 py-3 text-base border-2 border-brand rounded-lg min-h-[44px] cursor-pointer text-center transition-colors ${
              activeTipPreset(0.20)
                ? 'bg-brand text-white hover:bg-brand-hover'
                : 'bg-white dark:bg-zinc-900 text-brand hover:bg-brand-light dark:hover:bg-zinc-800'
            }`}
            onClick={() => handleTipPreset(0.20)}
            aria-pressed={activeTipPreset(0.20)}
          >
            20%
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="custom-tip" className="text-sm text-zinc-700 dark:text-zinc-300">Custom tip:</label>
          <input
            id="custom-tip"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            value={tipPercentageStr}
            onChange={(e) => handleCustomTipChange(e.target.value)}
            aria-label="Custom tip percentage"
            className="w-[100px] px-3 py-2 text-base border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[44px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
        </div>
      </section>
    </div>
  );
}
