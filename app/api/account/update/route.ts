import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateUserProfile } from '@/app/services/server/accountService';

const updateSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'At least one field must be provided',
  });

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.message },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const updatedUser = await updateUserProfile({
      name: data.name,
      email: data.email,
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      {
        status:
          error instanceof Error && error.message === 'Unauthorized'
            ? 401
            : 500,
      },
    );
  }
}
