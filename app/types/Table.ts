import { Expense } from './Expense';

// Sort options for the ExpensesTable component
export interface SortOptions {
  field: 'date' | 'amount' | null;
  order: 'asc' | 'desc';
}

// Interfaces for ExpensesTable components
export interface ExpensesTableProps {
  searchResults: Expense[] | null;
}

export interface ExpensesTableContentProps {
  expenses: Expense[];
  onRefresh: () => void;
  onSort: (field: SortOptions['field'], order: SortOptions['order']) => void;
  sortField: SortOptions['field'];
  sortOrder: SortOptions['order'];
}
