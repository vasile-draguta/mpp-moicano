'use client';

import { Receipt } from '@/app/types/Receipt';
import { mockReceipts } from '@/app/utils/mockReceiptData';

const STORAGE_KEY = 'receipts';

export const getReceipts = (): Receipt[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const savedReceipts = localStorage.getItem(STORAGE_KEY);
  if (!savedReceipts) {
    return [];
  }

  try {
    return JSON.parse(savedReceipts);
  } catch (error) {
    console.error('Failed to parse receipts from storage', error);
    return [];
  }
};

export const saveReceipts = (receipts: Receipt[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }
};

export const addReceipt = (receipt: Omit<Receipt, 'id'>): Receipt => {
  const receipts = getReceipts();
  const maxId =
    receipts.length > 0
      ? receipts.reduce((max, receipt) => Math.max(max, receipt.id), 0)
      : mockReceipts.length > 0
        ? mockReceipts.reduce((max, receipt) => Math.max(max, receipt.id), 0)
        : 0;

  const newReceipt = { ...receipt, id: maxId + 1 };

  const updatedReceipts = [...receipts, newReceipt];
  saveReceipts(updatedReceipts);

  return newReceipt;
};

export const deleteReceipt = (id: number): boolean => {
  const receipts = getReceipts();
  const updatedReceipts = receipts.filter((receipt) => receipt.id !== id);

  if (updatedReceipts.length !== receipts.length) {
    saveReceipts(updatedReceipts);
    return true;
  }

  return false;
};

export const downloadReceipt = (receipt: Receipt): void => {
  const link = document.createElement('a');
  link.href = receipt.url;
  link.download = receipt.name || `receipt-${receipt.id}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
