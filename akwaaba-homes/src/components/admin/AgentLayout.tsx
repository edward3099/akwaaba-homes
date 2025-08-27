'use client';

import { 
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/authContext';

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Agent Portal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <img
                className="w-8 h-8 rounded-full"
                src={user?.user_metadata?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80'}
                alt="Agent"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-700">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-gray-500">Agent</p>
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
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
