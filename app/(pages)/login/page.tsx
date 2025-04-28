'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/app/services/client/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/'); // Redirect to home page after successful login
      router.refresh(); // Refresh to update auth state
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-300 mb-6">
          Login to Expense Tracker
        </h1>

        <div className="bg-purple-500/10 border border-purple-500 text-purple-300 px-4 py-3 rounded mb-4">
          Default credentials have been pre-filled from the seed script
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2D2D2D] border border-purple-300/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2D2D2D] border border-purple-300/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-purple-300 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
