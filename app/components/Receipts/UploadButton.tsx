'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (file: File) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <button
      className="flex items-center px-4 py-2 bg-purple-300/10 rounded cursor-pointer hover:bg-purple-300/20 transition"
      onClick={handleClick}
      type="button"
    >
      <Upload className="w-5 h-5 mr-2 text-purple-300 text-sm" />
      <span className="text-purple-300 text-sm">Upload Receipt</span>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </button>
  );
};

export default UploadButton;
