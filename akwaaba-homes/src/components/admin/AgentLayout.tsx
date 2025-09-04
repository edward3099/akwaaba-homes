'use client';

import { 
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/authContext';
import { useState, useEffect } from 'react';

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  const { user, signOut } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data fetched:', data);
          console.log('Profile image URL:', data.profile?.profile_image);
          setProfileImage(data.profile?.profile_image);
        } else {
          console.error('Failed to fetch profile:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch profile image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImage();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-3 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Agent Portal</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                src={profileImage || '/placeholder-property.svg'}
                alt="Agent"
              />
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-700">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-gray-500">Agent</p>
              </div>
              <button
                onClick={signOut}
                className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="p-3 sm:p-6 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
