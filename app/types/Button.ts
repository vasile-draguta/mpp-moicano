import { RefObject } from 'react';
import { Expense } from './Expense';

export interface SearchButtonProps {
  onSearchResults: (results: Expense[]) => void;
}

export interface SearchFieldProps {
  onSearchResults: (results: Expense[]) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface DeleteExpenseButtonProps {
  expenseId: number;
  onDelete?: () => void;
}

export interface EditExpenseButtonProps {
  expenseId: number;
}

export interface PageNumberProps {
  number: number;
  active: boolean;
  onClick: () => void;
}
