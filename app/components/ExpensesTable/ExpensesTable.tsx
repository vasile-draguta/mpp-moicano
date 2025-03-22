'use client';

import { PaginationProvider } from '@/app/context/PaginationContext';
import Pagination from '../Pagination/Pagination';
import { usePagination } from '@/app/context/PaginationContext';
import { useEffect, useState } from 'react';
import {
  getAllExpenses,
  getPaginatedExpenses,
} from '@/app/services/expenseService';
import DeleteExpenseButton from '../Buttons/DeleteExpenseButton';
import EditExpenseButton from '../Buttons/EditExpenseButton';
import { Expense } from '@/app/types/Expense';

const ExpensesTableContent = () => {
  const { currentPage, itemsPerPage } = usePagination();
  const [currentItems, setCurrentItems] = useState<Expense[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const { data } = getPaginatedExpenses(currentPage, itemsPerPage);
    setCurrentItems(data);
  }, [currentPage, itemsPerPage, refreshTrigger]);

  const handleExpenseDeleted = () => {
    // Trigger a refresh of the data
    setRefreshTrigger((prev) => prev + 1);
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
            {currentItems.map((expense, index) => (
              <tr
                key={expense.id}
                className={`${
                  index % 2 === 0 ? 'bg-[#1E1E1E]' : 'bg-[#878585]/50'
                } transition-colors hover:bg-purple-300/20  `}
              >
                <td className="px-5 py-4 text-gray-300">{expense.date}</td>
                <td className="px-5 py-4 text-gray-300">{expense.merchant}</td>
                <td className="px-5 py-4 text-gray-300">
                  {expense.description}
                </td>
                <td className="px-5 py-4 text-gray-300">
                  {formatter.format(expense.amount)}
                </td>
                <td className="px-5 py-4 text-gray-300">{expense.category}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <Pagination />
    </>
  );
};

export default function ExpensesTable() {
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const expenses = getAllExpenses();
    setTotalItems(expenses.length);
  }, [refreshTrigger]);

  // Refresh when a new expense is added
  useEffect(() => {
    // Set up event listener for when navigation occurs
    // (like when returning from the new expense page)
    const handleRouteChange = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener('focus', handleRouteChange);
    return () => {
      window.removeEventListener('focus', handleRouteChange);
    };
  }, []);

  return (
    <div className="w-full">
      <PaginationProvider
        totalItems={totalItems}
        itemsPerPage={10}
        initialPage={1}
      >
        <ExpensesTableContent />
      </PaginationProvider>
    </div>
  );
}
