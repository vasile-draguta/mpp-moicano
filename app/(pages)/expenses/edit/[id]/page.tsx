'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import ExpenseForm from '@/app/components/Forms/ExpenseForm';

export default function EditExpense() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-300">Edit Expense</h1>
          <hr className="my-4 border-gray-300" />
          <ExpenseForm />
        </div>
      </ContentScreen>
    </div>
  );
}
