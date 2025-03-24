import { describe, it, expect, afterEach } from 'bun:test';
import {
  getAllExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  searchExpenses,
  sortExpensesByDate,
  sortExpensesByAmount,
  getHighestSpendingCategory,
} from '@/app/services/expenseService';
import { Expense } from '@/app/types/Expense';

describe('Expense Service', () => {
  // Keep track of all expenses added during tests
  const addedExpenseIds: number[] = [];

  afterEach(() => {
    // Clean up by removing any expenses added during tests
    for (const id of addedExpenseIds) {
      deleteExpense(id);
    }
    addedExpenseIds.length = 0; // Clear the array
  });

  describe('getAllExpenses', () => {
    it('should return all expenses', () => {
      const expenses = getAllExpenses();
      expect(Array.isArray(expenses)).toBe(true);
      expect(expenses.length).toBeGreaterThan(0);
    });
  });

  describe('getExpenseById', () => {
    it('should return an expense by ID', () => {
      const expenses = getAllExpenses();
      const testId = expenses[0].id;

      const expense = getExpenseById(testId);
      expect(expense).not.toBeNull();
      expect(expense?.id).toBe(testId);
    });

    it('should return null for non-existent ID', () => {
      const nonExistentId = 999999;
      const expense = getExpenseById(nonExistentId);
      expect(expense).toBeNull();
    });
  });

  describe('addExpense', () => {
    it('should add a new expense', () => {
      const initialCount = getAllExpenses().length;

      const newExpense: Omit<Expense, 'id'> = {
        date: '2023-10-15',
        description: 'Test Expense',
        amount: 99.99,
        category: 'Test',
        merchant: 'Test Merchant',
      };

      const addedExpense = addExpense(newExpense);
      addedExpenseIds.push(addedExpense.id); // Track for cleanup

      const afterCount = getAllExpenses().length;

      expect(afterCount).toBe(initialCount + 1);
      expect(addedExpense.id).toBeDefined();
      expect(addedExpense.description).toBe(newExpense.description);
      expect(addedExpense.amount).toBe(newExpense.amount);

      // Verify the expense was actually added to the collection
      const retrievedExpense = getExpenseById(addedExpense.id);
      expect(retrievedExpense).not.toBeNull();
      expect(retrievedExpense?.description).toBe(newExpense.description);
    });
  });

  describe('updateExpense', () => {
    it('should update an existing expense', () => {
      // Add a test expense we can safely modify
      const newExpense: Omit<Expense, 'id'> = {
        date: '2023-10-15',
        description: 'Original Description',
        amount: 99.99,
        category: 'Test',
        merchant: 'Test Merchant',
      };

      const addedExpense = addExpense(newExpense);
      addedExpenseIds.push(addedExpense.id); // Track for cleanup

      const updateData: Partial<Expense> = {
        description: 'Updated Description',
        amount: 150.5,
      };

      const updatedExpense = updateExpense(addedExpense.id, updateData);
      expect(updatedExpense).not.toBeNull();

      // Only proceed with these checks if updatedExpense is not null
      if (updatedExpense) {
        expect(updatedExpense.id).toBe(addedExpense.id);
        expect(updatedExpense.description).toBe(updateData.description!);
        expect(updatedExpense.amount).toBe(updateData.amount!);

        // Verify the update persisted
        const retrievedExpense = getExpenseById(addedExpense.id);
        expect(retrievedExpense).not.toBeNull();

        if (retrievedExpense) {
          expect(retrievedExpense.description).toBe(updateData.description!);
          expect(retrievedExpense.amount).toBe(updateData.amount!);
        }
      }
    });

    it('should return null when updating a non-existent expense', () => {
      const nonExistentId = 999999;
      const updateData: Partial<Expense> = {
        description: 'This should not update',
      };

      const result = updateExpense(nonExistentId, updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteExpense', () => {
    it('should delete an existing expense', () => {
      // Add a test expense we can safely delete
      const newExpense: Omit<Expense, 'id'> = {
        date: '2023-10-15',
        description: 'To Be Deleted',
        amount: 99.99,
        category: 'Test',
        merchant: 'Test Merchant',
      };

      const addedExpense = addExpense(newExpense);
      const initialCount = getAllExpenses().length;

      const result = deleteExpense(addedExpense.id);
      const afterCount = getAllExpenses().length;

      expect(result).toBe(true);
      expect(afterCount).toBe(initialCount - 1);

      // Verify it was actually deleted
      const retrievedExpense = getExpenseById(addedExpense.id);
      expect(retrievedExpense).toBeNull();
    });

    it('should return false when deleting a non-existent expense', () => {
      const nonExistentId = 999999;
      const initialCount = getAllExpenses().length;

      const result = deleteExpense(nonExistentId);
      const afterCount = getAllExpenses().length;

      expect(result).toBe(false);
      expect(afterCount).toBe(initialCount);
    });
  });

  describe('searchExpenses', () => {
    it('should find expenses matching search query', () => {
      // Add a test expense that we can reliably search for
      const uniqueDescription = 'UniqueTestDescriptionXYZ';
      const newExpense: Omit<Expense, 'id'> = {
        date: '2023-10-15',
        description: uniqueDescription,
        amount: 99.99,
        category: 'Test',
        merchant: 'Test Merchant',
      };

      const addedExpense = addExpense(newExpense);
      addedExpenseIds.push(addedExpense.id); // Track for cleanup

      const results = searchExpenses(uniqueDescription);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].description).toBe(uniqueDescription);
    });

    it('should return empty array when no matches found', () => {
      const noMatchQuery = 'ThisQueryShouldNotMatchAnything12345';
      const results = searchExpenses(noMatchQuery);
      expect(results.length).toBe(0);
    });
  });

  describe('sortExpensesByDate', () => {
    it('should sort expenses by date', () => {
      const expenses = getAllExpenses();
      const sorted = sortExpensesByDate(expenses);

      // Check that the array is sorted by date in descending order
      for (let i = 0; i < sorted.length - 1; i++) {
        const date1 = new Date(sorted[i].date).getTime();
        const date2 = new Date(sorted[i + 1].date).getTime();
        expect(date1).toBeGreaterThanOrEqual(date2);
      }
    });
  });

  describe('sortExpensesByAmount', () => {
    it('should sort expenses by amount', () => {
      const expenses = getAllExpenses();
      const sorted = sortExpensesByAmount(expenses);

      // Check that the array is sorted by amount in ascending order
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].amount).toBeLessThanOrEqual(sorted[i + 1].amount);
      }
    });
  });

  describe('getHighestSpendingCategory', () => {
    it('should return the category with the highest total spending', () => {
      // Create test expenses with known categories and amounts
      const testExpenses: Omit<Expense, 'id'>[] = [
        {
          date: '2023-01-01',
          description: 'Test 1',
          amount: 100,
          category: 'CategoryA',
          merchant: 'Test',
        },
        {
          date: '2023-01-02',
          description: 'Test 2',
          amount: 200,
          category: 'CategoryA',
          merchant: 'Test',
        },
        {
          date: '2023-01-03',
          description: 'Test 3',
          amount: 50,
          category: 'CategoryB',
          merchant: 'Test',
        },
        {
          date: '2023-01-04',
          description: 'Test 4',
          amount: 150,
          category: 'CategoryB',
          merchant: 'Test',
        },
        {
          date: '2023-01-05',
          description: 'Test 5',
          amount: 400,
          category: 'CategoryC',
          merchant: 'Test',
        },
      ];

      // Add our test expenses and track for cleanup
      const addedExpenses: Expense[] = [];
      for (const expense of testExpenses) {
        const added = addExpense(expense);
        addedExpenseIds.push(added.id);
        addedExpenses.push(added);
      }

      const highestCategory = getHighestSpendingCategory(addedExpenses);
      expect(highestCategory).toBe('CategoryC'); // CategoryC has the highest total (400)
    });

    it('should return null for empty expense list', () => {
      const highestCategory = getHighestSpendingCategory([]);
      expect(highestCategory).toBeNull();
    });
  });
});
