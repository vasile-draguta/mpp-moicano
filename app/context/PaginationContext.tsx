'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  PaginationContextType,
  PaginationProviderProps,
} from '@/app/types/Pagination';

const PaginationContext = createContext<PaginationContextType | undefined>(
  undefined,
);

export function PaginationProvider({
  children,
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
}: PaginationProviderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (pageNumber: number): void => {
    setCurrentPage(pageNumber);
  };

  return (
    <PaginationContext.Provider
      value={{
        currentPage,
        totalPages,
        itemsPerPage,
        totalItems,
        handlePageChange,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
}

export function usePagination() {
  const context = useContext(PaginationContext);
  if (context === undefined) {
    throw new Error('usePagination must be used within a PaginationProvider');
  }
  return context;
}
