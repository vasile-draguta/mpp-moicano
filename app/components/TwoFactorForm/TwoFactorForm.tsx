'use client';

import { useState } from 'react';
import { User } from '@/app/types/User';
import { verifyTwoFactor } from '@/app/services/client/authService';

interface TwoFactorFormProps {
  userId: number;
  email: string;
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export default function TwoFactorForm({
  userId,
  email,
  onSuccess,
  onCancel,
}: TwoFactorFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await verifyTwoFactor(userId, verificationCode);
      onSuccess(user);
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[#1E1E1E] rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">
        Two-Factor Authentication
      </h2>

      <p className="text-gray-400 mb-6 text-center">
        Please enter the verification code from your authenticator app for{' '}
        {email}
      </p>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="verificationCode"
            className="block text-gray-300 text-sm font-medium mb-1"
          >
            {isUsingBackupCode ? 'Backup Code' : 'Verification Code'}
          </label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder={
              isUsingBackupCode ? 'Enter backup code' : 'Enter 6-digit code'
            }
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={isUsingBackupCode ? 10 : 6}
            autoComplete="one-time-code"
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2 px-4 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="w-1/2 py-2 px-4 bg-purple-600 rounded text-white hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsUsingBackupCode(!isUsingBackupCode);
              setVerificationCode('');
            }}
            className="text-purple-400 text-sm hover:text-purple-300 focus:outline-none"
          >
            {isUsingBackupCode
              ? 'Use authenticator app instead'
              : 'Use backup code instead'}
          </button>
        </div>
      </form>
    </div>
  );
}
