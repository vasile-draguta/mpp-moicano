import { requireAdmin } from '@/app/services/server/authService';
import { getUserLogs } from '@/app/services/server/loggingService';
import prisma from '@/app/db';
import Link from 'next/link';

export default async function UserLogsPage({
  params,
}: {
  params: { userId: string };
}) {
  // This will redirect to login if not logged in, or to home if not admin
  await requireAdmin();

  const userId = parseInt(params.userId, 10);

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isMonitored: true,
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-300">User Logs</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          User not found
        </div>
        <div className="mt-4">
          <Link
            href="/admin/monitored-users"
            className="text-purple-300 hover:text-purple-400 transition-colors"
          >
            ← Back to Monitored Users
          </Link>
        </div>
      </div>
    );
  }

  // Fetch user logs
  const logs = await getUserLogs(userId, 100, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">
        User Logs for {user.name || user.email}
      </h1>

      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/admin/monitored-users"
          className="text-purple-300 hover:text-purple-400 transition-colors"
        >
          ← Back to Monitored Users
        </Link>

        <div className="flex items-center text-gray-300">
          <span className="mr-2">Monitoring Status:</span>
          {user.isMonitored ? (
            <span className="bg-red-500/10 border border-red-500 text-red-500 px-2 py-1 rounded text-sm">
              Under Monitoring
            </span>
          ) : (
            <span className="bg-green-500/10 border border-green-500 text-green-300 px-2 py-1 rounded text-sm">
              Normal
            </span>
          )}
        </div>
      </div>

      <div className="bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#2D2D2D]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entity ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  No logs found for this user
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.actionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.entityType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.entityId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.details || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
