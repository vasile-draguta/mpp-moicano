'use client';

import { expenses } from '@/app/utils/mockData';
import { PaginationProvider } from '@/app/context/PaginationContext';
import Pagination from '../Pagination/Pagination';
import { usePagination } from '@/app/context/PaginationContext';

const ExpensesTableContent = () => {
  const { currentPage, itemsPerPage } = usePagination();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Date
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Merchant
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Description
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-lg text-gray-400 font-bold">
                Category
              </th>
              <th className=""></th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((expense, index) => (
              <tr
                key={expense.id}
                className={`${
                  index % 2 === 0 ? 'bg-[#1E1E1E]' : 'bg-[#878585]/50'
                } transition-colors hover:bg-purple-300/50`}
              >
                <td className="px-6 py-5 text-gray-300">{expense.date}</td>
                <td className="px-6 py-5 text-gray-300">{expense.merchant}</td>
                <td className="px-6 py-5 text-gray-300">
                  {expense.description}
                </td>
                <td className="px-6 py-5 text-gray-300">
                  {formatter.format(expense.amount)}
                </td>
                <td className="px-6 py-5 text-gray-300">{expense.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination />
    </>
  );
};

export default function ExpensesTable() {
  return (
    <div className="w-full">
      <PaginationProvider
        totalItems={expenses.length}
        itemsPerPage={10}
        initialPage={1}
      >
        <ExpensesTableContent />
      </PaginationProvider>
    </div>
  );
}
