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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          autoFocus
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <span>{person.name}</span>
            <button
              className="remove-btn"
              onClick={() => removePerson(person.id)}
              aria-label={`Remove ${person.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="validation">
        <p className="status" role="status">
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
