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
    <div className="tax-tip-step">
      {/* Tax Configuration Section */}
      <section>
        <h3>Tax</h3>

        <div className="tax-mode" role="radiogroup" aria-label="Tax input mode">
          <label>
            <input
              type="radio"
              name="tax-mode"
              value="rate"
              checked={taxMode === 'rate'}
              onChange={() => handleTaxModeChange('rate')}
            />
            Tax Rate (%)
          </label>
          <label>
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
          <div className="tax-input-row">
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
            />
            <span className="input-suffix">%</span>
            <button onClick={handleNoTax} className="no-tax-btn">
              No Tax
            </button>
          </div>
        ) : (
          <div className="tax-input-row">
            <span className="input-suffix">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={taxExactStr}
              onChange={(e) => handleTaxExactChange(e.target.value)}
              aria-label="Exact tax amount in dollars"
            />
            <button onClick={handleNoTax} className="no-tax-btn">
              No Tax
            </button>
          </div>
        )}

        <div className="tax-preview">{getTaxPreview()}</div>
      </section>

      {/* Tip Configuration Section */}
      <section>
        <h3>Tip</h3>

        <div className="tip-presets">
          <button
            className={`tip-preset ${activeTipPreset(0.15) ? 'active' : ''}`}
            onClick={() => handleTipPreset(0.15)}
            aria-pressed={activeTipPreset(0.15)}
          >
            15%
          </button>
          <button
            className={`tip-preset ${activeTipPreset(0.18) ? 'active' : ''}`}
            onClick={() => handleTipPreset(0.18)}
            aria-pressed={activeTipPreset(0.18)}
          >
            18%
          </button>
          <button
            className={`tip-preset ${activeTipPreset(0.20) ? 'active' : ''}`}
            onClick={() => handleTipPreset(0.20)}
            aria-pressed={activeTipPreset(0.20)}
          >
            20%
          </button>
        </div>

        <div className="tip-input-row">
          <label htmlFor="custom-tip">Custom tip:</label>
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
          />
          <span className="input-suffix">%</span>
        </div>
      </section>
    </div>
  );
}
