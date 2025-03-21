'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import MainScreen from '@/app/components/ContentScreen';
import ExpensesTable from '@/app/components/ExpensesTable/ExpensesTable';

export default function Expenses() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainScreen>
        <h1 className="text-3xl font-bold text-gray-300">Expenses</h1>

        <hr className="my-4 border-gray-300" />

        <ExpensesTable />
      </MainScreen>
    </div>
  );
}
