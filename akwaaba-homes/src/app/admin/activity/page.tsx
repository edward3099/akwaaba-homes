import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Building2, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AdminActivityPage() {
  // Mock data - replace with actual API calls
  const recentActivity = [
    {
      id: '1',
      type: 'user_registration',
      title: 'New User Registration',
      description: 'Kwame Asante registered as a new agent',
      timestamp: '2024-01-15T10:30:00Z',
      severity: 'info',
      user: 'Kwame Asante',
      details: { email: 'kwame@asante.com', company: 'Asante Real Estate' }
    },
    {
      id: '2',
      type: 'property_created',
      title: 'Property Listing Created',
      description: 'Luxury Villa in East Legon was created by Sarah Mensah',
      timestamp: '2024-01-15T09:15:00Z',
      severity: 'info',
      user: 'Sarah Mensah',
      details: { propertyId: 'prop-123', location: 'East Legon, Accra' }
    },
    {
      id: '3',
      type: 'verification_approved',
      title: 'Agent Verification Approved',
      description: 'Michael Osei\'s agent verification was approved',
      timestamp: '2024-01-15T08:45:00Z',
      severity: 'success',
      user: 'Michael Osei',
      details: { verificationType: 'agent', documents: ['license', 'id_card'] }
    },
    {
      id: '4',
      type: 'system_alert',
      title: 'High Memory Usage Detected',
      description: 'Server memory usage exceeded 80% threshold',
      timestamp: '2024-01-15T08:30:00Z',
      severity: 'warning',
      user: 'System',
      details: { memoryUsage: '85%', threshold: '80%' }
    },
    {
      id: '5',
      type: 'login_attempt',
      title: 'Failed Login Attempt',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      timestamp: '2024-01-15T08:15:00Z',
      severity: 'error',
      user: 'Unknown',
      details: { ipAddress: '192.168.1.100', attempts: 5 }
    },
    {
      id: '6',
      type: 'property_sold',
      title: 'Property Sold',
      description: 'Modern Apartment in Cantonments was sold',
      timestamp: '2024-01-15T07:30:00Z',
      severity: 'success',
      user: 'Kwame Asante',
      details: { propertyId: 'prop-456', salePrice: 'GHS 850,000' }
    },
    {
      id: '7',
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      description: 'Database backup completed successfully',
      timestamp: '2024-01-15T06:00:00Z',
      severity: 'info',
      user: 'System',
      details: { backupSize: '2.5GB', duration: '15 minutes' }
    },
    {
      id: '8',
      type: 'security_event',
      title: 'Suspicious Activity Detected',
      description: 'Unusual access pattern detected for user account',
      timestamp: '2024-01-15T05:45:00Z',
      severity: 'warning',
      user: 'Sarah Mensah',
      details: { accessTime: '2:30 AM', location: 'Unknown' }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <User className="w-5 h-5" />;
      case 'property_created':
        return <Building2 className="w-5 h-5" />;
      case 'verification_approved':
        return <Shield className="w-5 h-5" />;
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'login_attempt':
        return <AlertTriangle className="w-5 h-5" />;
      case 'property_sold':
        return <CheckCircle className="w-5 h-5" />;
      case 'maintenance':
        return <Clock className="w-5 h-5" />;
      case 'security_event':
        return <Shield className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">System Activity</h1>
        <p className="text-muted-foreground">Monitor all system activities, user actions, and security events</p>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Info Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {recentActivity.filter(a => a.severity === 'info').length}
            </div>
            <p className="text-xs text-muted-foreground">Informational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {recentActivity.filter(a => a.severity === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">Attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {recentActivity.filter(a => a.severity === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Timeline</CardTitle>
          <CardDescription>Chronological list of all system activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{activity.title}</h3>
                        {getSeverityBadge(activity.severity)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">User:</span> {activity.user}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                    
                    {Object.keys(activity.details).length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <span className="font-medium">Details:</span>
                        {Object.entries(activity.details).map(([key, value]) => (
                          <span key={key} className="ml-2">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No recent activity</p>
                <p className="text-sm">System is running smoothly with no events to report</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
