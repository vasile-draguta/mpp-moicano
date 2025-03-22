'use client';

import { usePagination } from '@/app/context/PaginationContext';
import { usePaginationCalculations } from '@/app/hooks/usePaginationCalculations';
import NextButton from '../Buttons/Pagination/NextButton';
import PreviousButton from '../Buttons/Pagination/PreviousButton';
import PageNumber from '../Buttons/Pagination/PageNumber';

export default function Pagination() {
  const { totalPages } = usePagination();
  const { pageInfoText } = usePaginationCalculations();

  return (
    <div className="flex justify-between items-center mt-20 text-gray-300">
      <div>{pageInfoText}</div>
      <div className="flex space-x-2">
        <PreviousButton />

        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <PageNumber key={i + 1} pageNumber={i + 1} />
          ))}
        </div>

        <NextButton />
      </div>
    </div>
  );
}
