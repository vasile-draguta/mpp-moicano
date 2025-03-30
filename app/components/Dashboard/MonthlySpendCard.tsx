'use client';

import { useEffect, useState } from 'react';
import { getAllExpenses } from '@/app/services/expenseService';

const MonthlySpendCard = () => {
  const [totalMonthlySpend, setTotalMonthlySpend] = useState(0);

  useEffect(() => {
    const expenses = getAllExpenses();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const total = monthlyExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    setTotalMonthlySpend(total);
  }, []);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg flex flex-col justify-center items-center">
      <h2 className="text-lg font-semibold text-gray-300 mb-2">
        This Month&apos;s Spending
      </h2>
      <p className="text-4xl font-bold text-[#BF415D]">
        {formatter.format(totalMonthlySpend)}
      </p>
    </div>
  );
};

export default MonthlySpendCard;
