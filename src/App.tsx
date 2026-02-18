import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from 'sonner';
import { BillWizard } from './components/BillWizard';
import { HistoryList } from './components/HistoryList';
import { useDarkMode } from './hooks/useDarkMode';

export default function App() {
  const [view, setView] = useState<'wizard' | 'history'>('wizard');
  const { theme, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-[480px] mx-auto px-4 py-4">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Expense Splitter</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'wizard' ? 'history' : 'wizard')}
              className="text-sm px-3 py-2 border border-brand text-brand rounded-md hover:bg-brand-light dark:hover:bg-zinc-800 transition-colors min-h-[36px]"
            >
              {view === 'wizard' ? 'History' : 'Back to Split'}
            </button>
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {view === 'wizard' && <BillWizard />}
        {view === 'history' && <HistoryList onBack={() => setView('wizard')} />}
      </div>

      <Toaster position="bottom-center" richColors />
    </div>
  );
}
