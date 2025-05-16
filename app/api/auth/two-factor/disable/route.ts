'use server';

import { NextResponse } from 'next/server';
import { disableTwoFactor } from '@/app/services/server/twoFactorService';

// POST - Disable 2FA
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 },
      );
    }

    // Disable 2FA
    await disableTwoFactor(token);

    return NextResponse.json({
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to disable 2FA';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
