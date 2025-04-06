'use client';

import { Receipt } from '@/app/types/Receipt';

const STORAGE_KEY = 'receipts';

const initialReceipts: Receipt[] = [
  {
    id: 1,
    name: 'Grocery receipt',
    url: 'https://via.placeholder.com/100x150/333333/CCCCCC?text=Receipt',
    date: '2023-04-01',
  },
  {
    id: 2,
    name: 'Restaurant bill',
    url: 'https://via.placeholder.com/100x150/333333/CCCCCC?text=Receipt',
    date: '2023-04-05',
  },
  {
    id: 3,
    name: 'Gas station',
    url: 'https://via.placeholder.com/100x150/333333/CCCCCC?text=Receipt',
    date: '2023-04-10',
  },
  {
    id: 4,
    name: 'Coffee shop',
    url: 'https://via.placeholder.com/100x150/333333/CCCCCC?text=Receipt',
    date: '2023-04-12',
  },
  {
    id: 5,
    name: 'Pharmacy',
    url: 'https://via.placeholder.com/100x150/333333/CCCCCC?text=Receipt',
    date: '2023-04-15',
  },
  {
    id: 6,
    name: 'Hardware store',
    url: 'https://via.placeholder.com/100x150/333333/CCCCCC?text=Receipt',
    date: '2023-04-18',
  },
];

/**
 * Get all receipts from storage, or initialize with defaults
 */
export const getReceipts = (): Receipt[] => {
  if (typeof window === 'undefined') {
    return initialReceipts;
  }

  const savedReceipts = localStorage.getItem(STORAGE_KEY);
  if (!savedReceipts) {
    saveReceipts(initialReceipts);
    return initialReceipts;
  }

  try {
    return JSON.parse(savedReceipts);
  } catch (error) {
    console.error('Failed to parse receipts from storage', error);
    return initialReceipts;
  }
};

/**
 * Save receipts to storage
 */
export const saveReceipts = (receipts: Receipt[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }
};

/**
 * Add a new receipt
 */
export const addReceipt = (receipt: Omit<Receipt, 'id'>): Receipt => {
  const receipts = getReceipts();
  // Find the highest ID and increment by 1
  const maxId = receipts.reduce((max, receipt) => Math.max(max, receipt.id), 0);
  const newReceipt = { ...receipt, id: maxId + 1 };

  const updatedReceipts = [...receipts, newReceipt];
  saveReceipts(updatedReceipts);

  return newReceipt;
};

/**
 * Delete a receipt
 */
export const deleteReceipt = (id: number): boolean => {
  const receipts = getReceipts();
  const updatedReceipts = receipts.filter((receipt) => receipt.id !== id);

  if (updatedReceipts.length !== receipts.length) {
    saveReceipts(updatedReceipts);
    return true;
  }

  return false;
};

/**
 * Create a download for a receipt
 */
export const downloadReceipt = (receipt: Receipt): void => {
  const link = document.createElement('a');
  link.href = receipt.url;
  link.download = receipt.name || `receipt-${receipt.id}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
