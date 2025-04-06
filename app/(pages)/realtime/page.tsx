'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { RefreshCw, Play, Pause } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default function RealTimeDashboard() {
  const {
    connected,
    expenses,
    chartData,
    connectionError,
    lastEventTime,
    isGenerating,
    startGeneration,
    stopGeneration,
    socket,
  } = useSocket();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second to show time since last event
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger server-side API call to start the socket server is now handled in startGeneration
  // useEffect(() => {
  //   // Fetch the API to ensure server is running
  //   fetch('/api/socket').catch(() => {});
  // }, []);

  // Get month names for chart
  const getMonthName = (monthNumber: number) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[monthNumber - 1];
  };

  // Function to refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Calculate time since last event
  const getTimeSinceLastEvent = () => {
    if (!lastEventTime) return 'No events received';

    const seconds = Math.floor(
      (currentTime.getTime() - lastEventTime.getTime()) / 1000,
    );

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  // Handle toggle data generation
  const handleToggleGeneration = () => {
    if (isGenerating) {
      stopGeneration();
    } else {
      startGeneration();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-300 mb-6">
        Real-Time Expense Dashboard
      </h1>

      <div className="mb-4 p-3 rounded-md bg-purple-300/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300">
              Connection Status:{' '}
              {socket ? (
                connected ? (
                  <span className="text-green-500">Connected</span>
                ) : (
                  <span className="text-yellow-500">Connecting...</span>
                )
              ) : (
                <span className="text-gray-500">Not Connected</span>
              )}
              {' | '}
              Data Generation:{' '}
              {isGenerating ? (
                <span className="text-green-500">Running</span>
              ) : (
                <span className="text-yellow-500">Paused</span>
              )}
            </p>
            {connectionError && (
              <p className="text-xs text-red-400 mt-1">{connectionError}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {socket
                ? 'The server generates new expenses every 5 seconds when running and updates the charts in real-time.'
                : "Press 'Connect & Start' to establish a connection and begin generating expense data."}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Last event received:{' '}
              <span
                className={lastEventTime ? 'text-green-500' : 'text-red-500'}
              >
                {getTimeSinceLastEvent()}
              </span>
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleGeneration}
              className={`p-2 ${
                isGenerating
                  ? 'bg-red-500/20 hover:bg-red-500/30'
                  : 'bg-green-500/20 hover:bg-green-500/30'
              } rounded-md text-gray-300 flex items-center`}
              title={
                isGenerating
                  ? 'Stop data generation'
                  : socket
                    ? 'Start data generation'
                    : 'Connect and start data generation'
              }
            >
              {isGenerating ? (
                <>
                  <Pause size={16} className="mr-1" /> Stop
                </>
              ) : (
                <>
                  <Play size={16} className="mr-1" />{' '}
                  {socket ? 'Start' : 'Connect & Start'}
                </>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-purple-300/10 hover:bg-purple-300/20 rounded-md text-gray-300 flex items-center"
              title="Reconnect to WebSocket server"
            >
              <RefreshCw size={16} className="mr-1" /> Reconnect
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Expenses Chart */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">
            Monthly Expenses (Real-Time)
          </h2>
          {chartData.expensesByMonth.length > 0 ? (
            <Line
              data={{
                labels: chartData.expensesByMonth.map((item) =>
                  getMonthName(item.month),
                ),
                datasets: [
                  {
                    label: 'Monthly Expenses',
                    data: chartData.expensesByMonth.map((item) => item.total),
                    borderColor: 'rgb(149, 128, 255)',
                    backgroundColor: 'rgba(149, 128, 255, 0.2)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Waiting for data...</p>
            </div>
          )}
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">
            Expense Categories (Real-Time)
          </h2>
          {chartData.expensesByCategory.length > 0 ? (
            <Doughnut
              data={{
                labels: chartData.expensesByCategory.map((item) => item.name),
                datasets: [
                  {
                    data: chartData.expensesByCategory.map(
                      (item) => item._sum.amount,
                    ),
                    backgroundColor: [
                      'rgba(149, 128, 255, 0.7)',
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 206, 86, 0.7)',
                      'rgba(75, 192, 192, 0.7)',
                    ],
                    borderColor: [
                      'rgba(149, 128, 255, 1)',
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Waiting for data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Expenses List */}
      <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Recent Real-Time Expenses
        </h2>
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-[#2A2A2A]">
                    <td className="px-4 py-2">{expense.title}</td>
                    <td className="px-4 py-2">${expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {expense.category?.name ||
                        `Category ${expense.categoryId}`}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {expense.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            No real-time expenses yet. They will appear here as they are
            generated.
          </p>
        )}
      </div>
    </div>
  );
}
