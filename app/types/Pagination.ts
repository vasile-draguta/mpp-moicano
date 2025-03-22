import { ReactNode } from 'react';

export interface PaginationContextType {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  handlePageChange: (pageNumber: number) => void;
}

export interface PaginationProviderProps {
  children: ReactNode;
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}
