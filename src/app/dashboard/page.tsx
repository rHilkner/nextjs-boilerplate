'use client';

import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { WithAuth } from '@/components/auth/WithAuth';
import { WithRole } from '@/components/auth/WithPermission';

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const { logout } = useAuth();
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // This page is protected by the WithAuth component
  return (
    <WithAuth>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4 mb-6">
                {user?.avatar && (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User'}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Admin section */}
                <WithRole role="ADMIN" fallback={<div className="hidden"></div>}>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="text-lg font-medium text-purple-800 mb-2">Admin Controls</h3>
                    <p className="text-purple-600 mb-4">You have admin privileges, giving you access to all features of the platform.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                        User Management
                      </button>
                      <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                        System Settings
                      </button>
                    </div>
                  </div>
                </WithRole>
                
                {/* User section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Your Account</h3>
                  <p className="text-blue-600 mb-4">Manage your account settings and preferences.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Profile Settings
                    </button>
                    <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Notification Preferences
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Permissions</h3>
                {user?.permissions && user.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specific permissions assigned.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </WithAuth>
  );
}