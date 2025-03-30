'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import SpendingByCategoryChart from './components/Charts/SpendingByCategoryChart';
import SpendingByMonthChart from './components/Charts/SpendingByMonthChart';
import { getAllExpenses } from './services/expenseService';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, BarChart } from 'lucide-react';
import { Expense } from './types/Expense';

export default function Home() {
  const [totalMonthlySpend, setTotalMonthlySpend] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Expense[]>([]);

  useEffect(() => {
    // Calculate total spend for current month
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

    // Get recent transactions (last 5)
    const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    setRecentTransactions(sortedExpenses.slice(0, 5));
  }, []);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-300 mb-4">Dashboard</h1>
          <hr className="border-gray-700 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Spend Card - Smaller */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg flex flex-col justify-center items-center">
              <h2 className="text-lg font-semibold text-gray-300 mb-2">
                This Month&apos;s Spending
              </h2>
              <p className="text-4xl font-bold text-[#BF415D]">
                {formatter.format(totalMonthlySpend)}
              </p>
            </div>

            {/* Quick Access Card - Smaller */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold text-gray-300 mb-2">
                Quick Access
              </h2>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/expenses/new"
                  className="flex items-center bg-[#2D3748] hover:bg-[#4A5568] text-white px-3 py-2 rounded text-sm"
                >
                  <Plus size={16} className="mr-2" /> Add Expense
                </Link>
                <Link
                  href="/expenses?search=open"
                  className="flex items-center bg-[#2D3748] hover:bg-[#4A5568] text-white px-3 py-2 rounded text-sm"
                >
                  <Search size={16} className="mr-2" /> Search Expenses
                </Link>
                <Link
                  href="/expenses"
                  className="flex items-center bg-[#2D3748] hover:bg-[#4A5568] text-white px-3 py-2 rounded text-sm"
                >
                  <BarChart size={16} className="mr-2" /> View All Expenses
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Transactions as a simple list */}
          <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-300 mb-3">
              Recent Transactions
            </h2>
            <ul className="divide-y divide-gray-700">
              {recentTransactions.map((expense, index) => (
                <li
                  key={index}
                  className="py-2 flex justify-between items-center"
                >
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

          {/* Charts - Bigger monthly chart */}
          <div className="mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 aspect-square mx-auto w-full">
                <SpendingByCategoryChart />
              </div>
              <div className="md:col-span-8 mx-auto w-full">
                <SpendingByMonthChart />
              </div>
            </div>
          </div>
        </div>
      </ContentScreen>
    </div>
  );
}
