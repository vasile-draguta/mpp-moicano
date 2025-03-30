import { Expense } from './Expense';

export interface SortOptions {
  field: 'date' | 'amount' | null;
  order: 'asc' | 'desc';
}

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
