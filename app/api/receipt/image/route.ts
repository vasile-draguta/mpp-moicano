import { NextRequest, NextResponse } from 'next/server';
import { mockReceipts } from '@/app/utils/mockReceiptData';

export async function GET(request: NextRequest) {
  try {
    const id = parseInt(request.nextUrl.searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid receipt ID' },
        { status: 400 },
      );
    }

    // Find the receipt
    const receipt = mockReceipts.find((r) => r.id === id);
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(receipt.url);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch receipt image' },
        { status: 500 },
      );
    }

    // Get image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers for download
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${receipt.name || `receipt-${receipt.id}.jpg`}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading receipt image:', error);
    return NextResponse.json(
      { error: 'Failed to download receipt image' },
      { status: 500 },
    );
  }
}
