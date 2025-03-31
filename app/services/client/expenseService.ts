'use client';

import { Expense } from '@/app/types/Expense';
import {
  validateNewExpense,
  validateExpenseUpdate,
  validateExpenseId,
} from '@/app/utils/validators/expenseValidator';

// API helper function for making requests
const apiRequest = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Get all expenses
export const getAllExpenses = async (sortBy?: string): Promise<Expense[]> => {
  const url = sortBy ? `/api/expense?sortBy=${sortBy}` : '/api/expense';

  const response = await apiRequest<{ data: Expense[]; total: number }>(url);
  return response.data;
};

// Get paginated expenses
export const getPaginatedExpenses = async (
  page: number,
  itemsPerPage: number,
): Promise<{ data: Expense[]; total: number }> => {
  const url = `/api/expense/page?page=${page}&limit=${itemsPerPage}`;
  return apiRequest<{ data: Expense[]; total: number }>(url);
};

// Add a new expense
export const addExpense = async (
  expenseData: Omit<Expense, 'id'>,
): Promise<Expense> => {
  // Validate the expense data
  const validationResult = validateNewExpense(expenseData);

  if (!validationResult.isValid) {
    throw new Error(
      `Validation failed: ${JSON.stringify(validationResult.errors)}`,
    );
  }

  return apiRequest<Expense>('/api/expense', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
};

// Update an expense
export const updateExpense = async (
  id: number,
  expenseData: Partial<Expense>,
): Promise<Expense | null> => {
  // Validate the ID and update data
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${JSON.stringify(idValidation.errors)}`);
  }

  const updateValidation = validateExpenseUpdate(expenseData);
  if (!updateValidation.isValid) {
    throw new Error(
      `Validation failed: ${JSON.stringify(updateValidation.errors)}`,
    );
  }

  try {
    return await apiRequest<Expense>(`/api/expense/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
  } catch (error) {
    // If 404, return null to match server-side behavior
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id: number): Promise<boolean> => {
  // Validate the ID
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${JSON.stringify(idValidation.errors)}`);
  }

  try {
    const response = await fetch(`/api/expense/${id}`, {
      method: 'DELETE',
    });
    return response.status === 204;
  } catch {
    return false;
  }
};

// Get expense by ID
export const getExpenseById = async (id: number): Promise<Expense | null> => {
  // Validate the ID
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${JSON.stringify(idValidation.errors)}`);
  }

  try {
    return await apiRequest<Expense>(`/api/expense/${id}`);
  } catch (error) {
    // If 404, return null to match server-side behavior
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

// Search expenses
export const searchExpenses = async (query: string): Promise<Expense[]> => {
  const url = `/api/expense/search?q=${encodeURIComponent(query)}`;
  const response = await apiRequest<{ data: Expense[]; total: number }>(url);
  return response.data;
};

// Sort expenses by date (client-side fallback if needed)
export const sortExpensesByDate = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Sort expenses by amount (client-side fallback if needed)
export const sortExpensesByAmount = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => a.amount - b.amount);
};

// Get highest spending category
export const getHighestSpendingCategory = async (
  expensesToAnalyze?: Expense[],
): Promise<string | null> => {
  // If expenses are provided, calculate client-side
  if (expensesToAnalyze) {
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

  // Otherwise fetch all expenses and calculate
  const expenses = await getAllExpenses();
  return getHighestSpendingCategory(expenses);
};

// Get lowest spending category
export const getLowestSpendingCategory = async (
  expensesToAnalyze?: Expense[],
): Promise<string | null> => {
  // If expenses are provided, calculate client-side
  if (expensesToAnalyze) {
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

  // Otherwise fetch all expenses and calculate
  const expenses = await getAllExpenses();
  return getLowestSpendingCategory(expenses);
};
