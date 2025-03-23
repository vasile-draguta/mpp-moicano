import { ReactNode } from 'react';
import { Expense } from './Expense';

// General component interfaces
export interface ContentScreenProps {
  children: ReactNode;
}

export interface AvatarProps {
  src: string;
  alt?: string;
  username?: string;
}

// Form interfaces and types
export interface ExpenseFormProps {
  initialData?: Expense | null;
  onSuccess?: () => void;
}

// This can be moved when you have a schema definition file
export interface ExpenseFormData {
  date: string;
  merchant: string;
  description: string;
  amount: number;
  category: string;
}
