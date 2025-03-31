'use client';

import { useEffect, useState } from 'react';
import { getAllExpenses } from '@/app/services/client/expenseService';
import { Expense } from '@/app/types/Expense';

const RecentTransactionsCard = () => {
  const [recentTransactions, setRecentTransactions] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      const expenses = await getAllExpenses();
      const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setRecentTransactions(sortedExpenses.slice(0, 5));
    };

    fetchRecentTransactions();
  }, []);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-300 mb-3">
        Recent Transactions
      </h2>
      <ul className="divide-y divide-gray-700">
        {recentTransactions.map((expense, index) => (
          <li key={index} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-200 text-sm">
                {expense.description}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <span className="text-[#BF415D] font-bold">
              {formatter.format(expense.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTransactionsCard;
