'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import { getHighestSpendingCategory } from '@/app/services/server/expenseService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const category = getHighestSpendingCategory();
    res.status(200).json(category);
  }
}
