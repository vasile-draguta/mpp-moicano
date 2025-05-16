'use server';

import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/app/services/server/authService';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 },
      );
    }

    const { user, requiresTwoFactor } = await loginUser(email, password);

    return NextResponse.json({
      message: requiresTwoFactor
        ? 'Two-factor authentication required'
        : 'Login successful',
      user,
      requiresTwoFactor,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to login';

    return NextResponse.json({ message: errorMessage }, { status: 401 });
  }
}
