'use server';

import { NextRequest, NextResponse } from 'next/server';
import { terminateSession } from '@/app/services/server/authService';

// DELETE - Terminate a specific session by ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 },
      );
    }

    await terminateSession(sessionId);

    return NextResponse.json({
      message: 'Session terminated successfully',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to terminate session';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
