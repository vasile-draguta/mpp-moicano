'use client';

import { useRouter } from 'next/navigation';

export default function NewExpenseButton() {
  const Router = useRouter();

  return (
    <button
      className="bg-purple-300/10 hover:bg-purple-300/20 py-2 px-4 rounded text-sm text-purple-300 cursor-pointer"
      type="button"
      onClick={() => {
        Router.push('/expenses/new');
      }}
    >
      New Expense
    </button>
  );
}
