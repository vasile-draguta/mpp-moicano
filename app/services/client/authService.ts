'use client';

import { User } from '@/app/types/User';

// Function to handle API requests
const apiRequest = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || response.statusText || 'Something went wrong',
    );
  }

  return response.json();
};

// Login a user
export const login = async (email: string, password: string): Promise<User> => {
  const user = await apiRequest<{ user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return user.user;
};

// Register a new user
export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  const user = await apiRequest<{ user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  return user.user;
};

// Logout the current user
export const logout = async (): Promise<void> => {
  await apiRequest<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
};

// Get the current user (if logged in)
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const data = await apiRequest<{ user: User | null }>('/api/auth/me');
    return data.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};
