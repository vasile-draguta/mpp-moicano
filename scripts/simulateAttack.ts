/**
 * Script to simulate suspicious activity by a specific user
 *
 * Usage:
 * npx tsx scripts/simulateAttack.ts
 */

import { PrismaClient, LogActionType } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const USER_ID = 2520; // ID of the user to simulate (updated to match the user found in logs)
const ACTION_COUNT = 30; // Increased number of actions to simulate (well above threshold)
const ENTITY_TYPES = ['Expense', 'Category', 'User']; // Types of entities to simulate actions on
const ACTION_TYPES = [
  LogActionType.CREATE,
  LogActionType.READ,
  LogActionType.UPDATE,
  LogActionType.DELETE,
];

async function simulateAttack() {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
  });

  if (!user) {
    console.error(`User with ID ${USER_ID} not found`);
    process.exit(1);
  }

  console.log(`Simulating suspicious activity for user: ${user.email}`);

  // Generate random logs in rapid succession
  const logs = [];

  for (let i = 0; i < ACTION_COUNT; i++) {
    const entityType =
      ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];
    const actionType =
      ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];
    const entityId = Math.floor(Math.random() * 100) + 1;

    logs.push({
      userId: USER_ID,
      actionType,
      entityType,
      entityId,
      details: `Simulated ${actionType} action on ${entityType} ID ${entityId}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Attack Simulation Script',
    });
  }

  // Insert all logs at once
  await prisma.log.createMany({
    data: logs,
  });

  console.log(
    `Created ${logs.length} log entries for user ${user.email} (ID: ${USER_ID})`,
  );
  console.log(
    'Run the monitoring check to see this user get flagged for suspicious activity',
  );
}

simulateAttack()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
