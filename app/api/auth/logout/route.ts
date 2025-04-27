'use server';

import { NextResponse } from 'next/server';
import { logoutUser } from '@/app/services/server/authService';

export async function POST() {
  try {
    await logoutUser();

    return NextResponse.json({
      message: 'Logout successful',
      success: true,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to logout';

    return NextResponse.json(
      { message: errorMessage, success: false },
      { status: 500 },
    );
  }
}
