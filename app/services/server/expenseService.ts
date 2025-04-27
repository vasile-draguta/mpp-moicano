'use server';

import prisma from '@/app/db';
import { Expense } from '@/app/types/Expense';
import {
  validateNewExpense,
  validateExpenseUpdate,
  validateExpenseId,
} from '@/app/utils/validators/expenseValidator';
import { ValidationError } from '@/app/utils/errors/ValidationError';
import { getCurrentUserId } from './authService';

// Map old category names to new ones for backwards compatibility
const CATEGORY_MAPPING: Record<string, string> = {
  'Food & Dining': 'Food',
  'Health & Fitness': 'Healthcare',
  'Gifts & Donations': 'Other',
};

// Helper to normalize categories
const normalizeCategory = (category: string): string => {
  return CATEGORY_MAPPING[category] || category;
};

export async function getAllExpenses(): Promise<Expense[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  return expenses.map(formatExpense);
}

export async function getPaginatedExpenses(
  page: number,
  itemsPerPage: number,
): Promise<{ data: Expense[]; total: number }> {
  if (page < 1 || itemsPerPage < 1) {
    throw new Error('Invalid pagination parameters');
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return { data: [], total: 0 };
  }

  const skip = (page - 1) * itemsPerPage;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      skip,
      take: itemsPerPage,
      orderBy: { date: 'desc' },
    }),
    prisma.expense.count({ where: { userId } }),
  ]);

  return {
    data: expenses.map(formatExpense),
    total,
  };
}

export async function addExpense(
  expenseData: Omit<Expense, 'id'>,
): Promise<Expense> {
  const validationResult = validateNewExpense(expenseData);
  if (!validationResult.isValid) {
    throw new ValidationError(validationResult);
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('You must be logged in to add an expense');
  }

  const newExpense = await prisma.expense.create({
    data: {
      date: new Date(expenseData.date),
      description: expenseData.description,
      amount: parseFloat(expenseData.amount.toString()),
      category: normalizeCategory(expenseData.category),
      merchant: expenseData.merchant,
      userId,
    },
  });

  return formatExpense(newExpense);
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

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('You must be logged in to update an expense');
  }

  const existingExpense = await prisma.expense.findFirst({
    where: {
      id,
      userId, // Ensure the expense belongs to the current user
    },
  });

  if (!existingExpense) {
    return null;
  }

  // Normalize category if it exists
  const categoryUpdate = expenseData.category
    ? { category: normalizeCategory(expenseData.category) }
    : {};

  const updatedExpense = await prisma.expense.update({
    where: { id },
    data: {
      ...(expenseData.description && { description: expenseData.description }),
      ...(expenseData.date && { date: new Date(expenseData.date) }),
      ...(expenseData.amount && {
        amount: parseFloat(expenseData.amount.toString()),
      }),
      ...categoryUpdate,
      ...(expenseData.merchant && { merchant: expenseData.merchant }),
    },
  });

  return formatExpense(updatedExpense);
}

export async function deleteExpense(id: number): Promise<boolean> {
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation);
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('You must be logged in to delete an expense');
  }

  // First check if the expense exists and belongs to the current user
  const existingExpense = await prisma.expense.findFirst({
    where: {
      id,
      userId, // Ensure the expense belongs to the current user
    },
  });

  if (!existingExpense) {
    return false;
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation);
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const expense = await prisma.expense.findFirst({
    where: {
      id,
      userId, // Ensure the expense belongs to the current user
    },
  });

  return expense ? formatExpense(expense) : null;
}

export async function searchExpenses(query: string): Promise<Expense[]> {
  if (!query || query.trim() === '') {
    throw new Error('Search query cannot be empty');
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId, // Only search the current user's expenses
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { merchant: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { date: 'desc' },
  });

  return expenses.map(formatExpense);
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
  expensesToAnalyze?: Expense[],
): Promise<string | null> {
  let expenses: Expense[];

  if (expensesToAnalyze) {
    expenses = expensesToAnalyze;
  } else {
    expenses = await getAllExpenses();
  }

  if (expenses.length === 0) return null;

  const categoryTotals = expenses.reduce<Record<string, number>>(
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
  expensesToAnalyze?: Expense[],
): Promise<string | null> {
  let expenses: Expense[];

  if (expensesToAnalyze) {
    expenses = expensesToAnalyze;
  } else {
    expenses = await getAllExpenses();
  }

  if (expenses.length === 0) return null;

  const categoryTotals = expenses.reduce<Record<string, number>>(
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

// Helper function to format expense from Prisma to match app model
function formatExpense(expense: {
  id: number;
  date: Date;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    id: expense.id,
    date: expense.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    merchant: expense.merchant,
  };
}
