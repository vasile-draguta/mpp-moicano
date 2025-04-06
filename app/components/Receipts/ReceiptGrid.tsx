'use client';

import React from 'react';
import { Receipt } from '@/app/types/Receipt';
import ReceiptCard from './ReceiptCard';

interface ReceiptGridProps {
  receipts: Receipt[];
  onDelete: (id: number) => void;
  onDownload: (receipt: Receipt) => void;
}

const ReceiptGrid: React.FC<ReceiptGridProps> = ({
  receipts,
  onDelete,
  onDownload,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-fr w-full">
      {receipts.map((receipt) => (
        <div key={receipt.id} className="min-w-0">
          <ReceiptCard
            receipt={receipt}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        </div>
      ))}
    </div>
  );
};

export default ReceiptGrid;
