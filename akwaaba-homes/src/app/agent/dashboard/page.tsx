'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Eye, 
  MessageSquare, 
  Plus, 
  Settings, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AgentProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company_name: string;
  license_number: string;
  specializations: string[];
  experience_years: number;
  bio: string;
  profile_image: string;
  user_role: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default function AgentDashboardPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile data');
      toast({
        title: "Error",
        description: "Failed to load your profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Error Loading Dashboard</CardTitle>
            <CardDescription>
              {error || 'Unable to load your profile data'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={fetchProfile} className="mb-3">
              Try Again
            </Button>
            <div className="text-sm text-slate-600">
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in again
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVerified = profile.verification_status === 'verified';
  const isPending = profile.verification_status === 'pending';
  const isRejected = profile.verification_status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Agent Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {profile.full_name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/agent/profile">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.href = '/api/auth/logout'}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Verification Status Banner */}
        {!isVerified && (
          <Card className={`mb-8 ${isRejected ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                {isRejected ? (
                  <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                ) : (
                  <Clock className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${isRejected ? 'text-red-800' : 'text-orange-800'}`}>
                    {isRejected ? 'Verification Rejected' : 'Verification Pending'}
                  </h3>
                  <p className={`text-sm ${isRejected ? 'text-red-700' : 'text-orange-700'} mt-1`}>
                    {isRejected 
                      ? 'Your agent application was not approved. Please contact support for more information.'
                      : 'Your agent application is currently under review. This process typically takes 2-3 business days.'
                    }
                  </p>
                  {isRejected && (
                    <div className="mt-3">
                      <Link href="/contact">
                        <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                          Contact Support
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Properties Listed</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Views</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Inquiries</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Clients</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts for your daily workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isVerified ? (
                  <>
                    <Link href="/agent/properties/new">
                      <Button className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        List New Property
                      </Button>
                    </Link>
                    <Link href="/agent/properties">
                      <Button variant="outline" className="w-full justify-start">
                        <Home className="w-4 h-4 mr-2" />
                        Manage Properties
                      </Button>
                    </Link>
                    <Link href="/agent/clients">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        View Clients
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-3">
                      {isPending 
                        ? 'Your account is pending verification. You\'ll be able to list properties once verified.'
                        : 'Your account verification was rejected. Please contact support for assistance.'
                      }
                    </p>
                    {isPending && (
                      <div className="text-sm text-slate-500">
                        Expected review time: 2-3 business days
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <p>No recent activity to display</p>
                  <p className="text-sm mt-1">Your activity will appear here once you start using the platform</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    {profile.profile_image ? (
                      <img 
                        src={profile.profile_image} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {profile.full_name}
                  </h3>
                  <p className="text-sm text-slate-600">{profile.company_name}</p>
                  <div className="mt-2">
                    <Badge 
                      variant={isVerified ? 'default' : isRejected ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Agent
                        </>
                      ) : isRejected ? (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Verification Rejected
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Verification
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">License</p>
                    <p className="text-sm text-slate-900">{profile.license_number}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Specializations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.specializations?.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      )) || (
                        <span className="text-sm text-slate-500">None specified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Experience</p>
                    <p className="text-sm text-slate-900">{profile.experience_years} years</p>
                  </div>
                </div>

                <Link href="/agent/profile">
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  Our support team is here to help you succeed.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
                <div className="text-xs text-slate-500 text-center">
                  Available 24/7 for urgent matters
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
