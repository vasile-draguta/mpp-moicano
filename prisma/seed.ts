import { PrismaClient, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration for full data generation
const USERS_COUNT = 1000; // Smaller but reasonable
const CATEGORIES_COUNT = 50;
const EXPENSES_PER_USER = 100; // Will result in 100,000 expenses

// Generate unique category names
function generateUniqueCategories(count: number): string[] {
  const uniqueCategories = new Set<string>();

  while (uniqueCategories.size < count) {
    // Combine department with adjective to increase uniqueness
    const categoryName = `${faker.commerce.productAdjective()} ${faker.commerce.department()}`;
    uniqueCategories.add(categoryName);
  }

  return Array.from(uniqueCategories);
}

async function main() {
  console.log('Starting to seed database...');

  // Clear existing data
  await prisma.expense.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('Admin user created');

  // Also create a regular test user for easier testing
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: UserRole.USER,
    },
  });
  console.log('Test user created');

  // Generate unique category names
  const categoryNames = generateUniqueCategories(CATEGORIES_COUNT);

  // Create categories
  const categories = [];
  console.log('Creating categories...');
  for (let i = 0; i < categoryNames.length; i++) {
    const category = await prisma.category.create({
      data: {
        name: categoryNames[i],
      },
    });
    categories.push(category);
    if (i % 10 === 0) console.log(`Created ${i} categories`);
  }
  console.log(`Created ${categories.length} categories`);

  // Create users and expenses in batches to avoid memory issues
  const BATCH_SIZE = 50; // Process 50 users at a time
  console.log('Creating users and expenses in batches...');

  for (
    let batchIndex = 0;
    batchIndex < USERS_COUNT / BATCH_SIZE;
    batchIndex++
  ) {
    const userBatch = [];

    // Create batch of users
    for (let i = 0; i < BATCH_SIZE; i++) {
      const userIndex = batchIndex * BATCH_SIZE + i;
      if (userIndex >= USERS_COUNT) break;

      const password = await bcrypt.hash('password123', 10);
      userBatch.push({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password,
        role: UserRole.USER,
      });
    }

    // Batch insert users
    await prisma.user.createMany({
      data: userBatch,
      skipDuplicates: true,
    });

    // Get the created users to get their IDs
    const userIds = await prisma.user.findMany({
      where: {
        email: {
          in: userBatch.map((u) => u.email),
        },
      },
      select: { id: true },
    });

    // Create expenses for each user in this batch
    for (const userId of userIds.map((u) => u.id)) {
      const userExpenses = [];
      for (let j = 0; j < EXPENSES_PER_USER; j++) {
        userExpenses.push({
          date: faker.date.between({ from: '2020-01-01', to: '2023-12-31' }),
          description: faker.finance.transactionDescription(),
          amount: parseFloat(faker.finance.amount({ min: 1, max: 1000 })),
          categoryId:
            categories[Math.floor(Math.random() * categories.length)].id,
          merchant: faker.company.name(),
          userId: userId,
        });
      }

      // Batch insert expenses
      await prisma.expense.createMany({
        data: userExpenses,
      });
    }

    console.log(
      `Processed batch ${batchIndex + 1}/${Math.ceil(USERS_COUNT / BATCH_SIZE)}`,
    );
  }

  console.log(
    `Seeding completed: Created approximately ${USERS_COUNT} users and ${USERS_COUNT * EXPENSES_PER_USER} expenses`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
