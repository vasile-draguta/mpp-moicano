'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import ExpenseForm from '@/app/components/Forms/ExpenseForm';
import { getExpenseById } from '@/app/services/client/expenseService';
import { Expense } from '@/app/types/Expense';

export default function EditExpense() {
  const params = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpense = async () => {
      const expenseId = Number(params.id);

      if (isNaN(expenseId)) {
        setError('Invalid expense ID');
        setLoading(false);
        return;
      }

      try {
        const expenseData = await getExpenseById(expenseId);
        if (expenseData) {
          setExpense(expenseData);
        } else {
          setError('Expense not found');
        }
      } catch (err) {
        setError('Failed to load expense data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [params.id]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-300">Edit Expense</h1>
          <hr className="my-4 border-gray-300" />

          {loading ? (
            <div className="text-gray-300">Loading expense data...</div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
              <div className="mt-4">
                <button
                  onClick={() => router.push('/expenses')}
                  className="px-4 py-2 bg-[#1E1E1E] text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Return to Expenses
                </button>
              </div>
            </div>
          ) : (
            <ExpenseForm expenseToEdit={expense} />
          )}
        </div>
      </ContentScreen>
    </div>
  );
}
