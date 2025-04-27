'use server';

import prisma from '@/app/db';
import { User } from '@/app/types/User';
import { getCurrentUserId } from './authService';
import bcrypt from 'bcryptjs';

// Interface for database user object
interface DbUser {
  id: number;
  name: string | null;
  email: string;
  createdAt: Date;
}

// Helper function to convert Date to string for User type
const formatUser = (user: DbUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
});

// Update user's name
export const updateName = async (name: string): Promise<User> => {
  if (!name || name.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return formatUser(updatedUser);
};

// Update user's email
export const updateEmail = async (email: string): Promise<User> => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email address');
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if email is already in use by another user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new Error('Email already in use');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { email },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return formatUser(updatedUser);
};

// Update user profile (name and/or email)
export const updateUserProfile = async ({
  name,
  email,
}: {
  name?: string;
  email?: string;
}): Promise<User> => {
  if (!name && !email) {
    throw new Error('At least one field must be provided');
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // If email is updated, make sure it's not already taken
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email already in use');
    }
  }

  // Update user in the database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return formatUser(updatedUser);
};

// Update user's password
export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (!currentPassword || !newPassword) {
    throw new Error('Both current and new password are required');
  }

  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the user with password
  const userWithPassword = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userWithPassword) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    userWithPassword.password,
  );

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });
};
