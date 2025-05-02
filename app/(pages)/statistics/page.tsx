'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import { useAuth } from '@/app/contexts/AuthContext';

// Types for the statistics data
interface CategoryStatistic {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

interface MonthlyStatistic {
  month: string;
  totalAmount: number;
  count: number;
}

interface YearlyComparison {
  month: string;
  currentYearAmount: number;
  previousYearAmount: number;
  percentageChange: number;
}

interface TotalStatistics {
  totalExpenses: number;
  averageExpense: number;
  maxExpense: number;
  minExpense: number;
  expenseCount: number;
}

interface StatisticsData {
  byCategory: CategoryStatistic[];
  monthly: MonthlyStatistic[];
  yearComparison: YearlyComparison[];
  totals: TotalStatistics;
}

export default function StatisticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/statistics');

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStatistics(data.data);
        setExecutionTime(data.meta?.executionTime || null);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStatistics();
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] flex-col">
        <div className="text-red-500 font-bold text-xl mb-4">Error!</div>
        <div className="text-white bg-red-500/20 p-4 rounded-md max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6 pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-300">Statistics</h1>
            {executionTime && (
              <span className="text-sm text-gray-400">
                Query execution time: {executionTime}ms
              </span>
            )}
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Total Statistics */}
          {statistics?.totals && (
            <div className="bg-[#1E1E1E] rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold text-gray-300 mb-3">
                Total Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Expenses"
                  value={`$${statistics.totals.totalExpenses.toFixed(2)}`}
                  subtitle={`${statistics.totals.expenseCount} transactions`}
                />
                <StatCard
                  title="Average Expense"
                  value={`$${statistics.totals.averageExpense.toFixed(2)}`}
                  subtitle="Per transaction"
                />
                <StatCard
                  title="Maximum Expense"
                  value={`$${statistics.totals.maxExpense.toFixed(2)}`}
                  subtitle="Highest transaction"
                />
                <StatCard
                  title="Minimum Expense"
                  value={`$${statistics.totals.minExpense.toFixed(2)}`}
                  subtitle="Lowest transaction"
                />
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {statistics?.byCategory && statistics.byCategory.length > 0 && (
            <div className="bg-[#1E1E1E] rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold text-gray-300 mb-3">
                Expenses by Category
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2D2D2D]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
                    {statistics.byCategory.map((category) => (
                      <tr key={category.categoryId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {category.categoryName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {category.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${category.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${category.averageAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Spending */}
          {statistics?.monthly && statistics.monthly.length > 0 && (
            <div className="bg-[#1E1E1E] rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold text-gray-300 mb-3">
                Monthly Spending
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#2D2D2D]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Spending
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
                    {statistics.monthly.map((month) => (
                      <tr key={month.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {month.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {month.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${month.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Year-over-Year Comparison */}
          {statistics?.yearComparison &&
            statistics.yearComparison.length > 0 && (
              <div className="bg-[#1E1E1E] rounded-lg p-4 shadow-md">
                <h2 className="text-xl font-semibold text-gray-300 mb-3">
                  Year-over-Year Comparison
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2D2D2D]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Current Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Previous Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Change (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
                      {statistics.yearComparison.map((comparison) => (
                        <tr key={comparison.month}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {comparison.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            ${comparison.currentYearAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            ${comparison.previousYearAmount.toFixed(2)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              comparison.percentageChange > 0
                                ? 'text-green-500'
                                : comparison.percentageChange < 0
                                  ? 'text-red-500'
                                  : 'text-gray-300'
                            }`}
                          >
                            {comparison.percentageChange > 0 ? '+' : ''}
                            {comparison.percentageChange.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </ContentScreen>
    </div>
  );
}

// Simple stat card component
function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-[#2D2D2D] border border-purple-300/20 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-300 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
