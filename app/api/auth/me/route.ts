'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/services/server/authService';

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({ user });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get user';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
