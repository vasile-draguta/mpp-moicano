'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Let the useEffect redirect handle this
  }

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
