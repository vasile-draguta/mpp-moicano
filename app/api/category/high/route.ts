import { NextResponse } from 'next/server';
import { getHighestSpendingCategory } from '@/app/services/server/expenseService';

export async function GET() {
  const category = getHighestSpendingCategory();
  return NextResponse.json(category);
}
