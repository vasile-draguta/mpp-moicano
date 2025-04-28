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

// Example of how to handle legacy category names can be implemented with the utility
// function getCategoryIdFromName from expenseValidator.ts

export async function getAllExpenses(): Promise<Expense[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { category: true },
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
      include: { category: true },
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
      categoryId: expenseData.categoryId,
      merchant: expenseData.merchant,
      userId,
    },
    include: { category: true },
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

  const updatedExpense = await prisma.expense.update({
    where: { id },
    data: {
      ...(expenseData.description && { description: expenseData.description }),
      ...(expenseData.date && { date: new Date(expenseData.date) }),
      ...(expenseData.amount && {
        amount: parseFloat(expenseData.amount.toString()),
      }),
      ...(expenseData.categoryId && { categoryId: expenseData.categoryId }),
      ...(expenseData.merchant && { merchant: expenseData.merchant }),
    },
    include: { category: true },
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
    include: { category: true },
  });

  if (!expense) {
    return null;
  }

  return formatExpense(expense);
}

export async function searchExpenses(query: string): Promise<Expense[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const searchString = query.toLowerCase();

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      OR: [
        { description: { contains: searchString, mode: 'insensitive' } },
        { merchant: { contains: searchString, mode: 'insensitive' } },
        {
          category: {
            name: { contains: searchString, mode: 'insensitive' },
          },
        },
      ],
    },
    orderBy: { date: 'desc' },
    include: { category: true },
  });

  return expenses.map(formatExpense);
}

export async function sortExpensesByDate(
  expenses: Expense[],
): Promise<Expense[]> {
  return [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function sortExpensesByAmount(
  expenses: Expense[],
): Promise<Expense[]> {
  return [...expenses].sort((a, b) => b.amount - a.amount);
}

export async function getHighestSpendingCategory(
  expensesToAnalyze?: Expense[],
): Promise<number | null> {
  let expenses: Expense[];

  if (expensesToAnalyze) {
    expenses = expensesToAnalyze;
  } else {
    expenses = await getAllExpenses();
  }

  if (expenses.length === 0) return null;

  const categoryTotals = expenses.reduce<Record<number, number>>(
    (totals, expense) => {
      const { categoryId, amount } = expense;
      totals[categoryId] = (totals[categoryId] || 0) + amount;
      return totals;
    },
    {},
  );

  let highestCategory: number | null = null;
  let highestAmount = 0;

  Object.entries(categoryTotals).forEach(([categoryIdStr, total]) => {
    const categoryId = parseInt(categoryIdStr, 10);
    if (total > highestAmount) {
      highestAmount = total;
      highestCategory = categoryId;
    }
  });

  return highestCategory;
}

export async function getLowestSpendingCategory(
  expensesToAnalyze?: Expense[],
): Promise<number | null> {
  let expenses: Expense[];

  if (expensesToAnalyze) {
    expenses = expensesToAnalyze;
  } else {
    expenses = await getAllExpenses();
  }

  if (expenses.length === 0) return null;

  const categoryTotals = expenses.reduce<Record<number, number>>(
    (totals, expense) => {
      const { categoryId, amount } = expense;
      totals[categoryId] = (totals[categoryId] || 0) + amount;
      return totals;
    },
    {},
  );

  let lowestCategory: number | null = null;
  let lowestAmount = Infinity;

  Object.entries(categoryTotals).forEach(([categoryIdStr, total]) => {
    const categoryId = parseInt(categoryIdStr, 10);
    if (total < lowestAmount) {
      lowestAmount = total;
      lowestCategory = categoryId;
    }
  });

  return lowestCategory;
}

function formatExpense(expense: {
  id: number;
  date: Date;
  description: string;
  amount: number;
  categoryId: number;
  category?: { id: number; name: string };
  merchant: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    id: expense.id,
    date: expense.date.toISOString().split('T')[0],
    description: expense.description,
    amount: expense.amount,
    categoryId: expense.categoryId,
    category: expense.category
      ? {
          id: expense.category.id,
          name: expense.category.name,
        }
      : undefined,
    merchant: expense.merchant,
  };
}
