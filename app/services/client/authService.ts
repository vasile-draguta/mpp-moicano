'use client';

import { User } from '@/app/types/User';

// Type for login response with two-factor requirement
interface LoginResponse {
  user: User;
  requiresTwoFactor: boolean;
}

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

// Login the user, potentially requiring 2FA
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const data = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Complete login with 2FA verification
export const verifyTwoFactor = async (
  userId: number,
  token: string,
): Promise<User> => {
  try {
    const data = await apiRequest<{ user: User }>(
      '/api/auth/two-factor/verify',
      {
        method: 'POST',
        body: JSON.stringify({ userId, token }),
      },
    );

    return data.user;
  } catch (error) {
    console.error('2FA verification error:', error);
    throw error;
  }
};

// Get 2FA setup information (QR code)
export const getTwoFactorSetup = async (): Promise<{
  secret: string;
  qrCodeUrl: string;
}> => {
  try {
    const data = await apiRequest<{
      secret: string;
      qrCodeUrl: string;
    }>('/api/auth/two-factor/setup');

    return data;
  } catch (error) {
    console.error('2FA setup error:', error);
    throw error;
  }
};

// Enable 2FA after setting up
export const enableTwoFactor = async (token: string): Promise<string[]> => {
  try {
    const data = await apiRequest<{
      backupCodes: string[];
    }>('/api/auth/two-factor/setup', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    return data.backupCodes;
  } catch (error) {
    console.error('Enable 2FA error:', error);
    throw error;
  }
};

// Disable 2FA
export const disableTwoFactor = async (token: string): Promise<void> => {
  try {
    await apiRequest('/api/auth/two-factor/disable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    throw error;
  }
};

// Regenerate backup codes
export const regenerateBackupCodes = async (
  token: string,
): Promise<string[]> => {
  try {
    const data = await apiRequest<{
      backupCodes: string[];
    }>('/api/auth/two-factor/backup-codes', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    return data.backupCodes;
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    throw error;
  }
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

// Get all active sessions for the current user
export const getUserSessions = async () => {
  try {
    const response = await fetch('/api/auth/sessions');

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const data = await response.json();
    return data.sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Terminate a specific user session
export const terminateSession = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to terminate session');
    }

    return true;
  } catch (error) {
    console.error('Error terminating session:', error);
    throw error;
  }
};

// Terminate all other user sessions except the current one
export const terminateAllOtherSessions = async () => {
  try {
    const response = await fetch('/api/auth/sessions', {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to terminate other sessions');
    }

    return true;
  } catch (error) {
    console.error('Error terminating other sessions:', error);
    throw error;
  }
};
