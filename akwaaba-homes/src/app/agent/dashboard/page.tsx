'use client';

import { useAuth } from '@/lib/auth/authContext';
import { LoadingSpinner } from '@/components/ui/loading';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Plus, Users, Settings, BarChart3, FileText } from 'lucide-react';

export default function AgentDashboardPage() {
  const { user, loading, isAgent, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    activeProperties: 0,
    totalInquiries: 0
  });

  // Check authentication and role
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/agent-dashboard');
      return;
    }
    
    if (!loading && user && !isAgent && !isAdmin) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, isAgent, isAdmin, router]);

  // Fetch agent stats
  useEffect(() => {
    if (user && (isAgent || isAdmin)) {
      fetchAgentStats();
    }
  }, [user, isAgent, isAdmin]);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agent/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch agent stats:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || (!isAgent && !isAdmin)) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            Agent Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base break-words">
            Welcome back, {user.user_metadata?.first_name || user.email}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                All your property listings
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Pending Approval</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.pendingProperties}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting admin review
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Active Listings</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.activeProperties}</div>
              <p className="text-xs text-muted-foreground">
                Currently visible to buyers
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Total Inquiries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalInquiries}</div>
              <p className="text-xs text-muted-foreground">
                Buyer interest in your properties
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/properties/create">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Add New Property</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Create a new property listing
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/properties">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Manage Properties</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  View and edit your property listings
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/inquiries">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">View Inquiries</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Check buyer inquiries and messages
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/profile">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Profile Settings</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Update your profile and preferences
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/analytics">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Performance Analytics</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  View your property performance metrics
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/support">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Support & Help</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Get help and contact support
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-sm">
              Your latest property updates and inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">No recent activity to display</p>
              <p className="text-xs sm:text-sm">Start by adding your first property!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
