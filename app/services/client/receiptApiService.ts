'use client';

import { Receipt } from '@/app/types/Receipt';

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export const fetchPaginatedReceipts = async (
  page: number,
  limit: number,
): Promise<PaginatedResponse<Receipt>> => {
  try {
    const response = await fetch(`/api/receipt?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    throw error;
  }
};

export const fetchReceiptById = async (id: number): Promise<Receipt> => {
  try {
    const response = await fetch(`/api/receipt?id=${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch receipt ID ${id}:`, error);
    throw error;
  }
};

/**
 * Download a receipt via the API
 */
export const downloadReceiptViaApi = async (
  receipt: Receipt,
): Promise<void> => {
  try {
    // Use the dedicated image endpoint for downloading
    window.open(`/api/receipt/image?id=${receipt.id}`, '_blank');
  } catch (error) {
    console.error('Failed to download receipt:', error);
    throw error;
  }
};

export const deleteReceiptViaApi = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/receipt?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to delete receipt: ${response.statusText}`,
      );
    }

    return true;
  } catch (error) {
    console.error('Failed to delete receipt:', error);
    throw error;
  }
};

/**
 * Create a new receipt via the API
 */
export const createReceiptViaApi = async (
  receiptData: Omit<Receipt, 'id'>,
): Promise<Receipt> => {
  try {
    const response = await fetch('/api/receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to create receipt: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create receipt:', error);
    throw error;
  }
};
