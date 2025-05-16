'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from '@/app/db';
import { User } from '@/app/types/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable
const JWT_EXPIRES_IN = '7d'; // 7 days
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_REFRESH_EXPIRES_IN = '30d'; // 30 days

// Token blacklist to track invalidated tokens (should use Redis in production)
type BlacklistedToken = {
  token: string;
  expiresAt: Date;
};
let tokenBlacklist: BlacklistedToken[] = [];

// Clean up expired tokens from blacklist (should be handled by Redis TTL in production)
const cleanupBlacklist = () => {
  const now = new Date();
  tokenBlacklist = tokenBlacklist.filter((item) => item.expiresAt > now);
};

// Run cleanup periodically (in a real app, this would be handled differently)
setInterval(cleanupBlacklist, 1000 * 60 * 60); // Clean up every hour

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Helper for generating tokens
const generateTokens = (userId: number, role: string) => {
  // Generate access token
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId, role, tokenVersion: 1 },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    },
  );

  return { accessToken, refreshToken };
};

// Helper for setting JWT cookies
const setAuthCookies = async (userId: number, role: string) => {
  const { accessToken, refreshToken } = generateTokens(userId, role);

  const cookieStore = await cookies();

  // Set access token cookie
  cookieStore.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
    sameSite: 'strict',
  });

  // Set refresh token cookie
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: '/',
    sameSite: 'strict',
  });

  // Store session info in database
  await prisma.userSession.upsert({
    where: {
      userId_userAgent: {
        userId,
        userAgent: 'default', // In a real implementation, get this from headers
      },
    },
    update: {
      lastActive: new Date(),
    },
    create: {
      userId,
      userAgent: 'default', // In a real implementation, get this from headers
      lastActive: new Date(),
    },
  });
};

// Helper for removing JWT cookies
const removeAuthCookies = async () => {
  const cookieStore = await cookies();

  // Add current token to blacklist if exists
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    try {
      const decoded = jwt.decode(token) as { exp: number } | null;
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        tokenBlacklist.push({ token, expiresAt });
      }
    } catch {
      // Ignore error when decoding token for blacklist
      console.error('Error decoding token for blacklist');
    }
  }

  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');
};

// Helper for getting current user ID and role from token
export const getCurrentUserIdAndRole = async (): Promise<{
  userId: number | null;
  role: string | null;
}> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return { userId: null, role: null };
  }

  try {
    // Check if token is blacklisted
    if (tokenBlacklist.some((item) => item.token === token)) {
      throw new Error('Token revoked');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };

    // Update session last active timestamp
    await prisma.userSession.updateMany({
      where: { userId: decoded.userId },
      data: { lastActive: new Date() },
    });

    return { userId: decoded.userId, role: decoded.role };
  } catch {
    // Token is invalid or expired - try refresh token
    await tryRefreshToken();

    // If refresh fails, cookies will be cleared
    return { userId: null, role: null };
  }
};

// Helper for refreshing the access token using the refresh token
const tryRefreshToken = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    await removeAuthCookies();
    return false;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: number;
      role: string;
    };

    // Check if user session exists
    const session = await prisma.userSession.findFirst({
      where: { userId: decoded.userId },
    });

    if (!session) {
      await removeAuthCookies();
      return false;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // Set the new access token cookie
    cookieStore.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
      sameSite: 'strict',
    });

    // Update session
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    return true;
  } catch {
    await removeAuthCookies();
    return false;
  }
};

// Helper for getting current user ID from token
export const getCurrentUserId = async (): Promise<number | null> => {
  const { userId } = await getCurrentUserIdAndRole();
  return userId;
};

// Register a new user
export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  const validation = registerSchema.safeParse({ name, email, password });

  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email is already registered');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      // By default, new users are assigned the USER role
    },
  });

  // Set the JWT cookie with user role
  await setAuthCookies(user.id, user.role);

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};

// Login a user
export const loginUser = async (
  email: string,
  password: string,
): Promise<{ user: User; requiresTwoFactor: boolean }> => {
  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    // Return user info but don't set auth cookies yet
    // The frontend will need to prompt for 2FA code
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      requiresTwoFactor: true,
    };
  }

  // 2FA not enabled, set the JWT cookies with user role
  await setAuthCookies(user.id, user.role);

  // Return user without password
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    requiresTwoFactor: false,
  };
};

// Complete 2FA verification and login
export const completeTwoFactorLogin = async (
  userId: number,
  twoFactorCode: string,
): Promise<User> => {
  // Import and use the 2FA verification functions
  const { verifyTwoFactorToken, verifyBackupCode } = await import(
    './twoFactorService'
  );

  // Check if the user exists and has 2FA enabled
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.twoFactorEnabled) {
    throw new Error('Two-factor authentication is not enabled for this user');
  }

  // Check both TOTP code and backup code
  const isTotpValid = await verifyTwoFactorToken(twoFactorCode, userId);

  if (!isTotpValid) {
    // Check if it's a valid backup code
    const isBackupValid = await verifyBackupCode(twoFactorCode, userId);

    if (!isBackupValid) {
      throw new Error('Invalid verification code');
    }
  }

  // Successfully verified 2FA, now set the auth cookies
  await setAuthCookies(user.id, user.role);

  // Return the user
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  await removeAuthCookies();
};

// Get the currently logged in user
export const getCurrentUser = async () => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    return null;
  }

  // Return user without sensitive data
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
  };
};

// Middleware to protect routes
export const requireAuth = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
};

// Middleware to protect admin routes
export const requireAdmin = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    // Redirect to home page if not an admin
    redirect('/');
  }

  return user;
};

// Get all active sessions for current user
export const getUserSessions = async () => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const sessions = await prisma.userSession.findMany({
    where: { userId },
    orderBy: { lastActive: 'desc' },
  });

  return sessions;
};

// Terminate a specific session
export const terminateSession = async (sessionId: string): Promise<void> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Make sure the session belongs to the current user
  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new Error('Session not found or unauthorized');
  }

  await prisma.userSession.delete({
    where: { id: sessionId },
  });
};

// Terminate all sessions except current
export const terminateAllOtherSessions = async (): Promise<void> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const cookieStore = await cookies();
  const currentToken = cookieStore.get('auth_token')?.value;

  if (!currentToken) {
    throw new Error('Not authenticated');
  }

  // Get all user sessions except current
  const sessions = await prisma.userSession.findMany({
    where: {
      userId,
      // Filter out current session based on userAgent in a real implementation
    },
  });

  // Delete all other sessions
  await prisma.userSession.deleteMany({
    where: {
      userId,
      id: {
        notIn: [sessions[0].id], // Keep current session
      },
    },
  });
};
