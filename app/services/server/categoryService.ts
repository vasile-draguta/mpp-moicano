'use server';

import prisma from '@/app/db';
import { Category } from '@/app/types/Expense';

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error retrieving categories:', error);
    throw new Error('Failed to retrieve categories');
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    return category;
  } catch (error) {
    console.error(`Error retrieving category with id ${id}:`, error);
    throw new Error('Failed to retrieve category');
  }
}

export async function getCategoryByName(
  name: string,
): Promise<Category | null> {
  try {
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return category;
  } catch (error) {
    console.error(`Error retrieving category with name ${name}:`, error);
    throw new Error('Failed to retrieve category');
  }
}
