import { Expense } from '@/app/types/Expense';

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

const VALID_CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Map of category IDs to names for validation messages
const CATEGORY_ID_TO_NAME: Record<number, string> = {
  1: 'Food',
  2: 'Transportation',
  3: 'Housing',
  4: 'Utilities',
  5: 'Entertainment',
  6: 'Healthcare',
  7: 'Shopping',
  8: 'Education',
  9: 'Travel',
  10: 'Other',
};

// Map of category names to IDs for backwards compatibility
const CATEGORY_NAME_TO_ID: Record<string, number> = {
  Food: 1,
  Transportation: 2,
  Housing: 3,
  Utilities: 4,
  Entertainment: 5,
  Healthcare: 6,
  Shopping: 7,
  Education: 8,
  Travel: 9,
  Other: 10,
  'Food & Dining': 1,
  'Health & Fitness': 6,
  'Gifts & Donations': 10,
};

// Helper function to get category ID from name
export function getCategoryIdFromName(name: string): number | undefined {
  return CATEGORY_NAME_TO_ID[name];
}

export const validateNewExpense = (
  expense: Omit<Expense, 'id'>,
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!expense.merchant || expense.merchant.trim() === '') {
    errors.push({ field: 'merchant', message: 'Merchant is required' });
  } else if (expense.merchant.length > 100) {
    errors.push({
      field: 'merchant',
      message: 'Merchant name cannot exceed 100 characters',
    });
  }

  if (!expense.description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (expense.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description cannot exceed 500 characters',
    });
  }

  if (!expense.categoryId) {
    errors.push({ field: 'categoryId', message: 'Category is required' });
  } else if (!VALID_CATEGORY_IDS.includes(expense.categoryId)) {
    errors.push({
      field: 'categoryId',
      message: `Category must be one of: ${Object.values(CATEGORY_ID_TO_NAME).join(', ')}`,
    });
  }

  if (!expense.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    const dateObj = new Date(expense.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) {
      errors.push({ field: 'date', message: 'Date cannot be in the future' });
    }
  }

  if (expense.amount === undefined || expense.amount === null) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else {
    const amount = Number(expense.amount);
    if (isNaN(amount)) {
      errors.push({ field: 'amount', message: 'Amount must be a number' });
    } else if (amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be greater than 0',
      });
    } else if (amount > 1000000) {
      errors.push({
        field: 'amount',
        message: 'Amount cannot exceed 1,000,000',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateExpenseUpdate = (
  expenseUpdate: Partial<Expense>,
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (expenseUpdate.id !== undefined) {
    errors.push({ field: 'id', message: 'ID cannot be updated' });
  }

  if (expenseUpdate.merchant !== undefined) {
    if (expenseUpdate.merchant.trim() === '') {
      errors.push({ field: 'merchant', message: 'Merchant cannot be empty' });
    } else if (expenseUpdate.merchant.length > 100) {
      errors.push({
        field: 'merchant',
        message: 'Merchant name cannot exceed 100 characters',
      });
    }
  }

  if (expenseUpdate.description !== undefined) {
    if (expenseUpdate.description.trim() === '') {
      errors.push({
        field: 'description',
        message: 'Description cannot be empty',
      });
    } else if (expenseUpdate.description.length > 500) {
      errors.push({
        field: 'description',
        message: 'Description cannot exceed 500 characters',
      });
    }
  }

  if (expenseUpdate.categoryId !== undefined) {
    if (!VALID_CATEGORY_IDS.includes(expenseUpdate.categoryId)) {
      errors.push({
        field: 'categoryId',
        message: `Category must be one of: ${Object.values(CATEGORY_ID_TO_NAME).join(', ')}`,
      });
    }
  }

  if (expenseUpdate.date !== undefined) {
    const dateObj = new Date(expenseUpdate.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) {
      errors.push({ field: 'date', message: 'Date cannot be in the future' });
    }
  }

  if (expenseUpdate.amount !== undefined) {
    const amount = Number(expenseUpdate.amount);
    if (isNaN(amount)) {
      errors.push({ field: 'amount', message: 'Amount must be a number' });
    } else if (amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be greater than 0',
      });
    } else if (amount > 1000000) {
      errors.push({
        field: 'amount',
        message: 'Amount cannot exceed 1,000,000',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateExpenseId = (
  id: number | string | undefined | null,
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (id === undefined || id === null) {
    errors.push({ field: 'id', message: 'ID is required' });
  } else {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      errors.push({ field: 'id', message: 'ID must be a positive number' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
