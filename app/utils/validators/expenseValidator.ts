import { Expense } from '@/app/types/Expense';

// Define validation error type
export type ValidationError = {
  field: string;
  message: string;
};

// Define expense validation result
export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// Categories allowed for expenses
const VALID_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Other',
];

/**
 * Validates a new expense before creation
 */
export const validateNewExpense = (
  expense: Omit<Expense, 'id'>,
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields validation
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

  if (!expense.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!VALID_CATEGORIES.includes(expense.category)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  // Date validation
  if (!expense.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    const dateObj = new Date(expense.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }

    // Check if date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (dateObj > today) {
      errors.push({ field: 'date', message: 'Date cannot be in the future' });
    }
  }

  // Amount validation
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

/**
 * Validates expense updates
 */
export const validateExpenseUpdate = (
  expenseUpdate: Partial<Expense>,
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate optional fields if they exist
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

  if (expenseUpdate.category !== undefined) {
    if (expenseUpdate.category.trim() === '') {
      errors.push({ field: 'category', message: 'Category cannot be empty' });
    } else if (!VALID_CATEGORIES.includes(expenseUpdate.category)) {
      errors.push({
        field: 'category',
        message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }
  }

  if (expenseUpdate.date !== undefined) {
    const dateObj = new Date(expenseUpdate.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    }

    // Check if date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
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

/**
 * Validates expense ID
 */
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
