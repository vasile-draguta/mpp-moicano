import React from 'react';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import { requireAdmin } from '@/app/services/server/authService';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // This will redirect to login if not logged in, or to home if not admin
  const user = await requireAdmin();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-2xl font-bold mb-4 text-gray-300">
          Admin Dashboard
        </h1>

        <hr className="my-4 border-gray-300" />

        <div className="bg-[#1E1E1E] shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-300">
            Welcome, {user.name || user.email}
          </h2>
          <p className="text-gray-400 mb-4">
            This is the admin dashboard. Only users with the ADMIN role can
            access this page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <AdminCard
              title="Logs"
              description="View system logs and user activities"
              link="/admin/logs"
            />
            <AdminCard
              title="Monitored Users"
              description="View users under monitoring for suspicious activities"
              link="/admin/monitored-users"
            />
            <AdminCard
              title="Monitoring Controls"
              description="Run suspicious activity checks and configure monitoring"
              link="/admin/monitoring"
            />
          </div>
        </div>
      </ContentScreen>
    </div>
  );
}

// Admin card component
function AdminCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <div className="bg-[#2D2D2D] border border-purple-300/20 rounded-lg p-5 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-300">{title}</h3>
      <p className="text-gray-400 mb-3 text-sm">{description}</p>
      <Link
        href={link}
        className="text-purple-300 text-sm font-medium hover:text-purple-400 transition-colors"
      >
        Access →
      </Link>
    </div>
  );
}
