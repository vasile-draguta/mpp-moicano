'use client';

import { PaginationProvider } from '@/app/context/PaginationContext';
import Pagination from '../Pagination/Pagination';
import { usePagination } from '@/app/context/PaginationContext';
import { useEffect, useState, useCallback } from 'react';
import {
  getAllExpenses,
  sortExpensesByDate,
  sortExpensesByAmount,
  getHighestSpendingCategory,
  getLowestSpendingCategory,
} from '@/app/services/expenseService';
import DeleteExpenseButton from '../Buttons/DeleteExpenseButton';
import EditExpenseButton from '../Buttons/EditExpenseButton';
import { Expense } from '@/app/types/Expense';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  SortOptions,
  ExpensesTableProps,
  ExpensesTableContentProps,
} from '@/app/types/Table';

const ExpensesTableContent = ({
  expenses,
  onRefresh,
  onSort,
  sortField,
  sortOrder,
}: ExpensesTableContentProps) => {
  const { currentPage, itemsPerPage } = usePagination();
  const [currentItems, setCurrentItems] = useState<Expense[]>([]);
  const [highestSpendingCategory, setHighestSpendingCategory] = useState<
    string | null
  >(null);
  const [lowestSpendingCategory, setLowestSpendingCategory] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Calculate pagination on the provided expenses (which may be filtered)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentItems(expenses.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, expenses]);

  // Calculate highest and lowest spending categories whenever expenses change
  useEffect(() => {
    const highestCategory = getHighestSpendingCategory(expenses);
    setHighestSpendingCategory(highestCategory);

    const lowestCategory = getLowestSpendingCategory(expenses);
    setLowestSpendingCategory(lowestCategory);
  }, [expenses]);

  const handleExpenseDeleted = () => {
    onRefresh();
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  // Handle sorting when a column header is clicked
  const handleSortClick = (field: SortOptions['field']) => {
    if (field === sortField) {
      // Toggle order if same field
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for date, ascending for amount
      const defaultOrder = field === 'date' ? 'desc' : 'asc';
      onSort(field, defaultOrder);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortOptions['field']) => {
    if (sortField !== field) return null;

    return sortOrder === 'asc' ? (
      <ArrowUp className="inline ml-1" size={16} />
    ) : (
      <ArrowDown className="inline ml-1" size={16} />
    );
  };

  return (
    <>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead className="bg-transparent">
            <tr>
              <th
                className="px-6 py-4 text-left text-lg text-gray-400 font-bold cursor-pointer hover:text-purple-300"
                onClick={() => handleSortClick('date')}
              >
                Date {renderSortIndicator('date')}
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Merchant
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Description
              </th>
              <th
                className="px-6 py-4 text-left text-lg text-gray-400 font-bold cursor-pointer hover:text-purple-300"
                onClick={() => handleSortClick('amount')}
              >
                Amount {renderSortIndicator('amount')}
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
                  <td
                    className={`px-5 py-4 ${
                      expense.category === highestSpendingCategory
                        ? 'text-[#BF415D] font-bold'
                        : expense.category === lowestSpendingCategory
                          ? 'text-purple-300 font-bold'
                          : 'text-gray-300'
                    }`}
                  >
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

export default function ExpensesTable({ searchResults }: ExpensesTableProps) {
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortField, setSortField] = useState<SortOptions['field']>(null);
  const [sortOrder, setSortOrder] = useState<SortOptions['order']>('desc');

  // Fetch and sort expenses
  useEffect(() => {
    let expenses: Expense[];

    if (searchResults) {
      // Use search results if provided
      expenses = [...searchResults];
    } else {
      // Otherwise use all expenses
      expenses = getAllExpenses();
    }

    // Apply sorting if a sort field is selected
    if (sortField === 'date') {
      expenses = sortExpensesByDate(expenses);
      // Reverse if ascending order is selected
      if (sortOrder === 'asc') {
        expenses = expenses.reverse();
      }
    } else if (sortField === 'amount') {
      expenses = sortExpensesByAmount(expenses);
      // Reverse if descending order is selected
      if (sortOrder === 'desc') {
        expenses = expenses.reverse();
      }
    }

    setFilteredExpenses(expenses);
  }, [searchResults, refreshTrigger, sortField, sortOrder]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handle sorting
  const handleSort = useCallback(
    (field: SortOptions['field'], order: SortOptions['order']) => {
      setSortField(field);
      setSortOrder(order);
    },
    [],
  );

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
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      </PaginationProvider>
    </div>
  );
}
