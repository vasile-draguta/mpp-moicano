'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FixedSizeGrid,
  GridChildComponentProps,
  GridOnItemsRenderedProps,
} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Receipt } from '@/app/types/Receipt';
import ReceiptCard from './ReceiptCard';
import { Loader2 } from 'lucide-react';

interface VirtualizedReceiptGridProps {
  receipts: Receipt[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onDelete: (id: number) => void;
  onDownload: (receipt: Receipt) => void;
}

const VirtualizedReceiptGrid: React.FC<VirtualizedReceiptGridProps> = ({
  receipts,
  hasMore,
  isLoading,
  onLoadMore,
  onDelete,
  onDownload,
}) => {
  const [gridDimensions, setGridDimensions] = useState({
    width: 1200,
    height: 800,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setGridDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight - 200, // Leave some space for headers
        });
      }
    };

    // Update dimensions on mount and window resize
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Calculate the number of columns based on container width
  const calculateColumns = () => {
    if (gridDimensions.width < 640) return 2; // sm
    if (gridDimensions.width < 768) return 3; // md
    if (gridDimensions.width < 1024) return 4; // lg
    return 6; // xl
  };

  const columnCount = calculateColumns();
  const rowCount = Math.ceil(receipts.length / columnCount) + (hasMore ? 1 : 0);

  // Item count for infinite loader
  const itemCount = hasMore ? receipts.length + 1 : receipts.length;

  // Check if an item is loaded
  const isItemLoaded = (index: number) => {
    return !hasMore || index < receipts.length;
  };

  // Load more items
  const loadMoreItems = isLoading ? () => {} : onLoadMore;

  // Render grid cell
  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;

    // Loading placeholder or empty cell
    if (index >= receipts.length) {
      return columnIndex === 0 && index === receipts.length && hasMore ? (
        <div style={style} className="flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-300" />
        </div>
      ) : null;
    }

    // Receipt card
    const receipt = receipts[index];
    return (
      <div style={style} className="p-2">
        <ReceiptCard
          receipt={receipt}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      </div>
    );
  };

  return (
    <div className="w-full h-full" ref={containerRef}>
      {receipts.length === 0 && isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-purple-300" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">No receipts found.</p>
        </div>
      ) : (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          threshold={5}
        >
          {({ onItemsRendered, ref }) => {
            // Convert from flat list to grid
            const onGridItemsRendered = ({
              visibleRowStartIndex,
              visibleRowStopIndex,
              visibleColumnStartIndex,
              visibleColumnStopIndex,
            }: GridOnItemsRenderedProps) => {
              const visibleStartIndex =
                visibleRowStartIndex * columnCount + visibleColumnStartIndex;
              const visibleStopIndex =
                visibleRowStopIndex * columnCount + visibleColumnStopIndex;

              // TypeScript casting to match the expected interface
              onItemsRendered({
                visibleStartIndex,
                visibleStopIndex,
                overscanStartIndex: visibleStartIndex,
                overscanStopIndex: visibleStopIndex,
              });
            };

            return (
              <FixedSizeGrid
                ref={ref}
                columnCount={columnCount}
                columnWidth={gridDimensions.width / columnCount}
                height={gridDimensions.height}
                rowCount={rowCount}
                rowHeight={250} // Adjust based on your card height
                width={gridDimensions.width}
                onItemsRendered={onGridItemsRendered}
              >
                {Cell}
              </FixedSizeGrid>
            );
          }}
        </InfiniteLoader>
      )}
    </div>
  );
};

export default VirtualizedReceiptGrid;
