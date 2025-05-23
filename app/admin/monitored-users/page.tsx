import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import { requireAdmin } from '@/app/services/server/authService';
import prisma from '@/app/db';
import Link from 'next/link';
import { checkForSuspiciousActivity } from '@/app/services/server/monitoringService';

export default async function MonitoredUsersPage() {
  // This will redirect to login if not logged in, or to home if not admin
  await requireAdmin();

  // Run the monitoring check automatically when an admin accesses this page
  // Default parameters: 5 minutes time window, 20 actions threshold
  const monitoringResult = await checkForSuspiciousActivity();

  // Fetch monitored users
  const monitoredUsers = await prisma.user.findMany({
    where: {
      isMonitored: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          logs: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-2xl font-bold mb-4 text-gray-300">
          Monitored Users
        </h1>

        <div className="mb-4">
          <Link
            href="/admin"
            className="text-purple-300 hover:text-purple-400 transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        <hr className="my-4 border-gray-300" />

        {monitoringResult?.usersMonitored &&
          monitoringResult.usersMonitored > 0 && (
            <div className="mb-4 p-3 bg-yellow-800 text-yellow-200 rounded-md">
              <strong>Alert:</strong> {monitoringResult.usersMonitored} new
              user(s) flagged for suspicious activity.
            </div>
          )}

        <div className="bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#2D2D2D]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Activity Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Monitored Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
              {monitoredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No monitored users found
                  </td>
                </tr>
              ) : (
                monitoredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user._count.logs} actions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                      <Link
                        href={`/admin/user-logs/${user.id}`}
                        className="hover:text-purple-400"
                      >
                        View Logs
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ContentScreen>
    </div>
  );
}
