'use server';

import { NextResponse } from 'next/server';
import {
  generateTwoFactorSecret,
  enableTwoFactor,
} from '@/app/services/server/twoFactorService';

// GET - Generate a new 2FA secret and QR code
export async function GET() {
  try {
    const { secret, qrCodeUrl } = await generateTwoFactorSecret();

    return NextResponse.json({
      secret,
      qrCodeUrl,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate 2FA secret';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// POST - Enable 2FA after verification
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 },
      );
    }

    // Enable 2FA and generate backup codes
    const backupCodes = await enableTwoFactor(token);

    return NextResponse.json({
      message: 'Two-factor authentication enabled successfully',
      backupCodes,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to enable 2FA';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
