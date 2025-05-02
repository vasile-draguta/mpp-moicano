'use server';

import { LogActionType } from '@prisma/client';
import prisma from '@/app/db';
import { getCurrentUserId } from './authService';

// Add this interface near the top of the file
export interface UserActivityCount {
  userId: number;
  count: string | number; // SQL COUNT returns this as string in some environments
}

/**
 * Log a user action in the database
 * @param actionType Type of action (CREATE, READ, UPDATE, DELETE)
 * @param entityType Type of entity affected (e.g., "Expense", "User")
 * @param entityId ID of the entity (optional for list operations)
 * @param details Additional details about the action
 * @param ipAddress Optional IP address
 * @param userAgent Optional user agent
 */
export async function logUserAction(
  actionType: LogActionType,
  entityType: string,
  entityId?: number,
  details?: string,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    const userId = await getCurrentUserId();

    // If no user is logged in, don't log the action
    if (!userId) {
      return;
    }

    // Create the log entry
    await prisma.log.create({
      data: {
        userId,
        actionType,
        entityType,
        entityId,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        details,
      },
    });
  } catch (error) {
    console.error('Error logging user action:', error);
    // Don't throw errors from logging - just log to console
  }
}

/**
 * Get logs for a specific user
 */
export async function getUserLogs(userId: number, limit = 50, offset = 0) {
  return prisma.log.findMany({
    where: {
      userId,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get all logs (admin only)
 */
export async function getAllLogs(limit = 100, offset = 0) {
  return prisma.log.findMany({
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get suspicious activity logs (high frequency actions)
 * @param timeWindowMinutes Time window in minutes to check for activity
 * @param threshold Number of actions that triggers suspicious activity flag
 */
export async function getSuspiciousActivityLogs(
  timeWindowMinutes = 5,
  threshold = 20,
): Promise<UserActivityCount[]> {
  // Get the timestamp for the time window - use a more generous time window
  const timeWindow = new Date();
  timeWindow.setMinutes(timeWindow.getMinutes() - timeWindowMinutes * 2); // Doubled the time window to be safe

  console.log(`Checking for logs after: ${timeWindow.toISOString()}`);
  console.log(`Threshold: ${threshold} actions`);

  // Use Prisma's native query instead of raw SQL for better type safety
  const logs = await prisma.log.groupBy({
    by: ['userId'],
    _count: {
      userId: true,
    },
    having: {
      userId: {
        _count: {
          gte: threshold,
        },
      },
    },
    where: {
      timestamp: {
        gte: timeWindow,
      },
    },
  });

  console.log(`Found suspicious users: ${JSON.stringify(logs)}`);

  // Convert the result to the expected format
  return logs.map((log) => ({
    userId: log.userId,
    count: log._count.userId,
  }));
}
