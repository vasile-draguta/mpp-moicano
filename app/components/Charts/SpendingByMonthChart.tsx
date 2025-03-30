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
    maintainAspectRatio: true,
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 0,
        bottom: 10,
      },
    },
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
        padding: {
          top: 10,
          bottom: 15,
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
          font: {
            size: 12,
          },
          maxTicksLimit: 6,
        },
      },
      x: {
        grid: {
          color: '#374151', // Gray-700
          display: false,
        },
        ticks: {
          color: '#D1D5DB', // Gray-300
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
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

      // Limit to last 12 months (showing more since we have even more space)
      const limitedMonths: Record<string, number> = {};
      const keys = Object.keys(sortedMonths);
      const values = Object.values(sortedMonths);
      const startIdx = Math.max(0, keys.length - 12);

      for (let i = startIdx; i < keys.length; i++) {
        limitedMonths[keys[i]] = values[i];
      }

      setChartData({
        labels: Object.keys(limitedMonths),
        datasets: [
          {
            label: 'Total Spending',
            data: Object.values(limitedMonths),
            backgroundColor: '#BF415D',
            borderWidth: 0,
            borderRadius: 4,
            barThickness: 22,
            maxBarThickness: 35,
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
    <div
      className="w-full h-full p-4 bg-[#1E1E1E] rounded-lg shadow-lg flex items-center justify-center"
      style={{ minHeight: '300px' }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SpendingByMonthChart;
