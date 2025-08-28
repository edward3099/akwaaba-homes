'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';

interface SystemStats {
  totalAdmins: number;
  totalAgents: number;
  pendingVerifications: number;
  totalProperties: number;
  pendingApprovals: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  activeUsers: number;
  propertiesThisMonth: number;
  verificationRate: number;
  approvalRate: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'property_posted' | 'verification_approved' | 'property_approved' | 'admin_created';
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  userId?: string;
  propertyId?: string;
}

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'user_signup',
    description: 'New agent registration: John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'pending',
    userId: 'user-123'
  },
  {
    id: '2',
    type: 'property_posted',
    description: 'New property listed: 3-bedroom house in Accra',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'pending',
    propertyId: 'prop-456'
  },
  {
    id: '3',
    type: 'verification_approved',
    description: 'Agent verification approved: Sarah Wilson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    status: 'completed',
    userId: 'user-789'
  },
  {
    id: '4',
    type: 'property_approved',
    description: 'Property approved: Luxury apartment in Kumasi',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    status: 'completed',
    propertyId: 'prop-101'
  },
  {
    id: '5',
    type: 'admin_created',
    description: 'New admin user created: Michael Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    status: 'completed',
    userId: 'admin-001'
  }
];

const defaultStats: SystemStats = {
  totalAdmins: 3,
  totalAgents: 47,
  pendingVerifications: 12,
  totalProperties: 156,
  pendingApprovals: 8,
  systemHealth: 'healthy',
  activeUsers: 23,
  propertiesThisMonth: 23,
  verificationRate: 85,
  approvalRate: 92
};

export default function AdminOverview() {
  const [stats, setStats] = useState<SystemStats>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSystemStats();
    fetchRecentActivity();
  }, []);

  const fetchSystemStats = async () => {
    // For now, using mock data
    // In a real implementation, this would fetch from the API
    setLoading(false);
  };

  const fetchRecentActivity = async () => {
    // For now, using mock data
    // In a real implementation, this would fetch from the API
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4" />;
      case 'property_posted':
        return <Building2 className="h-4 w-4" />;
      case 'verification_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'property_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'admin_created':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup':
        return 'text-blue-600 bg-blue-100';
      case 'property_posted':
        return 'text-green-600 bg-green-100';
      case 'verification_approved':
        return 'text-green-600 bg-green-100';
      case 'property_approved':
        return 'text-green-600 bg-green-100';
      case 'admin_created':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading system overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/verifications')}>
                <Eye className="mr-2 h-4 w-4" />
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Property Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/properties/approvals')}>
                <Eye className="mr-2 h-4 w-4" />
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
                <Users className="mr-2 h-4 w-4" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Performance</CardTitle>
            <CardDescription>Agent verification success rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-2xl font-bold text-green-600">{stats.verificationRate}%</span>
            </div>
            <Progress value={stats.verificationRate} className="h-2" />
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
              +5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Approval Rate</CardTitle>
            <CardDescription>Property listing approval success rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-2xl font-bold text-blue-600">{stats.approvalRate}%</span>
            </div>
            <Progress value={stats.approvalRate} className="h-2" />
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
              +3% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/activity')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(activity.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                stats.systemHealth === 'healthy' ? 'bg-green-100 text-green-600' :
                stats.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {stats.systemHealth === 'healthy' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Overall Status</p>
                <p className={`text-sm capitalize ${
                  stats.systemHealth === 'healthy' ? 'text-green-600' :
                  stats.systemHealth === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {stats.systemHealth}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-sm text-blue-600">99.9%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-sm text-purple-600">~150ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
