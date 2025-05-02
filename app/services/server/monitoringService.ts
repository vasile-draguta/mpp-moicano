'use server';

import prisma from '@/app/db';
import { getSuspiciousActivityLogs } from './loggingService';

/**
 * Check for suspicious activity and flag users
 * @param timeWindowMinutes Time window in minutes to check for activity
 * @param threshold Number of actions that triggers suspicious activity flag
 */
export async function checkForSuspiciousActivity(
  timeWindowMinutes = 5,
  threshold = 20,
) {
  try {
    // Get users with suspicious activity
    const suspiciousUsers = await getSuspiciousActivityLogs(
      timeWindowMinutes,
      threshold,
    );

    // Flag each suspicious user for monitoring
    for (const user of suspiciousUsers) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { isMonitored: true },
      });

      // Log the monitoring action
      console.log(
        `User ${user.userId} flagged for monitoring due to high activity: ${user.count} actions in ${timeWindowMinutes} minutes`,
      );
    }

    return {
      success: true,
      usersMonitored: suspiciousUsers.length,
    };
  } catch (error) {
    console.error('Error checking for suspicious activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Remove monitoring flag from a user
 * @param userId ID of user to remove monitoring flag from
 */
export async function removeMonitoringFlag(userId: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isMonitored: false },
    });

    return { success: true };
  } catch (error) {
    console.error(`Error removing monitoring flag from user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get count of monitored users
 */
export async function getMonitoredUsersCount() {
  return prisma.user.count({
    where: { isMonitored: true },
  });
}
