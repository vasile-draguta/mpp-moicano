'use server';

import prisma from '@/app/db';
import { getCurrentUserId } from './authService';

/**
 * Interface for category expense aggregation
 */
export interface CategoryExpenseAggregation {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

/**
 * Interface for monthly spending data
 */
export interface MonthlySpending {
  month: string;
  totalAmount: number;
  count: number;
}

/**
 * Interface for year-over-year comparison
 */
export interface YearOverYearComparison {
  month: string;
  currentYearAmount: number;
  previousYearAmount: number;
  percentageChange: number;
}

/**
 * Get expense aggregation by category for a user
 * Optimized query using specific column selection and grouping
 */
export async function getExpensesByCategory(
  userId?: number,
): Promise<CategoryExpenseAggregation[]> {
  const currentUserId = userId || (await getCurrentUserId());

  if (!currentUserId) {
    return [];
  }

  // Use Prisma's native query builder instead of raw SQL for better compatibility
  const expenses = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId: currentUserId,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    _avg: {
      amount: true,
    },
  });

  // Get category details
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: expenses.map((exp) => exp.categoryId),
      },
    },
  });

  // Map to the expected format
  return expenses
    .map((exp) => {
      const category = categories.find((c) => c.id === exp.categoryId);
      return {
        categoryId: exp.categoryId,
        categoryName: category?.name || 'Unknown',
        totalAmount: exp._sum.amount || 0,
        count: exp._count.id,
        averageAmount: exp._avg.amount || 0,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Get monthly spending for a user
 * Includes data for the last 12 months
 */
export async function getMonthlySpending(
  userId?: number,
  monthsLimit: number = 12,
): Promise<MonthlySpending[]> {
  const currentUserId = userId || (await getCurrentUserId());

  if (!currentUserId) {
    return [];
  }

  // Calculate date 12 months ago
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - monthsLimit);

  // Use a simpler approach just to test functionality
  const expenses = await prisma.expense.findMany({
    where: {
      userId: currentUserId,
      date: {
        gte: dateLimit,
      },
    },
    select: {
      date: true,
      amount: true,
    },
  });

  // Group by month (simplified)
  const monthlyData: Record<string, { total: number; count: number }> = {};

  expenses.forEach((exp) => {
    const month = exp.date.toISOString().substring(0, 7); // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, count: 0 };
    }
    monthlyData[month].total += exp.amount;
    monthlyData[month].count += 1;
  });

  // Convert to array and sort
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      totalAmount: data.total,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get year-over-year comparison for a user
 * Compares current year with previous year by month
 */
export async function getYearOverYearComparison(
  userId?: number,
): Promise<YearOverYearComparison[]> {
  const currentUserId = userId || (await getCurrentUserId());

  if (!currentUserId) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Use a simpler approach for testing
  const expenses = await prisma.expense.findMany({
    where: {
      userId: currentUserId,
      date: {
        gte: new Date(`${previousYear}-01-01`),
      },
    },
    select: {
      date: true,
      amount: true,
    },
  });

  // Group by year and month
  const yearMonthData: Record<string, Record<string, number>> = {
    [currentYear]: {},
    [previousYear]: {},
  };

  expenses.forEach((exp) => {
    const year = exp.date.getFullYear();
    const month = exp.date.getMonth() + 1; // 1-12
    const monthStr = month.toString().padStart(2, '0');

    if (year === currentYear || year === previousYear) {
      if (!yearMonthData[year][monthStr]) {
        yearMonthData[year][monthStr] = 0;
      }
      yearMonthData[year][monthStr] += exp.amount;
    }
  });

  // Generate comparison data
  const result: YearOverYearComparison[] = [];

  // Use current year months as base
  Object.entries(yearMonthData[currentYear]).forEach(
    ([month, currentAmount]) => {
      const prevAmount = yearMonthData[previousYear][month] || 0;
      let percentChange = 0;

      if (prevAmount === 0) {
        percentChange = 100; // New spending this year
      } else {
        percentChange = ((currentAmount - prevAmount) / prevAmount) * 100;
      }

      result.push({
        month,
        currentYearAmount: currentAmount,
        previousYearAmount: prevAmount,
        percentageChange: percentChange,
      });
    },
  );

  return result.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get total expense statistics for a user
 */
export async function getTotalExpenseStatistics(userId?: number) {
  const currentUserId = userId || (await getCurrentUserId());

  if (!currentUserId) {
    return {
      totalExpenses: 0,
      averageExpense: 0,
      maxExpense: 0,
      minExpense: 0,
      expenseCount: 0,
    };
  }

  // Optimized query that calculates multiple aggregates in a single database hit
  const stats = await prisma.expense.aggregate({
    where: {
      userId: currentUserId,
    },
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
    _avg: {
      amount: true,
    },
    _max: {
      amount: true,
    },
    _min: {
      amount: true,
    },
  });

  return {
    totalExpenses: stats._sum.amount || 0,
    averageExpense: stats._avg.amount || 0,
    maxExpense: stats._max.amount || 0,
    minExpense: stats._min.amount || 0,
    expenseCount: stats._count.id,
  };
}
