'use client';

import { expenses as mockExpenses } from '../utils/mockData';
import { Expense } from '@/app/types/Expense';

// Create a copy of the expenses that we can modify
let expenses: Expense[] = [...mockExpenses];

// Get all expenses
export const getAllExpenses = (): Expense[] => {
  return expenses;
};

// Get expenses for a specific page
export const getPaginatedExpenses = (
  page: number,
  itemsPerPage: number,
): { data: Expense[]; total: number } => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    data: expenses.slice(startIndex, endIndex),
    total: expenses.length,
  };
};

// Add a new expense
export const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
  const newId = Math.max(...expenses.map((e) => e.id), 0) + 1;
  const newExpense: Expense = {
    ...expenseData,
    id: newId,
    amount: parseFloat(expenseData.amount.toString()), // Ensure amount is a number
  };

  expenses = [newExpense, ...expenses];
  return newExpense;
};

// Update an expense
export const updateExpense = (
  id: number,
  expenseData: Partial<Expense>,
): Expense | null => {
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
};

// Delete an expense
export const deleteExpense = (id: number): boolean => {
  const initialLength = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);
  return expenses.length < initialLength;
};

// Get an expense by ID
export const getExpenseById = (id: number): Expense | null => {
  const expense = expenses.find((e) => e.id === id);
  return expense || null;
};

// Search for expenses by merchant, descripton, or category
export const searchExpenses = (query: string): Expense[] => {
  const lowerCaseQuery = query.toLowerCase();
  return expenses.filter(
    (e) =>
      e.merchant.toLowerCase().includes(lowerCaseQuery) ||
      e.description.toLowerCase().includes(lowerCaseQuery) ||
      e.category.toLowerCase().includes(lowerCaseQuery),
  );
};
