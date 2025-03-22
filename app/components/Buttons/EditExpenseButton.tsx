'use client';

import { useRouter } from 'next/navigation';
import { SquarePen } from 'lucide-react';

interface EditExpenseButtonProps {
  expenseId: number;
}

export default function EditExpenseButton({
  expenseId,
}: EditExpenseButtonProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/expenses/edit/${expenseId}`);
  };

  return (
    <button
      onClick={handleEdit}
      className="bg-purple-300/10 hover:bg-purple-300/20 p-2 rounded-md cursor-pointer text-purple-300"
    >
      <SquarePen size={20} />
    </button>
  );
}
