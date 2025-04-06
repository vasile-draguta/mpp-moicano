'use client';

import React from 'react';
import { Download, X } from 'lucide-react';
import { Receipt } from '@/app/types/Receipt';
import Image from 'next/image';

interface ReceiptCardProps {
  receipt: Receipt;
  onDelete: (id: number) => void;
  onDownload: (receipt: Receipt) => void;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onDelete,
  onDownload,
}) => {
  return (
    <div className="relative group h-full w-full">
      <div className="bg-purple-300/20 rounded-md overflow-hidden shadow-md w-full h-full flex flex-col">
        <div
          className="w-full flex-grow overflow-hidden bg-purple-300/20 flex items-center justify-center relative"
          style={{ aspectRatio: '3/4' }}
        >
          <Image
            src={receipt.url}
            alt={receipt.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-2 flex flex-col justify-between">
          <p className="text-xs text-gray-300 truncate">{receipt.name}</p>
          <p className="text-[8px] text-gray-400">{receipt.date}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity">
        <button
          className="p-1 bg-purple-300 rounded-full mx-1"
          onClick={() => onDownload(receipt)}
        >
          <Download className="w-3.5 h-3.5 text-gray-300" />
        </button>
        <button
          className="p-1 bg-[#BF415D] rounded-full mx-1"
          onClick={() => onDelete(receipt.id)}
        >
          <X className="w-3.5 h-3.5 text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default ReceiptCard;
