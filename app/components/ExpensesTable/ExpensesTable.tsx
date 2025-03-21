'use client';

import { useState } from 'react';

import { expenses } from '@/app/utils/mockData';

export default function ExpensesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number): void => {
    setCurrentPage(pageNumber);
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="w-full">
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

      <div className="flex justify-between items-center mt-20 text-gray-300">
        <div>
          Showing {indexOfFirstItem + 1} to{' '}
          {Math.min(indexOfLastItem, expenses.length)} of {expenses.length}{' '}
          entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous"
            className={`px-3 py-2 rounded ${
              currentPage === 1
                ? 'bg-purple-300/10 text-gray-500 cursor-not-allowed'
                : 'bg-purple-300/10 text-purple-300 hover:bg-purple-300/20 cursor-pointer'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                title={`Go to page ${i + 1}`}
                className={`px-3 py-2 rounded w-10 h-10 ${
                  currentPage === i + 1
                    ? 'bg-purple-300 text-black'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-purple-300/20 cursor-pointer'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next"
            className={`px-3 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-purple-300/10 text-gray-500 cursor-not-allowed'
                : 'bg-purple-300/10 text-purple-300 hover:bg-purple-300/20 cursor-pointer'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
