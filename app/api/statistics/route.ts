import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/app/services/server/authService';
import { LogActionType } from '@prisma/client';
import { logUserAction } from '@/app/services/server/loggingService';
import {
  getExpensesByCategory,
  getMonthlySpending,
  getYearOverYearComparison,
  getTotalExpenseStatistics,
} from '@/app/services/server/statisticsService';

// API route to get all statistics for the current user
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);

    // Allow specifying userId directly in the query for testing
    let userId: number | null = parseInt(
      url.searchParams.get('userId') || '0',
      10,
    );

    // If no userId in query, check authentication
    if (!userId) {
      userId = await getCurrentUserId();
      // Only check auth if no userId is provided in query
      if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const type = url.searchParams.get('type') || 'all';

    // Variable to hold the results
    let statistics;

    // Start performance timer
    const startTime = performance.now();

    // Get specific statistics based on the requested type
    switch (type) {
      case 'categories':
        statistics = await getExpensesByCategory(userId);
        break;
      case 'monthly':
        const monthsLimit = parseInt(
          url.searchParams.get('months') || '12',
          10,
        );
        statistics = await getMonthlySpending(userId, monthsLimit);
        break;
      case 'yearly':
        statistics = await getYearOverYearComparison(userId);
        break;
      case 'total':
        statistics = await getTotalExpenseStatistics(userId);
        break;
      case 'all':
      default:
        // Get all statistics in parallel for better performance
        const [categoryStats, monthlyStats, yearlyComparison, totalStats] =
          await Promise.all([
            getExpensesByCategory(userId),
            getMonthlySpending(userId),
            getYearOverYearComparison(userId),
            getTotalExpenseStatistics(userId),
          ]);

        statistics = {
          byCategory: categoryStats,
          monthly: monthlyStats,
          yearComparison: yearlyComparison,
          totals: totalStats,
        };
        break;
    }

    // Calculate execution time for performance monitoring
    const executionTime = performance.now() - startTime;

    // Log the action (don't log JMeter test requests to avoid cluttering logs)
    if (!url.searchParams.get('noLog')) {
      await logUserAction(
        LogActionType.READ,
        'Statistics',
        undefined,
        `Retrieved ${type} statistics (execution: ${Math.round(executionTime)}ms)`,
      );
    }

    return NextResponse.json({
      message: 'Statistics retrieved successfully',
      data: statistics,
      meta: {
        executionTime: Math.round(executionTime),
        type,
        userId,
      },
    });
  } catch (error) {
    console.error('Error retrieving statistics:', error);

    return NextResponse.json(
      {
        message: 'Failed to retrieve statistics',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
