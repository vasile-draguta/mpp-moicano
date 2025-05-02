'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

const QuickAccessCard = () => {
  return (
    <div className="bg-[#1E1E1E] p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-300 mb-2">Quick Access</h2>
      <div className="flex flex-col space-y-2">
        <Link
          href="/expenses/new"
          className="flex items-center bg-purple-300/10 hover:bg-purple-300/20 text-purple-300 px-3 py-2 rounded text-sm"
        >
          <Plus size={16} className="mr-2" /> Add Expense
        </Link>
        <Link
          href="/expenses?search=open"
          className="flex items-center bg-purple-300/10 hover:bg-purple-300/20 text-purple-300 px-3 py-2 rounded text-sm"
        >
          <Search size={16} className="mr-2" /> Search Expenses
        </Link>
      </div>
    </div>
  );
};

export default QuickAccessCard;
