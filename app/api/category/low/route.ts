'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import { getLowestSpendingCategory } from '@/app/services/server/expenseService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const lowestSpendingCategory = getLowestSpendingCategory();
    res.status(200).json(lowestSpendingCategory);
  }
}
