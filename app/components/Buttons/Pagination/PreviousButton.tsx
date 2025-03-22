'use client';

import { usePagination } from '@/app/context/PaginationContext';

export default function PreviousButton() {
  const { currentPage, handlePageChange } = usePagination();

  return (
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      title="Previous"
      className={`px-3 py-2 rounded ${
        currentPage === 1
          ? 'bg-purple-300/10 text-gray-500 cursor-not-allowed text-sm'
          : 'bg-purple-300/10 text-purple-300 hover:bg-purple-300/20 cursor-pointer text-sm'
      }`}
    >
      Previous
    </button>
  );
}
