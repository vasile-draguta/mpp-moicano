'use client';

import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import { useAuth } from '@/app/contexts/AuthContext';
import { User } from 'lucide-react';

export default function AccountPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would update the user's name here
    // For now, we'll just set isEditing to false
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-300">Your Account</h1>
          <hr className="my-4 border-gray-300" />

          <div className="bg-[#1E1E1E] rounded-lg p-6 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-300/20 flex items-center justify-center text-purple-300">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || (
                  <User size={32} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-300">
                  {user?.name || 'User'}
                </h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2D2D2D] border border-purple-300/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-[#2D2D2D] text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">User ID</span>
                      <span className="text-gray-300">{user?.id}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">
                        Account Created
                      </span>
                      <span className="text-gray-300">
                        {/* Display creation date if available */}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ContentScreen>
    </div>
  );
}
