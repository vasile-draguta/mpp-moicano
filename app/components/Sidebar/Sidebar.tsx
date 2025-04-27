'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import SidebarMenu from './SidebarMenu';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="h-full w-64 overflow-y-auto flex flex-col bg-[#1A1A1A]">
      <div className="p-4 border-b border-purple-300/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Expense Tracker
        </h1>
      </div>

      <SidebarMenu onLogout={logout} />

      <div className="p-4 border-t border-purple-300/10">
        <div className="overflow-hidden">
          <p className="text-gray-300 font-medium truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-gray-500 text-sm truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
