'use server';

import { NextRequest, NextResponse } from 'next/server';
import { checkForSuspiciousActivity } from '@/app/services/server/monitoringService';
import { getCurrentUserIdAndRole } from '@/app/services/server/authService';
import { LogActionType } from '@prisma/client';
import { logUserAction } from '@/app/services/server/loggingService';

// API route to check for suspicious activity and flag users
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const { role } = await getCurrentUserIdAndRole();

    if (role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Get parameters from request
    const { timeWindowMinutes = 5, threshold = 20 } = await req.json();

    // Run the monitoring check
    const result = await checkForSuspiciousActivity(
      Number(timeWindowMinutes),
      Number(threshold),
    );

    // Log the action
    await logUserAction(
      LogActionType.READ,
      'MonitoringCheck',
      undefined,
      `Checked for suspicious activity: ${result.usersMonitored || 0} users flagged`,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in monitoring API:', error);

    return NextResponse.json(
      {
        message: 'Failed to run monitoring check',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// API route to get monitoring status
export async function GET() {
  try {
    // Check if user is admin
    const { role } = await getCurrentUserIdAndRole();

    if (role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Run the monitoring check with dry run mode (just check, don't flag users)
    const result = await checkForSuspiciousActivity();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in monitoring API:', error);

    return NextResponse.json(
      {
        message: 'Failed to get monitoring status',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
