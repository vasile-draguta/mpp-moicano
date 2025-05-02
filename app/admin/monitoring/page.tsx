import { requireAdmin } from '@/app/services/server/authService';
import MonitoringControls from '@/app/components/Admin/MonitoringControls';
import Link from 'next/link';

export default async function MonitoringPage() {
  // This will redirect to login if not logged in, or to home if not admin
  await requireAdmin();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">
        User Activity Monitoring
      </h1>

      <div className="mb-4">
        <Link
          href="/admin"
          className="text-purple-300 hover:text-purple-400 transition-colors"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="bg-[#1E1E1E] shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-300">
          Monitoring System
        </h2>
        <p className="text-gray-400 mb-4">
          This system automatically detects users who perform an unusually high
          number of actions in a short period of time. These users are flagged
          for monitoring and will appear in the monitored users list.
        </p>

        <MonitoringControls />
      </div>
    </div>
  );
}
