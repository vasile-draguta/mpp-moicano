'use client';

import { User } from '@/app/types/User';
import {
  updateName as serverUpdateName,
  updateEmail as serverUpdateEmail,
  updatePassword as serverUpdatePassword,
  updateUserProfile as serverUpdateUserProfile,
} from '@/app/services/server/accountService';

// Update the user's name
export const updateName = async (name: string): Promise<User> => {
  try {
    return await serverUpdateName(name);
  } catch (error) {
    throw error;
  }
};

// Update the user's email
export const updateEmail = async (email: string): Promise<User> => {
  try {
    return await serverUpdateEmail(email);
  } catch (error) {
    throw error;
  }
};

// Update both name and email
export const updateProfile = async ({
  name,
  email,
}: {
  name?: string;
  email?: string;
}): Promise<User> => {
  try {
    return await serverUpdateUserProfile({ name, email });
  } catch (error) {
    throw error;
  }
};

// Update the user's password
export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    await serverUpdatePassword(currentPassword, newPassword);
  } catch (error) {
    throw error;
  }
};

// Get the current user's account information
export const getAccountInfo = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Failed to get account information:', error);
    return null;
  }
};
