'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import SpendingByCategoryChart from './components/Charts/SpendingByCategoryChart';
import SpendingByMonthChart from './components/Charts/SpendingByMonthChart';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-4xl font-bold text-gray-300 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
          <SpendingByCategoryChart />
          <SpendingByMonthChart />
        </div>
      </ContentScreen>
    </div>
  );
}
