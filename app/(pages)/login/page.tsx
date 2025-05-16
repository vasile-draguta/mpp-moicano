'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/app/services/client/authService';
import { useAuth } from '@/app/contexts/AuthContext';
import TwoFactorForm from '@/app/components/TwoFactorForm/TwoFactorForm';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<number | null>(null);
  const [twoFactorUserEmail, setTwoFactorUserEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login the user
      const response = await login(email, password);

      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        // Show 2FA form
        setTwoFactorUserId(response.user.id);
        setTwoFactorUserEmail(response.user.email);
        setShowTwoFactor(true);
        setIsLoading(false);
        return;
      }

      // No 2FA required, proceed with login
      // Refresh auth context to get the updated user data
      await refreshUser();

      // Navigate to dashboard after auth is refreshed
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 100);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      setIsLoading(false);
    }
  };

  // Handle successful 2FA verification
  const handleTwoFactorSuccess = async () => {
    try {
      // Refresh auth context to get the updated user data
      await refreshUser();

      // Navigate to dashboard after auth is refreshed
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 100);
    } catch (err) {
      console.error('Error after 2FA:', err);
      setError('Failed to complete login after 2FA');
    }
  };

  // Handle 2FA cancellation
  const handleTwoFactorCancel = () => {
    setShowTwoFactor(false);
    setTwoFactorUserId(null);
    setTwoFactorUserEmail('');
  };

  // Show 2FA form if needed
  if (showTwoFactor && twoFactorUserId) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <TwoFactorForm
          userId={twoFactorUserId}
          email={twoFactorUserEmail}
          onSuccess={handleTwoFactorSuccess}
          onCancel={handleTwoFactorCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-300">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E1E1E] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#2D2D2D] text-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#2D2D2D] text-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm">
              <p className="text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-purple-400 hover:text-purple-500"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
