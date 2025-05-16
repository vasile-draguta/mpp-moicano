'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(null);

    // Validate input
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Make the API call to change password
      const response = await fetch('/api/account/update-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      // Clear the form and show success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');

      // After 2 seconds, redirect back to the account page
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
      console.error('Error changing password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-3xl font-bold mb-4 text-gray-300">
          Change Password
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

        <div className="bg-[#1E1E1E] border border-purple-300/20 shadow-md rounded-lg p-6 mb-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Update Your Password
          </h2>

          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-gray-300 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 bg-[#2D2D2D] border border-gray-700 rounded text-gray-300"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 bg-[#2D2D2D] border border-gray-700 rounded text-gray-300"
                disabled={isLoading}
              />
              <p className="text-gray-400 text-xs mt-1">
                Password must be at least 6 characters
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 bg-[#2D2D2D] border border-gray-700 rounded text-gray-300"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </ContentScreen>
    </div>
  );
}
