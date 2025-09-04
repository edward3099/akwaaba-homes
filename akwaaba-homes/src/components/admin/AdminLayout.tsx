'use client';

import { 
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/authContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export default function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Akwaaba Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  className="w-8 h-8 rounded-full"
                  src={user?.user_metadata?.avatar_url || '/placeholder-property.svg'}
                  alt="Admin"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-700">{user?.user_metadata?.full_name || user?.email}</p>
                  <p className="text-gray-500">Admin</p>
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
