'use client';

import { usePagination } from '../context/PaginationContext';

export function usePaginationCalculations() {
  const { currentPage, itemsPerPage, totalItems } = usePagination();

  // Calculate current page items range
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Calculate page info text
  const pageInfoText = `Showing ${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, totalItems)} of ${totalItems} entries`;

  return {
    indexOfLastItem,
    indexOfFirstItem,
    pageInfoText,
  };
}
