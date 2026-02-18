import { useState } from 'react';
import { usePeople, useBillActions } from '@/stores/billStore';
import type { Person } from '@/lib/types/bill';

export function PeopleStep() {
  const [name, setName] = useState('');
  const people = usePeople();
  const { addPerson, removePerson } = useBillActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addPerson(trimmedName);
    setName('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          autoFocus
          className="flex-1 px-3 py-3 text-base border border-zinc-300 dark:border-zinc-600 rounded-md min-h-[44px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-3 text-base rounded-md bg-brand text-white hover:bg-brand-hover min-h-[44px] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <ul className="list-none p-0 m-0 space-y-0">
        {people.map((person) => (
          <li key={person.id} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span>{person.name}</span>
            <button
              onClick={() => removePerson(person.id)}
              aria-label={`Remove ${person.name}`}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md bg-transparent text-danger hover:bg-danger-light dark:hover:bg-danger/10 transition-colors text-xl"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="text-center mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        <p role="status">
          {people.length === 0 && 'Add at least 2 people to continue'}
          {people.length === 1 && 'Add 1 more person to continue'}
          {people.length >= 2 && `${people.length} people added`}
        </p>
      </div>
    </div>
  );
}

export function canProceedFromPeople(people: Person[]): boolean {
  return people.length >= 2;
}
