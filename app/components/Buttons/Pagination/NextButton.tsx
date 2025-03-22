'use client';

import { usePagination } from '@/app/context/PaginationContext';

export default function NextButton() {
  const { currentPage, totalPages, handlePageChange } = usePagination();

  return (
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      title="Next"
      className={`px-3 py-2 rounded ${
        currentPage === totalPages
          ? 'bg-purple-300/10 text-gray-500 cursor-not-allowed text-sm'
          : 'bg-purple-300/10 text-purple-300 hover:bg-purple-300/20 cursor-pointer text-sm'
      }`}
    >
      Next
    </button>
  );
}
