'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import SpendingByCategoryChart from './components/Charts/SpendingByCategoryChart';
import SpendingByMonthChart from './components/Charts/SpendingByMonthChart';
import MonthlySpendCard from './components/Dashboard/MonthlySpendCard';
import QuickAccessCard from './components/Dashboard/QuickAccessCard';
import RecentTransactionsCard from './components/Dashboard/RecentTransactionsCard';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-300 mb-4">Dashboard</h1>
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
