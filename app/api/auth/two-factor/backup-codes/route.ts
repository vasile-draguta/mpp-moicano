'use server';

import { NextResponse } from 'next/server';
import { regenerateBackupCodes } from '@/app/services/server/twoFactorService';

// POST - Regenerate backup codes
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 },
      );
    }

    // Regenerate backup codes
    const backupCodes = await regenerateBackupCodes(token);

    return NextResponse.json({
      message: 'Backup codes regenerated successfully',
      backupCodes,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to regenerate backup codes';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
