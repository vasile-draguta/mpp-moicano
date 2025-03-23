import { RefObject } from 'react';
import { Expense } from './Expense';

// Search button interfaces
export interface SearchButtonProps {
  onSearchResults: (results: Expense[]) => void;
}

export interface SearchFieldProps {
  onSearchResults: (results: Expense[]) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

// Expense management button interfaces
export interface DeleteExpenseButtonProps {
  expenseId: number;
  onDelete?: () => void;
}

export interface EditExpenseButtonProps {
  expenseId: number;
}

// Pagination button interfaces
export interface PageNumberProps {
  number: number;
  active: boolean;
  onClick: () => void;
}
