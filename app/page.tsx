'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import SpendingByCategoryChart from './components/Charts/SpendingByCategoryChart';
import SpendingByMonthChart from './components/Charts/SpendingByMonthChart';
import MonthlySpendCard from './components/Dashboard/MonthlySpendCard';
import QuickAccessCard from './components/Dashboard/QuickAccessCard';
import RecentTransactionsCard from './components/Dashboard/RecentTransactionsCard';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Auth state:', { user, loading });

    if (!loading && !user) {
      console.log('No user, redirecting to login');
      router.push('/login');
    }

    // Add an error handler to catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      setError(event.error?.message || 'An unknown error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [user, loading, router]);

  if (loading) {
    console.log('Showing loading spinner');
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, showing login button');
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] flex-col">
        <h1 className="text-2xl font-bold text-gray-300 mb-6">
          Welcome to Expense Tracker
        </h1>
        <p className="text-gray-400 mb-8">
          Please log in to access your dashboard
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Display any errors that occurred
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

  console.log('Rendering full dashboard');

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-300 mb-4">
            Welcome, {user.name || 'User'}
          </h1>
          <hr className="my-4 border-gray-300" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MonthlySpendCard />
            <QuickAccessCard />
          </div>

          <RecentTransactionsCard />

          <div className="mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 mx-auto w-full h-full">
                <SpendingByCategoryChart />
              </div>
              <div className="md:col-span-8 mx-auto w-full h-full">
                <SpendingByMonthChart />
              </div>
            </div>
          </div>
        </div>
      </ContentScreen>
    </div>
  );
}
