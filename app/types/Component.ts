import { ReactNode } from 'react';
import { Expense } from './Expense';

export interface ContentScreenProps {
  children: ReactNode;
}

export interface AvatarProps {
  src: string;
  alt?: string;
  username?: string;
}

export interface ExpenseFormProps {
  initialData?: Expense | null;
  onSuccess?: () => void;
}

export interface ExpenseFormData {
  date: string;
  merchant: string;
  description: string;
  amount: number;
  category: string;
}
