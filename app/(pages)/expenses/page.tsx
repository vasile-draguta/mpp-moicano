'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import MainScreen from '@/app/components/ContentScreen/ContentScreen';
import ExpensesTable from '@/app/components/ExpensesTable/ExpensesTable';
import NewExpenseButton from '@/app/components/Buttons/NewExpenseButton';

export default function Expenses() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainScreen>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-300">Expenses</h1>
          <NewExpenseButton />
        </div>

        <hr className="my-4 border-gray-300" />

        <ExpensesTable />
      </MainScreen>
    </div>
  );
}
