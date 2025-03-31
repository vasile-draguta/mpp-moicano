'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteExpense } from '@/app/services/client/expenseService';
import { DeleteExpenseButtonProps } from '@/app/types/Button';

export default function DeleteExpenseButton({
  expenseId,
  onDelete,
}: DeleteExpenseButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setIsDeleting(true);
      try {
        const success = await deleteExpense(expenseId);
        if (success && onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-[#BF415D]/10 hover:bg-[#BF415D]/20 p-2 rounded-md cursor-pointer text-[#BF415D] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 size={20} />
    </button>
  );
}
