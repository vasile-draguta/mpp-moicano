'use server';

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import prisma from '@/app/db';
import bcrypt from 'bcryptjs';
import { getCurrentUserId } from './authService';

// Default issuer name for TOTP
const ISSUER = 'ExpenseTracker';

// Generate a random backup code
const generateBackupCode = (): string => {
  // Generate a random 10-character backup code
  return Math.random()
    .toString(36)
    .substring(2, 12)
    .toUpperCase()
    .replace(/[01IO]/g, () => Math.floor(Math.random() * 10).toString());
};

// Generate a set of backup codes
const generateBackupCodes = async (count: number = 10): Promise<string[]> => {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }

  return codes;
};

// Hash backup codes for storage
const hashBackupCodes = async (
  codes: string[],
): Promise<{ hashed: string[]; original: string[] }> => {
  const hashedCodes = await Promise.all(
    codes.map(async (code) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(code, salt);
    }),
  );

  return {
    hashed: hashedCodes,
    original: codes,
  };
};

// Generate a TOTP secret for a user
export const generateTwoFactorSecret = async () => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get user details for the QR code label
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If 2FA is already enabled, don't generate a new secret
  if (user.twoFactorEnabled) {
    throw new Error('Two-factor authentication is already enabled');
  }

  // Generate a secret
  const secret = authenticator.generateSecret();

  // Save the secret to the database (but don't enable 2FA yet)
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  // Generate the TOTP URI
  const otpauth = authenticator.keyuri(user.email, ISSUER, secret);

  // Generate the QR code as a data URL
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    qrCodeUrl,
  };
};

// Verify a TOTP token against the user's secret
export const verifyTwoFactorToken = async (
  token: string,
  userId?: number,
): Promise<boolean> => {
  // If userId is not provided, get the current user ID
  const uid = userId || (await getCurrentUserId());

  if (!uid) {
    throw new Error('Not authenticated');
  }

  // Get the user's 2FA secret
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If 2FA is not enabled or secret doesn't exist, token is invalid
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return false;
  }

  // Verify the token
  return authenticator.verify({
    token,
    secret: user.twoFactorSecret,
  });
};

// Verify a backup code
export const verifyBackupCode = async (
  code: string,
  userId?: number,
): Promise<boolean> => {
  // If userId is not provided, get the current user ID
  const uid = userId || (await getCurrentUserId());

  if (!uid) {
    throw new Error('Not authenticated');
  }

  // Get the user's backup codes
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { backupCodes: true, twoFactorEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If 2FA is not enabled or no backup codes exist, code is invalid
  if (!user.twoFactorEnabled || !user.backupCodes) {
    return false;
  }

  // Parse backup codes
  const hashedCodes = JSON.parse(user.backupCodes) as string[];

  // Check if any backup code matches
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);

    if (isValid) {
      // Remove the used backup code
      hashedCodes.splice(i, 1);

      // Update the backup codes in the database
      await prisma.user.update({
        where: { id: uid },
        data: { backupCodes: JSON.stringify(hashedCodes) },
      });

      return true;
    }
  }

  return false;
};

// Enable 2FA for a user after verification
export const enableTwoFactor = async (token: string): Promise<string[]> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get the user's 2FA secret
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If 2FA is already enabled, don't enable it again
  if (user.twoFactorEnabled) {
    throw new Error('Two-factor authentication is already enabled');
  }

  // If no secret exists, can't enable 2FA
  if (!user.twoFactorSecret) {
    throw new Error('Two-factor secret not found');
  }

  // Verify the token
  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new Error('Invalid verification code');
  }

  // Generate backup codes
  const backupCodes = await generateBackupCodes();
  const { hashed, original } = await hashBackupCodes(backupCodes);

  // Enable 2FA and store backup codes
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      backupCodes: JSON.stringify(hashed),
    },
  });

  // Return the original backup codes to show to the user
  return original;
};

// Disable 2FA for a user
export const disableTwoFactor = async (token: string): Promise<void> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Verify the token first
  const isTokenValid = await verifyTwoFactorToken(token);

  if (!isTokenValid) {
    throw new Error('Invalid verification code');
  }

  // Disable 2FA and clear secret and backup codes
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
    },
  });
};

// Generate new backup codes
export const regenerateBackupCodes = async (
  token: string,
): Promise<string[]> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Verify the token first
  const isTokenValid = await verifyTwoFactorToken(token);

  if (!isTokenValid) {
    throw new Error('Invalid verification code');
  }

  // Generate new backup codes
  const backupCodes = await generateBackupCodes();
  const { hashed, original } = await hashBackupCodes(backupCodes);

  // Store new backup codes
  await prisma.user.update({
    where: { id: userId },
    data: {
      backupCodes: JSON.stringify(hashed),
    },
  });

  // Return the original backup codes to show to the user
  return original;
};
