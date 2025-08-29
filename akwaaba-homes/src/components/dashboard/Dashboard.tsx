'use client'

import { useAuth } from '@/lib/auth/authContext';
import { LoadingSpinner } from '@/components/ui/loading';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, loading, isAgent, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect users to their proper role-based dashboard
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.push('/admin');
        return;
      }
      if (isAgent) {
        router.push('/agent-dashboard');
        return;
      }
      // For regular users (customers), redirect to properties page instead of showing dashboard
      router.push('/properties');
      return;
    }
  }, [user, loading, isAdmin, isAgent, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the dashboard.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Get user role from metadata - use the correct property name
  const userRole = user.user_metadata?.user_type || 'user';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your properties and account settings
          </p>
        </div>

        {/* Role-based Dashboard Content */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              title="User Management"
              description="Manage all users and their roles"
              href="/admin/users"
              icon="👥"
            />
            <DashboardCard
              title="System Settings"
              description="Configure platform settings"
              href="/admin/settings"
              icon="⚙️"
            />
            <DashboardCard
              title="Analytics"
              description="View platform analytics and reports"
              href="/admin/analytics"
              icon="📊"
            />
          </div>
        )}

        {/* Regular user dashboard - redirect to properties */}
        {userRole === 'user' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to AkwaabaHomes!</h2>
            <p className="text-gray-600 mb-6">Browse properties and find your perfect home in Ghana</p>
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Properties
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Browse Properties
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Contact Support
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

function DashboardCard({ title, description, href, icon }: DashboardCardProps) {
  return (
    <a
      href={href}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </a>
  );
}
