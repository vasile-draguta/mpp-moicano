import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePassword } from '@/app/services/server/accountService';

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.message },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    await updatePassword(currentPassword, newPassword);

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating password:', error);

    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') statusCode = 401;
      else if (error.message === 'Current password is incorrect')
        statusCode = 400;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: statusCode },
    );
  }
}
