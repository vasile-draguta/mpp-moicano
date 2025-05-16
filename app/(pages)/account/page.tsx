'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import {
  getUserSessions,
  terminateSession,
  terminateAllOtherSessions,
} from '@/app/services/client/authService';
import { useAuth } from '@/app/contexts/AuthContext';

interface UserSession {
  id: string;
  userAgent: string;
  lastActive: string;
  createdAt: string;
}

export default function AccountPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
      // Refresh the sessions list
      fetchSessions();
    } catch (err) {
      setError('Failed to terminate session');
      console.error('Error terminating session:', err);
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    try {
      await terminateAllOtherSessions();
      // Refresh the sessions list
      fetchSessions();
    } catch (err) {
      setError('Failed to terminate other sessions');
      console.error('Error terminating other sessions:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-3xl font-bold mb-4 text-gray-300">
          Account Settings
        </h1>

        <hr className="my-4 border-gray-300" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1E1E1E] border border-purple-300/20 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              Security Settings
            </h2>

            <div className="flex flex-col space-y-4">
              <Link
                href="/account/two-factor"
                className="flex items-center justify-between p-4 bg-[#2D2D2D] rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div>
                  <h3 className="text-gray-300 font-medium">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {user?.twoFactorEnabled
                      ? 'Enabled - Manage your 2FA settings'
                      : 'Disabled - Add an extra layer of security'}
                  </p>
                </div>
                <span className="text-purple-300 hover:text-purple-400">→</span>
              </Link>

              <Link
                href="/account/password"
                className="flex items-center justify-between p-4 bg-[#2D2D2D] rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div>
                  <h3 className="text-gray-300 font-medium">Change Password</h3>
                  <p className="text-gray-400 text-sm">Update your password</p>
                </div>
                <span className="text-purple-300 hover:text-purple-400">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-purple-300/20 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Active Sessions
          </h2>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-gray-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-400">No active sessions found</div>
          ) : (
            <>
              <div className="mb-4">
                <button
                  onClick={handleTerminateAllOtherSessions}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Terminate All Other Sessions
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-[#2D2D2D] text-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {sessions.map((session) => (
                      <tr key={session.id} className="border-b border-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {session.userAgent}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(session.lastActive)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(session.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleTerminateSession(session.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            Terminate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </ContentScreen>
    </div>
  );
}
