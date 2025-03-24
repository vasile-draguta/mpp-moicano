'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { getAllExpenses } from '@/app/services/expenseService';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingByCategoryChart = () => {
  const [chartData, setChartData] = useState<ChartData<'pie'>>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#BF415D', // Red
          '#A78BFA', // Purple
          '#60A5FA', // Blue
          '#34D399', // Green
          '#FBBF24', // Yellow
          '#F87171', // Light Red
          '#818CF8', // Indigo
          '#4ADE80', // Light Green
        ],
        borderWidth: 0,
      },
    ],
  });

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#D1D5DB', // Gray-300
        },
      },
      title: {
        display: true,
        text: 'Spending by Category',
        color: '#D1D5DB',
        font: {
          size: 16,
        },
      },
    },
  };

  useEffect(() => {
    const updateChartData = () => {
      const expenses = getAllExpenses();

      // Calculate total spending by category
      const categoryTotals = expenses.reduce<Record<string, number>>(
        (acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        },
        {},
      );

      // Sort categories by total spending (descending)
      const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, number>,
        );

      setChartData({
        labels: Object.keys(sortedCategories),
        datasets: [
          {
            data: Object.values(sortedCategories),
            backgroundColor: [
              '#BF415D', // Red
              '#A78BFA', // Purple
              '#60A5FA', // Blue
              '#34D399', // Green
              '#FBBF24', // Yellow
              '#F87171', // Light Red
              '#818CF8', // Indigo
              '#4ADE80', // Light Green
            ],
            borderWidth: 0,
          },
        ],
      });
    };

    // Initial update
    updateChartData();

    // Set up event listener for when data changes
    window.addEventListener('focus', updateChartData);
    return () => window.removeEventListener('focus', updateChartData);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[#1E1E1E] rounded-lg shadow-lg">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default SpendingByCategoryChart;
