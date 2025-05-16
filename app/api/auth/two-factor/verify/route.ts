'use server';

import { NextResponse } from 'next/server';
import { completeTwoFactorLogin } from '@/app/services/server/authService';

// POST - Complete login with 2FA
export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { message: 'User ID and verification code are required' },
        { status: 400 },
      );
    }

    // Complete the login with 2FA
    const user = await completeTwoFactorLogin(Number(userId), token);

    return NextResponse.json({
      message: 'Two-factor authentication successful',
      user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to verify 2FA';

    return NextResponse.json({ message: errorMessage }, { status: 401 });
  }
}
