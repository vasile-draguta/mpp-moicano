'use client';

import {
  getAllExpenses,
  searchExpenses,
} from '@/app/services/client/expenseService';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { SearchFieldProps } from '@/app/types/Button';

export default function SearchField({
  onSearchResults,
  inputRef,
}: SearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = inputRef || internalInputRef;

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        const expenses = await getAllExpenses();
        onSearchResults(expenses);
        return;
      }

      const results = await searchExpenses(debouncedSearchQuery.toLowerCase());
      onSearchResults(results);
    };

    fetchResults();
  }, [debouncedSearchQuery, onSearchResults]);

  return (
    <div className="w-full bg-[#1E1E1E] p-3 rounded-md shadow-lg">
      <input
        ref={actualInputRef}
        type="text"
        className="w-full p-2 rounded-md bg-[#2A2A2A] border border-purple-300/20 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
        placeholder="Search expenses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
