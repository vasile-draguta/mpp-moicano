'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  getTwoFactorSetup,
  enableTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
} from '@/app/services/client/authService';

export default function TwoFactorPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if 2FA is already enabled
  const isTwoFactorEnabled = user?.twoFactorEnabled || false;

  // Load 2FA setup
  const loadTwoFactorSetup = async () => {
    if (isTwoFactorEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const { qrCodeUrl, secret } = await getTwoFactorSetup();
      setQrCodeUrl(qrCodeUrl);
      setSecret(secret);
    } catch (err) {
      setError('Failed to load 2FA setup');
      console.error('Error loading 2FA setup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load 2FA setup when page loads
  useEffect(() => {
    if (!isTwoFactorEnabled) {
      loadTwoFactorSetup();
    }
  }, [isTwoFactorEnabled]);

  // Enable 2FA
  const handleEnableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const codes = await enableTwoFactor(verificationCode);
      setBackupCodes(codes);
      setSuccess('Two-factor authentication enabled successfully');
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
      console.error('Error enabling 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await disableTwoFactor(verificationCode);
      setSuccess('Two-factor authentication disabled successfully');
      setQrCodeUrl(null);
      setSecret(null);
      setBackupCodes(null);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      console.error('Error disabling 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new backup codes
  const handleRegenerateBackupCodes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const codes = await regenerateBackupCodes(verificationCode);
      setBackupCodes(codes);
      setSuccess('Backup codes regenerated successfully');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to regenerate backup codes',
      );
      console.error('Error regenerating backup codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-3xl font-bold mb-4 text-gray-300">
          Two-Factor Authentication
        </h1>

        <div className="mb-4">
          <Link
            href="/account"
            className="text-purple-300 hover:text-purple-400 transition-colors"
          >
            ← Back to Account
          </Link>
        </div>

        <hr className="my-4 border-gray-300" />

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-2 rounded-md mb-4">
            {success}
          </div>
        )}

        <div className="bg-[#1E1E1E] border border-purple-300/20 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            {isTwoFactorEnabled
              ? 'Manage 2FA'
              : 'Set Up Two-Factor Authentication'}
          </h2>

          <p className="text-gray-400 mb-6">
            {isTwoFactorEnabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
          </p>

          {!isTwoFactorEnabled && qrCodeUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                1. Scan the QR code with your authenticator app
              </h3>
              <div className="bg-white inline-block p-2 rounded mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>

              <h3 className="text-lg font-medium text-gray-300 mb-2">
                2. Or enter the setup key manually:
              </h3>
              <div className="bg-[#2D2D2D] p-3 rounded font-mono text-sm text-gray-300 mb-4">
                {secret}
              </div>
            </div>
          )}

          <form className="mb-6">
            <div className="mb-4">
              <label htmlFor="code" className="block text-gray-300 mb-1">
                {isTwoFactorEnabled
                  ? 'Enter verification code to manage 2FA'
                  : 'Enter the verification code from your app'}
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full p-2 bg-[#2D2D2D] border border-gray-700 rounded text-gray-300"
                maxLength={6}
              />
            </div>

            {isTwoFactorEnabled ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDisableTwoFactor}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Disable 2FA'}
                </button>
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Generate New Backup Codes'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnableTwoFactor}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Enable 2FA'}
              </button>
            )}
          </form>

          {backupCodes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Backup Codes
              </h3>
              <p className="text-gray-400 mb-3">
                Save these backup codes in a secure place. Each code can only be
                used once.
              </p>
              <div className="bg-[#2D2D2D] p-4 rounded mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-gray-300">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentScreen>
    </div>
  );
}
