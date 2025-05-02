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

// Helper for setting JWT cookie
const setAuthCookie = async (userId: number, role: string) => {
  const token = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
  });
};

// Helper for removing JWT cookie
const removeAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    // Token is invalid or expired
    await removeAuthCookie();
    return { userId: null, role: null };
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
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

// Login a user
export const loginUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Set the JWT cookie with user role
  await setAuthCookie(user.id, user.role);

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  await removeAuthCookie();
};

// Get the currently logged in user
export const getCurrentUser = async () => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
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
