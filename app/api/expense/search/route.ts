'use server';

import { searchExpenses } from '@/app/services/server/expenseService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const query = searchParams.get('q');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  if (!query) {
    return Response.json(
      { error: 'Search query is required' },
      { status: 400 },
    );
  }

  const searchResults = await searchExpenses(query);

  if (page && limit) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (!isNaN(pageNum) && !isNaN(limitNum)) {
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      return Response.json({
        data: searchResults.slice(startIndex, endIndex),
        total: searchResults.length,
        page: pageNum,
        limit: limitNum,
      });
    }
  }

  return Response.json({
    data: searchResults,
    total: searchResults.length,
  });
}
