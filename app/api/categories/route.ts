import { NextResponse } from 'next/server';
import { getAllCategories } from '@/app/services/server/categoryService';

export async function GET() {
  try {
    const categories = await getAllCategories();

    return NextResponse.json({
      categories,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}
