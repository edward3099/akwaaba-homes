'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { Loader2 } from 'lucide-react';

interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProfileCompletionGuard({ 
  children, 
  redirectTo = '/agent/profile' 
}: ProfileCompletionGuardProps) {
  const { user, isAuthenticated, isAgent, userProfile } = useAuth();
  const router = useRouter();
  const [profileStatus, setProfileStatus] = useState<ProfileCompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // Check if user is agent or developer
      const userRole = userProfile?.user_type || user?.user_metadata?.user_type;
      const isDeveloper = userRole === 'developer';
      
      if (!isAuthenticated || (!isAgent && !isDeveloper) || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile/completion');
        
        if (!response.ok) {
          throw new Error('Failed to check profile completion');
        }

        const status: ProfileCompletionStatus = await response.json();
        setProfileStatus(status);

        if (!status.isComplete) {
          // Redirect to profile completion page
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        // On error, allow access but log the issue
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user, isAuthenticated, isAgent, userProfile, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Checking profile completion...</span>
        </div>
      </div>
    );
  }

  // Check if user is agent or developer
  const userRole = userProfile?.user_type || user?.user_metadata?.user_type;
  const isDeveloper = userRole === 'developer';
  
  if (!isAuthenticated || (!isAgent && !isDeveloper)) {
    return null;
  }

  if (profileStatus && !profileStatus.isComplete) {
    return null; // Will redirect to profile page
  }

  return <>{children}</>;
}
