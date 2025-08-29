'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalProperties: number;
  pendingVerifications: number;
  pendingApprovals: number;
  totalInquiries: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    pendingApprovals: 0,
    totalInquiries: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch admin stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the AkwaabaHomes administration panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              Verified real estate agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              All property listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              Buyer inquiries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Verifications
            </CardTitle>
            <CardDescription>
              Agent applications awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-4">
              {stats.pendingVerifications}
            </div>
            <Button 
              onClick={() => router.push('/admin/verifications')}
              className="w-full"
            >
              Review Applications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Properties awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-4">
              {stats.pendingApprovals}
            </div>
            <Button 
              onClick={() => router.push('/admin/properties/approvals')}
              className="w-full"
            >
              Review Properties
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            System Health
          </CardTitle>
          <CardDescription>
            Current platform status and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Overall Status</span>
            <Badge className={getSystemHealthColor(stats.systemHealth)}>
              {stats.systemHealth}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {stats.totalProperties - stats.pendingApprovals}
              </div>
              <p className="text-sm text-green-700">Active Properties</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers}
              </div>
              <p className="text-sm text-blue-700">Total Users</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalInquiries}
              </div>
              <p className="text-sm text-purple-700">Total Inquiries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/admin/properties')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Building2 className="h-6 w-6 mb-2" />
              <span>Manage Properties</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/admin/analytics')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>View Analytics</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/admin/settings')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Platform Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
