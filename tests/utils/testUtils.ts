import { Expense } from '@/app/types/Expense';
import { addExpense, deleteExpense } from '@/app/services/expenseService';

/**
 * Helper function to create test expenses and track them for cleanup
 */
export const createTestExpenses = (
  testData: Omit<Expense, 'id'>[],
): { expenses: Expense[]; cleanup: () => void } => {
  const createdExpenses: Expense[] = [];

  for (const data of testData) {
    const expense = addExpense(data);
    createdExpenses.push(expense);
  }

  // Return cleanup function to delete all created expenses
  const cleanup = () => {
    for (const expense of createdExpenses) {
      deleteExpense(expense.id);
    }
  };

  return { expenses: createdExpenses, cleanup };
};
