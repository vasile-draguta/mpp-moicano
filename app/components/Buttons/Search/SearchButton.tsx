'use client';

import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import SearchField from './SearchField';
import { getAllExpenses } from '@/app/services/client/expenseService';
import { SearchButtonProps } from '@/app/types/Button';

export default function SearchButton({ onSearchResults }: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = async () => {
    setIsSearchOpen((prev) => !prev);

    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      const expenses = await getAllExpenses();
      onSearchResults(expenses);
    }
  };

  useEffect(() => {
    const loadAndShowExpenses = async () => {
      const expenses = await getAllExpenses();
      onSearchResults(expenses);
    };

    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        loadAndShowExpenses();
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        loadAndShowExpenses();
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchOpen, onSearchResults]);

  return (
    <div className="relative" ref={searchContainerRef}>
      <button
        className="bg-purple-300/10 hover:bg-purple-300/20 p-2 rounded-md cursor-pointer text-purple-300"
        onClick={toggleSearch}
        aria-label="Search expenses"
      >
        <Search size={20} />
      </button>

      {isSearchOpen && (
        <div className="absolute right-0 top-12 z-10 min-w-[250px] shadow-lg rounded-md overflow-hidden">
          <SearchField
            onSearchResults={onSearchResults}
            inputRef={searchInputRef}
          />
        </div>
      )}
    </div>
  );
}
