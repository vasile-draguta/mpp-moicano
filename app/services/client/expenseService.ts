'use client';

import { Expense } from '@/app/types/Expense';
import {
  validateNewExpense,
  validateExpenseUpdate,
  validateExpenseId,
} from '@/app/utils/validators/expenseValidator';
import { getCategoryById } from './categoryService';

const apiRequest = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      ...options,
      // Add cache control headers to prevent caching issues
      headers: {
        ...options?.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const getAllExpenses = async (sortBy?: string): Promise<Expense[]> => {
  const url = sortBy ? `/api/expense?sortBy=${sortBy}` : '/api/expense';

  const response = await apiRequest<{ data: Expense[]; total: number }>(url);
  return response.data;
};

export const getPaginatedExpenses = async (
  page: number,
  itemsPerPage: number,
): Promise<{ data: Expense[]; total: number }> => {
  const url = `/api/expense/page?page=${page}&limit=${itemsPerPage}`;
  return apiRequest<{ data: Expense[]; total: number }>(url);
};

export const addExpense = async (
  expenseData: Omit<Expense, 'id'>,
): Promise<Expense> => {
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

export const updateExpense = async (
  id: number,
  expenseData: Partial<Expense>,
): Promise<Expense | null> => {
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
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const deleteExpense = async (id: number): Promise<boolean> => {
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

export const getExpenseById = async (id: number): Promise<Expense | null> => {
  const idValidation = validateExpenseId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${JSON.stringify(idValidation.errors)}`);
  }

  try {
    return await apiRequest<Expense>(`/api/expense/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const searchExpenses = async (query: string): Promise<Expense[]> => {
  const url = `/api/expense/search?q=${encodeURIComponent(query)}`;
  const response = await apiRequest<{ data: Expense[]; total: number }>(url);
  return response.data;
};

export const sortExpensesByDate = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const sortExpensesByAmount = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => a.amount - b.amount);
};

export const getHighestSpendingCategory = async (
  expensesToAnalyze?: Expense[],
): Promise<string | null> => {
  if (expensesToAnalyze) {
    if (expensesToAnalyze.length === 0) return null;

    // Create a map to store category totals and track category IDs
    const categoryTotals: Record<
      number,
      { total: number; name: string | null }
    > = {};

    // First pass: calculate totals by categoryId and collect names
    for (const expense of expensesToAnalyze) {
      const categoryId = expense.categoryId;
      const categoryName = expense.category?.name || null;

      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = { total: 0, name: categoryName };
      }

      categoryTotals[categoryId].total += expense.amount;

      // Update name if we have it and it wasn't set before
      if (categoryName && !categoryTotals[categoryId].name) {
        categoryTotals[categoryId].name = categoryName;
      }
    }

    let highestCategoryId: number | null = null;
    let highestAmount = 0;

    // Find highest amount
    Object.entries(categoryTotals).forEach(([categoryIdStr, data]) => {
      if (data.total > highestAmount) {
        highestAmount = data.total;
        highestCategoryId = parseInt(categoryIdStr, 10);
      }
    });

    // Return the name of the highest category
    if (highestCategoryId !== null) {
      // If we already have the name, return it
      if (categoryTotals[highestCategoryId].name) {
        return categoryTotals[highestCategoryId].name;
      }

      // Otherwise fetch it
      try {
        const category = await getCategoryById(highestCategoryId);
        return category?.name || null;
      } catch (error) {
        console.error('Error fetching category name:', error);
        return null;
      }
    }

    return null;
  }

  const expenses = await getAllExpenses();
  return getHighestSpendingCategory(expenses);
};

export const getLowestSpendingCategory = async (
  expensesToAnalyze?: Expense[],
): Promise<string | null> => {
  if (expensesToAnalyze) {
    if (expensesToAnalyze.length === 0) return null;

    // Create a map to store category totals and track category IDs
    const categoryTotals: Record<
      number,
      { total: number; name: string | null }
    > = {};

    // First pass: calculate totals by categoryId and collect names
    for (const expense of expensesToAnalyze) {
      const categoryId = expense.categoryId;
      const categoryName = expense.category?.name || null;

      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = { total: 0, name: categoryName };
      }

      categoryTotals[categoryId].total += expense.amount;

      // Update name if we have it and it wasn't set before
      if (categoryName && !categoryTotals[categoryId].name) {
        categoryTotals[categoryId].name = categoryName;
      }
    }

    let lowestCategoryId: number | null = null;
    let lowestAmount = Infinity;

    // Find lowest amount
    Object.entries(categoryTotals).forEach(([categoryIdStr, data]) => {
      if (data.total < lowestAmount) {
        lowestAmount = data.total;
        lowestCategoryId = parseInt(categoryIdStr, 10);
      }
    });

    // Return the name of the lowest category
    if (lowestCategoryId !== null) {
      // If we already have the name, return it
      if (categoryTotals[lowestCategoryId].name) {
        return categoryTotals[lowestCategoryId].name;
      }

      // Otherwise fetch it
      try {
        const category = await getCategoryById(lowestCategoryId);
        return category?.name || null;
      } catch (error) {
        console.error('Error fetching category name:', error);
        return null;
      }
    }

    return null;
  }

  const expenses = await getAllExpenses();
  return getLowestSpendingCategory(expenses);
};
