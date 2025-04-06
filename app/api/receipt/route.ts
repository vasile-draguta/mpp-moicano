import { NextRequest, NextResponse } from 'next/server';
import {
  getPaginatedReceipts,
  deleteMockReceipt,
  mockReceipts,
  addMockReceipt,
} from '@/app/utils/mockReceiptData';
import { Receipt } from '@/app/types/Receipt';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Check if requesting a single receipt by ID
  const id = searchParams.get('id');
  if (id) {
    const receiptId = parseInt(id);
    if (isNaN(receiptId)) {
      return NextResponse.json(
        { error: 'Invalid receipt ID' },
        { status: 400 },
      );
    }

    // Find the receipt
    const receipt = mockReceipts.find((r) => r.id === receiptId);
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Handle download request
    const download = searchParams.get('download') === 'true';
    if (download) {
      // Return the receipt data with download headers
      return new NextResponse(JSON.stringify(receipt), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${receipt.name || `receipt-${receipt.id}.json`}"`,
        },
      });
    }

    // Just return the receipt data
    return NextResponse.json(receipt);
  }

  // Get page and limit from request query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Validate input params
  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: 'Invalid page parameter' },
      { status: 400 },
    );
  }

  if (isNaN(limit) || limit < 1 || limit > 50) {
    return NextResponse.json(
      { error: 'Invalid limit parameter. Must be between 1 and 50' },
      { status: 400 },
    );
  }

  // Get paginated receipts from mock data
  const results = getPaginatedReceipts(page, limit);

  // Simulate network latency (for testing purposes)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(results);
}

export async function DELETE(request: NextRequest) {
  try {
    const id = parseInt(request.nextUrl.searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid receipt ID' },
        { status: 400 },
      );
    }

    const success = deleteMockReceipt(id);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
  } catch (error: unknown) {
    console.error('Error deleting receipt:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete receipt: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// POST handler for creating a new receipt
export async function POST(request: NextRequest) {
  try {
    const receiptData = await request.json();

    // Validate required fields
    if (!receiptData.name || !receiptData.url || !receiptData.date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, and date are required' },
        { status: 400 },
      );
    }

    // Generate the next ID (highest existing ID + 1)
    const maxId =
      mockReceipts.length > 0
        ? mockReceipts.reduce((max, receipt) => Math.max(max, receipt.id), 0)
        : 0;

    const newReceipt: Receipt = {
      id: maxId + 1,
      name: receiptData.name,
      url: receiptData.url,
      date: receiptData.date,
    };

    // Add to mock data
    addMockReceipt(newReceipt);

    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 },
    );
  }
}
