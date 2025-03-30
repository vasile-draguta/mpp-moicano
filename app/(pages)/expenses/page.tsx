'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import ExpensesTable from '@/app/components/ExpensesTable/ExpensesTable';
import NewExpenseButton from '@/app/components/Buttons/NewExpenseButton';
import SearchButton from '@/app/components/Buttons/Search/SearchButton';
import { Expense } from '@/app/types/Expense';

export default function Expenses() {
  const [searchResults, setSearchResults] = useState<Expense[] | null>(null);

  const handleSearchResults = useCallback((results: Expense[]) => {
    setSearchResults(results);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-300">Expenses</h1>

          <div className="flex items-center space-x-2">
            <NewExpenseButton />
            <SearchButton onSearchResults={handleSearchResults} />
          </div>
        </div>

        <hr className="my-4 border-gray-300" />

        <ExpensesTable searchResults={searchResults} />
      </ContentScreen>
    </div>
  );
}
