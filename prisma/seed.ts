import { PrismaClient } from '@prisma/client';
import { expenses as mockExpenses } from '../app/utils/mockData';

const prisma = new PrismaClient();

// Map old category names to new ones for backwards compatibility
const CATEGORY_MAPPING: Record<string, string> = {
  'Food & Dining': 'Food',
  'Health & Fitness': 'Healthcare',
  'Gifts & Donations': 'Other',
};

// Helper to normalize categories
const normalizeCategory = (category: string): string => {
  return CATEGORY_MAPPING[category] || category;
};

// List of all categories
const CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Other',
];

async function main() {
  // Create categories
  for (const categoryName of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
      },
    });
  }

  console.log(`Created ${CATEGORIES.length} categories`);

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Demo User',
      password: 'password123', // In a real app, this should be hashed
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // Add the mock expenses linked to the user
  for (const expense of mockExpenses) {
    const normalizedCategory = normalizeCategory(expense.category);

    // Find the category
    const category = await prisma.category.findUnique({
      where: { name: normalizedCategory },
    });

    if (!category) {
      console.error(`Category not found: ${normalizedCategory}`);
      continue;
    }

    await prisma.expense.create({
      data: {
        date: new Date(expense.date),
        description: expense.description,
        amount: expense.amount,
        categoryId: category.id,
        merchant: expense.merchant,
        userId: user.id,
      },
    });
  }

  console.log(`Added ${mockExpenses.length} expenses for user ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
