'use server';

import { expenses as mockExpenses } from '../../utils/mockData';
import { Expense } from '@/app/types/Expense';
import {
  validateNewExpense,
  validateExpenseUpdate,
  validateExpenseId,
} from '@/app/utils/validators/expenseValidator';
import { ValidationError } from '@/app/utils/errors/ValidationError';

let expenses: Expense[] = [...mockExpenses];

export async function getAllExpenses(): Promise<Expense[]> {
  return expenses;
}

export async function getPaginatedExpenses(
  page: number,
  itemsPerPage: number,
): Promise<{ data: Expense[]; total: number }> {
  if (page < 1 || itemsPerPage < 1) {
    throw new Error('Invalid pagination parameters');
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    data: expenses.slice(startIndex, endIndex),
    total: expenses.length,
  };
}

export async function addExpense(
  expenseData: Omit<Expense, 'id'>,
): Promise<Expense> {
  const validationResult = validateNewExpense(expenseData);
  if (!validationResult.isValid) {
    throw new ValidationError(validationResult);
  }

  const newId = Math.max(...expenses.map((e) => e.id), 0) + 1;
  const newExpense: Expense = {
    ...expenseData,
    id: newId,
    amount: parseFloat(expenseData.amount.toString()),
  };

  expenses = [newExpense, ...expenses];
  return newExpense;
}

export async function updateExpense(
  id: number,
  expenseData: Partial<Expense>,
): Promise<Expense | null> {
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation);
  }

  const updateValidation = validateExpenseUpdate(expenseData);
  if (!updateValidation.isValid) {
    throw new ValidationError(updateValidation);
  }

  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) {
    return null;
  }

  const updatedExpense = {
    ...expenses[index],
    ...expenseData,
  };

  expenses[index] = updatedExpense;
  return updatedExpense;
}

export async function deleteExpense(id: number): Promise<boolean> {
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation);
  }

  const initialLength = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);
  return expenses.length < initialLength;
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation);
  }

  const expense = expenses.find((e) => e.id === id);
  return expense || null;
}

export async function searchExpenses(query: string): Promise<Expense[]> {
  if (!query || query.trim() === '') {
    throw new Error('Search query cannot be empty');
  }

  const lowerCaseQuery = query.toLowerCase();
  return expenses.filter(
    (e) =>
      e.merchant.toLowerCase().includes(lowerCaseQuery) ||
      e.description.toLowerCase().includes(lowerCaseQuery) ||
      e.category.toLowerCase().includes(lowerCaseQuery),
  );
}

export async function sortExpensesByDate(
  expenses: Expense[],
): Promise<Expense[]> {
  return [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function sortExpensesByAmount(
  expenses: Expense[],
): Promise<Expense[]> {
  return [...expenses].sort((a, b) => a.amount - b.amount);
}

export async function getHighestSpendingCategory(
  expensesToAnalyze: Expense[] = expenses,
): Promise<string | null> {
  if (expensesToAnalyze.length === 0) return null;

  const categoryTotals = expensesToAnalyze.reduce<Record<string, number>>(
    (totals, expense) => {
      const { category, amount } = expense;
      totals[category] = (totals[category] || 0) + amount;
      return totals;
    },
    {},
  );

  let highestCategory: string | null = null;
  let highestAmount = 0;

  Object.entries(categoryTotals).forEach(([category, total]) => {
    if (total > highestAmount) {
      highestAmount = total;
      highestCategory = category;
    }
  });

  return highestCategory;
}

export async function getLowestSpendingCategory(
  expensesToAnalyze: Expense[] = expenses,
): Promise<string | null> {
  if (expensesToAnalyze.length === 0) return null;

  const categoryTotals = expensesToAnalyze.reduce<Record<string, number>>(
    (totals, expense) => {
      const { category, amount } = expense;
      totals[category] = (totals[category] || 0) + amount;
      return totals;
    },
    {},
  );

  let lowestCategory: string | null = null;
  let lowestAmount = Infinity;

  Object.entries(categoryTotals).forEach(([category, total]) => {
    if (total < lowestAmount) {
      lowestAmount = total;
      lowestCategory = category;
    }
  });

  return lowestCategory;
}
