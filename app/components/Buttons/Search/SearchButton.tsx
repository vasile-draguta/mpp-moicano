'use client';

import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import SearchField from './SearchField';
import { getAllExpenses } from '@/app/services/expenseService';
import { SearchButtonProps } from '@/app/types/Button';

export default function SearchButton({ onSearchResults }: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    // Focus the search input after opening
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      // Reset to all expenses when closing search
      onSearchResults(getAllExpenses());
    }
  };

  // Handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        // Reset to all expenses when closing search
        onSearchResults(getAllExpenses());
      }
    }

    // Handle ESC key press
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        // Reset to all expenses when closing search
        onSearchResults(getAllExpenses());
      }
    }

    // Add event listeners if search is open
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    // Cleanup event listeners
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
