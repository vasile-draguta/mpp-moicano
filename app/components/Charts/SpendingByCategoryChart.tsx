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
import { getAllExpenses } from '@/app/services/client/expenseService';

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
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#D1D5DB', // Gray-300
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: 'Spending by Category',
        color: '#D1D5DB',
        font: {
          size: 14,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
  };

  useEffect(() => {
    const updateChartData = async () => {
      try {
        const expenses = await getAllExpenses();
        console.log('Category chart: Fetched expenses:', expenses);

        const categoryTotals = expenses.reduce<Record<string, number>>(
          (acc, expense) => {
            try {
              const categoryName = expense.category?.name || 'Unknown';
              acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
            } catch (err) {
              console.error('Error processing expense category:', err, expense);
              // Use 'Unknown' category for any problematic expenses
              acc['Unknown'] = (acc['Unknown'] || 0) + expense.amount;
            }
            return acc;
          },
          {},
        );

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
      } catch (error) {
        console.error('Failed to update chart data:', error);
        // Set default empty chart data on error
        setChartData({
          labels: ['No Data Available'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['#374151'], // Gray
              borderWidth: 0,
            },
          ],
        });
      }
    };

    updateChartData();

    window.addEventListener('focus', updateChartData);
    return () => window.removeEventListener('focus', updateChartData);
  }, []);

  return (
    <div
      className="w-full h-full p-4 bg-[#1E1E1E] rounded-lg shadow-lg flex items-center justify-center"
      style={{ minHeight: '300px' }}
    >
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default SpendingByCategoryChart;
