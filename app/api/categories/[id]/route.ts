import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById } from '@/app/services/server/categoryService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 },
      );
    }

    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      category,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching category:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch category' },
      { status: 500 },
    );
  }
}
