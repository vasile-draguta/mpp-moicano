'use server';

import { NextResponse } from 'next/server';
import {
  getUserSessions,
  terminateAllOtherSessions,
} from '@/app/services/server/authService';

// GET - Retrieve all active sessions for the current user
export async function GET() {
  try {
    const sessions = await getUserSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get sessions';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// DELETE - Terminate all other sessions except the current one
export async function DELETE() {
  try {
    await terminateAllOtherSessions();
    return NextResponse.json({
      message: 'All other sessions terminated successfully',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to terminate sessions';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
