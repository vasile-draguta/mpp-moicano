'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { getAllExpenses } from '@/app/services/expenseService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const SpendingByMonthChart = () => {
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [
      {
        label: 'Total Spending',
        data: [],
        backgroundColor: '#BF415D',
        borderWidth: 0,
      },
    ],
  });

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Monthly Spending',
        color: '#D1D5DB',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151', // Gray-700
        },
        ticks: {
          color: '#D1D5DB', // Gray-300
        },
      },
      x: {
        grid: {
          color: '#374151', // Gray-700
        },
        ticks: {
          color: '#D1D5DB', // Gray-300
        },
      },
    },
  };

  useEffect(() => {
    const updateChartData = () => {
      const expenses = getAllExpenses();

      // Calculate total spending by month
      const monthTotals = expenses.reduce<Record<string, number>>(
        (acc, expense) => {
          const date = new Date(expense.date);
          const monthYear = date.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          });
          acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
          return acc;
        },
        {},
      );

      // Sort months chronologically
      const sortedMonths = Object.entries(monthTotals)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, number>,
        );

      setChartData({
        labels: Object.keys(sortedMonths),
        datasets: [
          {
            label: 'Total Spending',
            data: Object.values(sortedMonths),
            backgroundColor: '#BF415D',
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SpendingByMonthChart;
