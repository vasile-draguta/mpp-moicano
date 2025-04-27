'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';
import { useAuth } from '@/app/contexts/AuthContext';
import { User, Eye, EyeOff } from 'lucide-react';
import {
  updateProfile,
  updatePassword,
} from '@/app/services/client/accountService';

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      // Only update fields that have changed
      const updates: { name?: string; email?: string } = {};

      if (name !== user?.name) {
        updates.name = name;
      }

      if (email !== user?.email) {
        updates.email = email;
      }

      // Only make API call if there are changes
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        setIsEditingProfile(false);
        setFormSuccess('Profile updated successfully');
        await refreshUser();
      } else {
        setIsEditingProfile(false);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!currentPassword || !newPassword) {
      setFormError('Both current and new password are required');
      return;
    }

    if (currentPassword === newPassword) {
      setFormError('New password must be different from current password');
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setFormSuccess('Password updated successfully');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to update password',
      );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-300">Your Account</h1>
          <hr className="my-4 border-gray-300" />

          {formError && (
            <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-400/10 border border-green-400/20 text-green-400 px-4 py-3 rounded">
              {formSuccess}
            </div>
          )}

          <div className="flex justify-center">
            <div className="bg-[#1E1E1E] rounded-lg p-8 w-full max-w-3xl">
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

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      onClick={() => {
                        setIsEditingProfile(false);
                        setName(user?.name || '');
                        setEmail(user?.email || '');
                      }}
                      className="px-4 py-2 bg-[#2D2D2D] text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : isEditingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#2D2D2D] border border-purple-300/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-2 top-2 text-gray-400"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#2D2D2D] border border-purple-300/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-2 text-gray-400"
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                      }}
                      className="px-4 py-2 bg-[#2D2D2D] text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-md hover:bg-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                    >
                      Change Password
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
                          {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentScreen>
    </div>
  );
}
