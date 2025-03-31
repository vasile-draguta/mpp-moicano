'use server';

import {
  getAllExpenses,
  addExpense,
  sortExpensesByDate,
  sortExpensesByAmount,
} from '@/app/services/server/expenseService';
import { ValidationError } from '@/app/utils/errors/ValidationError';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sortBy = url.searchParams.get('sortBy');

  let expenses = await getAllExpenses();

  if (sortBy === 'date') {
    expenses = await sortExpensesByDate(expenses);
  } else if (sortBy === 'amount') {
    expenses = await sortExpensesByAmount(expenses);
  }

  return Response.json({
    data: expenses,
    total: expenses.length,
    sortedBy: sortBy || 'none',
  });
}

export async function POST(req: Request) {
  try {
    const expenseData = await req.json();
    const newExpense = await addExpense(expenseData);
    return Response.json(newExpense, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { errors: error.validationResult.errors },
        { status: 400 },
      );
    }
    return Response.json({ error: 'Failed to add expense' }, { status: 500 });
  }
}
