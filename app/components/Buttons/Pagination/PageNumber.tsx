'use client';

import { usePagination } from '@/app/context/PaginationContext';

interface PageNumberProps {
  pageNumber: number;
}

export default function PageNumber({ pageNumber }: PageNumberProps) {
  const { currentPage, handlePageChange } = usePagination();

  const isActive = currentPage === pageNumber;

  return (
    <button
      onClick={() => handlePageChange(pageNumber)}
      title={`Go to page ${pageNumber}`}
      className={`px-3 py-2 rounded w-10 h-10 ${
        isActive
          ? 'bg-purple-300 text-black text-sm'
          : 'bg-[#1E1E1E] text-gray-300 hover:bg-purple-300/20 cursor-pointer text-sm'
      }`}
    >
      {pageNumber}
    </button>
  );
}
