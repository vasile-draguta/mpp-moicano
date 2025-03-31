'use server';

import { getPaginatedExpenses } from '@/app/services/server/expenseService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    return Response.json(
      { error: 'Invalid pagination parameters' },
      { status: 400 },
    );
  }

  const paginatedResults = await getPaginatedExpenses(pageNum, limitNum);

  return Response.json({
    data: paginatedResults.data,
    total: paginatedResults.total,
    page: pageNum,
    limit: limitNum,
  });
}
