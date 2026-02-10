import { useState } from 'react';
import { BillWizard } from './components/BillWizard';
import { HistoryList } from './components/HistoryList';

export default function App() {
  const [view, setView] = useState<'wizard' | 'history'>('wizard');

  return (
    <main>
      <header>
        <h1>Expense Splitter</h1>
        <button
          className="history-toggle"
          onClick={() => setView(view === 'wizard' ? 'history' : 'wizard')}
        >
          {view === 'wizard' ? 'History' : 'Back to Split'}
        </button>
      </header>
      {view === 'wizard' && <BillWizard />}
      {view === 'history' && <HistoryList onBack={() => setView('wizard')} />}
    </main>
  );
}
