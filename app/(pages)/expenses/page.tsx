'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import ExpensesTable from '@/app/components/ExpensesTable/ExpensesTable';
import NewExpenseButton from '@/app/components/Buttons/NewExpenseButton';
import SearchButton from '@/app/components/Buttons/SearchButton';

export default function Expenses() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-300">Expenses</h1>

          <div className="flex items-center space-x-2">
            <NewExpenseButton />
            <SearchButton />
          </div>
        </div>

        <hr className="my-4 border-gray-300" />

        <ExpensesTable />
      </ContentScreen>
    </div>
  );
}
