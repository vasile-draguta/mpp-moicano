'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import ReceiptGrid from '@/app/components/Receipts/ReceiptGrid';
import UploadButton from '@/app/components/Receipts/UploadButton';
import { processImage } from '@/app/services/imageService';
import {
  getReceipts,
  addReceipt,
  deleteReceipt,
  downloadReceipt,
} from '@/app/services/receiptService';
import { Receipt } from '@/app/types/Receipt';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Load receipts on initial render
  useEffect(() => {
    setReceipts(getReceipts());
  }, []);

  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await processImage(file);

      const name =
        file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;

      const newReceipt = addReceipt({
        name,
        url: imageUrl,
        date: new Date().toISOString().split('T')[0],
      });

      setReceipts((prev) => [...prev, newReceipt]);
    } catch (error) {
      console.error('Failed to upload receipt', error);
      alert('Failed to upload receipt. Please try again.');
    }
  };

  const handleDelete = (id: number) => {
    if (deleteReceipt(id)) {
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== id));
    }
  };

  const handleDownload = (receipt: Receipt) => {
    downloadReceipt(receipt);
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

        <ReceiptGrid
          receipts={receipts}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </ContentScreen>
    </div>
  );
}
