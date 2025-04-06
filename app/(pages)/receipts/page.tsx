'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import VirtualizedReceiptGrid from '@/app/components/Receipts/VirtualizedReceiptGrid';
import UploadButton from '@/app/components/Receipts/UploadButton';
import { processImage } from '@/app/services/client/imageService';
import { deleteReceipt } from '@/app/services/client/receiptService';
import {
  fetchPaginatedReceipts,
  deleteReceiptViaApi,
  downloadReceiptViaApi,
  createReceiptViaApi,
} from '@/app/services/client/receiptApiService';
import { Receipt } from '@/app/types/Receipt';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  // Load initial receipts
  useEffect(() => {
    loadReceipts(1);
  }, []);

  // Function to load receipts from API
  const loadReceipts = async (page: number) => {
    if (page === 1) {
      setReceipts([]);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPaginatedReceipts(page, ITEMS_PER_PAGE);

      setReceipts((prevReceipts) =>
        page === 1 ? result.data : [...prevReceipts, ...result.data],
      );

      setCurrentPage(page);
      setHasMore(page < result.metadata.totalPages);
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
      setError('Failed to load receipts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load more receipts when scrolling
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadReceipts(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage]);

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true);

      // Process the image
      const imageUrl = await processImage(file);

      const name =
        file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;

      // Create the receipt via API
      const newReceipt = await createReceiptViaApi({
        name,
        url: imageUrl,
        date: new Date().toISOString().split('T')[0],
      });

      // Add the new receipt to the beginning of the list
      setReceipts((prev) => [newReceipt, ...prev]);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to upload receipt', error);
      setError('Failed to upload receipt. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      // Try deleting via API first (for mock receipts)
      await deleteReceiptViaApi(id);

      // Update local state
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== id));

      // Also delete from localStorage if it exists there
      deleteReceipt(id);
    } catch (error) {
      console.error('Failed to delete receipt:', error);
      setError('Failed to delete receipt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (receipt: Receipt) => {
    try {
      await downloadReceiptViaApi(receipt);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      setError('Failed to download receipt. Please try again.');
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-300">Receipts</h1>
          <div className="file-input-wrapper">
            <UploadButton onUpload={handleUpload} />
          </div>
        </div>

        <hr className="my-4 border-gray-300" />

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="h-[calc(100vh-200px)]">
          <VirtualizedReceiptGrid
            receipts={receipts}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        </div>
      </ContentScreen>
    </div>
  );
}
