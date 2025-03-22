'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PaginationContextType = {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  handlePageChange: (pageNumber: number) => void;
};

const PaginationContext = createContext<PaginationContextType | undefined>(
  undefined,
);

interface PaginationProviderProps {
  children: ReactNode;
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

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
