'use client';

import { PaginationProvider } from '@/app/context/PaginationContext';
import Pagination from '../Pagination/Pagination';
import { usePagination } from '@/app/context/PaginationContext';
import { useEffect, useState, useCallback } from 'react';
import { getAllExpenses } from '@/app/services/expenseService';
import DeleteExpenseButton from '../Buttons/DeleteExpenseButton';
import EditExpenseButton from '../Buttons/EditExpenseButton';
import { Expense } from '@/app/types/Expense';

interface ExpensesTableContentProps {
  expenses: Expense[];
  onRefresh: () => void;
}

const ExpensesTableContent = ({
  expenses,
  onRefresh,
}: ExpensesTableContentProps) => {
  const { currentPage, itemsPerPage } = usePagination();
  const [currentItems, setCurrentItems] = useState<Expense[]>([]);

  useEffect(() => {
    // Calculate pagination on the provided expenses (which may be filtered)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentItems(expenses.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, expenses]);

  const handleExpenseDeleted = () => {
    onRefresh();
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Date
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Merchant
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Description
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Category
              </th>
              <th className="px-6 py-4 text-right text-lg text-gray-400 font-bold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((expense, index) => (
                <tr
                  key={expense.id}
                  className={`${
                    index % 2 === 0 ? 'bg-[#1E1E1E]' : 'bg-[#878585]/50'
                  } transition-colors hover:bg-purple-300/20`}
                >
                  <td className="px-5 py-4 text-gray-300">{expense.date}</td>
                  <td className="px-5 py-4 text-gray-300">
                    {expense.merchant}
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    {expense.description}
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    {formatter.format(expense.amount)}
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    {expense.category}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <EditExpenseButton expenseId={expense.id} />
                      <DeleteExpenseButton
                        expenseId={expense.id}
                        onDelete={handleExpenseDeleted}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-4 text-center text-gray-300">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination />
    </>
  );
};

interface ExpensesTableProps {
  searchResults: Expense[] | null;
}

export default function ExpensesTable({ searchResults }: ExpensesTableProps) {
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (searchResults) {
      // Use search results if provided
      setFilteredExpenses(searchResults);
    } else {
      // Otherwise use all expenses
      const expenses = getAllExpenses();
      setFilteredExpenses(expenses);
    }
  }, [searchResults, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Refresh when a new expense is added
  useEffect(() => {
    // Set up event listener for when navigation occurs
    // (like when returning from the new expense page)
    const handleRouteChange = () => {
      handleRefresh();
    };

    window.addEventListener('focus', handleRouteChange);
    return () => {
      window.removeEventListener('focus', handleRouteChange);
    };
  }, [handleRefresh]);

  return (
    <div className="w-full">
      <PaginationProvider
        totalItems={filteredExpenses.length}
        itemsPerPage={10}
        initialPage={1}
      >
        <ExpensesTableContent
          expenses={filteredExpenses}
          onRefresh={handleRefresh}
        />
      </PaginationProvider>
    </div>
  );
}
