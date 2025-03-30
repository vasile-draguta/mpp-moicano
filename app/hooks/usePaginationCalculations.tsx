'use client';

import { usePagination } from '../context/PaginationContext';

export function usePaginationCalculations() {
  const { currentPage, itemsPerPage, totalItems } = usePagination();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const pageInfoText = `Showing ${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, totalItems)} of ${totalItems} entries`;

  return {
    indexOfLastItem,
    indexOfFirstItem,
    pageInfoText,
  };
}
