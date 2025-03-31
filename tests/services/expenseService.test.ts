import { describe, test, expect, beforeEach, mock } from 'bun:test';
import {
  getAllExpenses,
  getPaginatedExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseById,
  searchExpenses,
  sortExpensesByDate,
  sortExpensesByAmount,
  getHighestSpendingCategory,
  getLowestSpendingCategory,
} from '@/app/services/server/expenseService';
import { ValidationError } from '@/app/utils/errors/ValidationError';
import { Expense } from '@/app/types/Expense';

// Mock data for testing
const mockExpenses: Expense[] = [
  {
    id: 1,
    date: '2023-01-15',
    merchant: 'Grocery Store',
    description: 'Weekly groceries',
    amount: 75.5,
    category: 'Food',
  },
  {
    id: 2,
    date: '2023-01-20',
    merchant: 'Gas Station',
    description: 'Fuel',
    amount: 45.0,
    category: 'Transportation',
  },
  {
    id: 3,
    date: '2023-01-25',
    merchant: 'Pharmacy',
    description: 'Medications',
    amount: 32.75,
    category: 'Healthcare',
  },
  {
    id: 4,
    date: '2023-02-01',
    merchant: 'Bookstore',
    description: 'Books',
    amount: 60.25,
    category: 'Education',
  },
  {
    id: 5,
    date: '2023-02-05',
    merchant: 'Restaurant',
    description: 'Dinner',
    amount: 85.0,
    category: 'Food',
  },
];

// Mock the module's expenses to reset between tests
mock.module('@/app/utils/mockData', () => ({
  expenses: [...mockExpenses],
}));

describe('Expense Service', () => {
  // Reset expenses before each test to ensure test isolation
  beforeEach(async () => {
    // Force a clean state by getting all expenses and manipulating them
    const allExpenses = await getAllExpenses();
    // Clear existing expenses by filtering to empty array
    allExpenses.length = 0;
    // Add back our test data
    mockExpenses.forEach((expense) => allExpenses.push(expense));
  });

  describe('getAllExpenses', () => {
    test('should return all expenses', async () => {
      const expenses = await getAllExpenses();
      expect(expenses.length).toBe(5);
      expect(expenses).toEqual(mockExpenses);
    });
  });

  describe('getPaginatedExpenses', () => {
    test('should return paginated expenses', async () => {
      const result = await getPaginatedExpenses(1, 2);
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(5);
      expect(result.data[0].id).toBe(1);
      expect(result.data[1].id).toBe(2);
    });

    test('should return second page of expenses', async () => {
      const result = await getPaginatedExpenses(2, 2);
      expect(result.data.length).toBe(2);
      expect(result.data[0].id).toBe(3);
      expect(result.data[1].id).toBe(4);
    });

    test('should throw error for invalid pagination parameters', async () => {
      await expect(getPaginatedExpenses(0, 10)).rejects.toThrow(
        'Invalid pagination parameters',
      );
      await expect(getPaginatedExpenses(1, 0)).rejects.toThrow(
        'Invalid pagination parameters',
      );
    });
  });

  describe('addExpense', () => {
    test('should add a new expense', async () => {
      const newExpense = {
        date: '2023-02-10',
        merchant: 'Electronics Store',
        description: 'New headphones',
        amount: 120.0,
        category: 'Shopping',
      };

      const result = await addExpense(newExpense);
      expect(result.id).toBeDefined();
      expect(result.merchant).toBe('Electronics Store');

      const allExpenses = await getAllExpenses();
      expect(allExpenses.length).toBe(6);
    });

    test('should throw validation error for invalid expense data', async () => {
      const invalidExpense = {
        date: '2023-02-10',
        merchant: '', // Invalid: empty merchant
        description: 'New headphones',
        amount: 120.0,
        category: 'Shopping',
      } as Omit<Expense, 'id'>;

      await expect(addExpense(invalidExpense)).rejects.toBeInstanceOf(
        ValidationError,
      );
    });
  });

  describe('updateExpense', () => {
    test('should update an existing expense', async () => {
      const updateData = {
        amount: 90.0,
        description: 'Updated description',
      };

      const result = await updateExpense(1, updateData);
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(90.0);
      expect(result?.description).toBe('Updated description');

      // Verify other fields weren't changed
      expect(result?.merchant).toBe('Grocery Store');
    });

    test('should return null for non-existent expense ID', async () => {
      const result = await updateExpense(999, { amount: 100 });
      expect(result).toBeNull();
    });

    test('should throw validation error for invalid update data', async () => {
      const invalidUpdate = {
        merchant: '', // Invalid: empty merchant
      };

      await expect(updateExpense(1, invalidUpdate)).rejects.toBeInstanceOf(
        ValidationError,
      );
    });
  });

  describe('deleteExpense', () => {
    test('should delete an existing expense', async () => {
      const result = await deleteExpense(1);
      expect(result).toBe(true);

      const allExpenses = await getAllExpenses();
      expect(allExpenses.length).toBe(4);
      expect(allExpenses.find((e) => e.id === 1)).toBeUndefined();
    });

    test('should return false for non-existent expense ID', async () => {
      const result = await deleteExpense(999);
      expect(result).toBe(false);
    });

    test('should throw validation error for invalid ID', async () => {
      await expect(deleteExpense(-1)).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe('getExpenseById', () => {
    test('should return expense with matching ID', async () => {
      const expense = await getExpenseById(2);
      expect(expense).not.toBeNull();
      expect(expense?.id).toBe(2);
      expect(expense?.merchant).toBe('Gas Station');
    });

    test('should return null for non-existent ID', async () => {
      const expense = await getExpenseById(999);
      expect(expense).toBeNull();
    });

    test('should throw validation error for invalid ID', async () => {
      await expect(getExpenseById(-1)).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe('searchExpenses', () => {
    test('should return expenses matching search term in merchant', async () => {
      const results = await searchExpenses('grocery');
      expect(results.length).toBe(1);
      expect(results[0].merchant).toBe('Grocery Store');
    });

    test('should return expenses matching search term in description', async () => {
      const results = await searchExpenses('book');
      expect(results.length).toBe(1);
      expect(results[0].description).toBe('Books');
    });

    test('should return expenses matching search term in category', async () => {
      const results = await searchExpenses('food');
      expect(results.length).toBe(2);
      expect(results[0].category).toBe('Food');
      expect(results[1].category).toBe('Food');
    });

    test('should return empty array for no matches', async () => {
      const results = await searchExpenses('nonexistent');
      expect(results.length).toBe(0);
    });

    test('should throw error for empty search term', async () => {
      await expect(searchExpenses('')).rejects.toThrow(
        'Search query cannot be empty',
      );
    });
  });

  describe('sortExpensesByDate', () => {
    test('should sort expenses by date in descending order', async () => {
      const sorted = await sortExpensesByDate(await getAllExpenses());
      expect(sorted[0].date).toBe('2023-02-05'); // Most recent date first
      expect(sorted[4].date).toBe('2023-01-15'); // Oldest date last
    });
  });

  describe('sortExpensesByAmount', () => {
    test('should sort expenses by amount in ascending order', async () => {
      const sorted = await sortExpensesByAmount(await getAllExpenses());
      expect(sorted[0].amount).toBe(32.75); // Lowest amount first
      expect(sorted[4].amount).toBe(85.0); // Highest amount last
    });
  });

  describe('getHighestSpendingCategory', () => {
    test('should return category with highest total spending', async () => {
      const category = await getHighestSpendingCategory(await getAllExpenses());
      expect(category).toBe('Food'); // Food: 75.5 + 85.0 = 160.5
    });

    test('should return null for empty expense list', async () => {
      const category = await getHighestSpendingCategory([]);
      expect(category).toBeNull();
    });
  });

  describe('getLowestSpendingCategory', () => {
    test('should return category with lowest total spending', async () => {
      const category = await getLowestSpendingCategory(await getAllExpenses());
      // Healthcare: 32.75 is the lowest
      expect(category).toBe('Healthcare');
    });

    test('should return null for empty expense list', async () => {
      const category = await getLowestSpendingCategory([]);
      expect(category).toBeNull();
    });
  });
});
