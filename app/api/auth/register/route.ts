'use server';

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/app/services/server/authService';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    const user = await registerUser(name, email, password);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to register user';

    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
