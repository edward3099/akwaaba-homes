import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Home, Settings, User } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  userType: 'agent' | 'admin' | 'user';
}

export default function EmptyState({ userType }: EmptyStateProps) {
  if (userType === 'admin') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Settings className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Welcome to Admin Dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your admin dashboard is ready. Start managing the platform by reviewing pending verifications and properties.
          </p>
          <div className="mt-6">
            <Link href="/admin/verifications">
              <Button>
                <User className="mr-2 h-4 w-4" />
                Review Verifications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'agent') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Home className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Welcome to Your Agent Dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by listing your first property. Your dashboard is clean and ready for your real estate business.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/agent-dashboard/list-property">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                List Your First Property
              </Button>
            </Link>
            <Link href="/agent-dashboard/profile">
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Complete Your Profile
              </Button>
            </Link>
          </div>
          <div className="mt-6 text-xs text-gray-400">
            <p>• No demo data • Clean start • Professional experience</p>
          </div>
        </div>
      </div>
    );
  }

  // Default user
  return (
    <div className="text-center py-12">
      <div className="mx-auto max-w-md">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <User className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Welcome to AkwaabaHomes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start exploring properties and find your perfect home in Ghana.
        </p>
        <div className="mt-6">
          <Link href="/properties">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
