import { NextResponse } from 'next/server';
import { getLowestSpendingCategory } from '@/app/services/server/expenseService';

export async function GET() {
  const lowestSpendingCategory = getLowestSpendingCategory();
  return NextResponse.json(lowestSpendingCategory);
}
