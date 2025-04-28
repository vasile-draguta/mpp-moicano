export interface Category {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  categoryId: number;
  category?: Category;
  merchant: string;
}
