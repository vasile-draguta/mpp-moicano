'use server';

import {
  updateExpense,
  deleteExpense,
  getExpenseById,
} from '@/app/services/server/expenseService';
import { ValidationError } from '@/app/utils/errors/ValidationError';
import { NextRequest } from 'next/server';

// Get a specific expense by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const expense = await getExpenseById(Number(id));

    if (!expense) {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }

    return Response.json(expense);
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { errors: error.validationResult.errors },
        { status: 400 },
      );
    }
    return Response.json({ error: 'Failed to get expense' }, { status: 500 });
  }
}

// Update an expense
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const expenseData = await req.json();

    const updatedExpense = await updateExpense(Number(id), expenseData);

    if (!updatedExpense) {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }

    return Response.json(updatedExpense);
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { errors: error.validationResult.errors },
        { status: 400 },
      );
    }
    return Response.json(
      { error: 'Failed to update expense' },
      { status: 500 },
    );
  }
}

// Delete an expense
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteExpense(Number(id));

    if (!deleted) {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { errors: error.validationResult.errors },
        { status: 400 },
      );
    }
    return Response.json(
      { error: 'Failed to delete expense' },
      { status: 500 },
    );
  }
}
