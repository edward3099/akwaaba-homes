'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  HardDrive,
  Cpu,
  Network,
  RefreshCw,
  Server,
  Shield,
  Smartphone,
  Wifi,
  XCircle
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  database: {
    connections: number;
    queriesPerSecond: number;
    slowQueries: number;
    uptime: number;
  };
  uptime: number;
  loadAverage: number[];
  responseTime: number;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  details?: any;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_attempt' | 'permission_denied' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress?: string;
  userId?: string;
}

const mockSystemMetrics: SystemMetrics = {
  cpu: {
    usage: 45.2,
    temperature: 65,
    cores: 8,
  },
  memory: {
    total: 16384,
    used: 8192,
    available: 8192,
    usage: 50.0,
  },
  disk: {
    total: 1000000,
    used: 450000,
    available: 550000,
    usage: 45.0,
  },
  network: {
    bytesIn: 1024000,
    bytesOut: 512000,
    connections: 1250,
  },
  database: {
    connections: 45,
    queriesPerSecond: 1250,
    slowQueries: 3,
    uptime: 86400,
  },
  uptime: 604800,
  loadAverage: [1.2, 1.1, 1.0],
  responseTime: 150,
};

const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    level: 'info',
    message: 'User authentication successful',
    source: 'auth-service',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    level: 'warning',
    message: 'High memory usage detected',
    source: 'system-monitor',
    details: { memoryUsage: 85.2 },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    level: 'error',
    message: 'Database connection timeout',
    source: 'database-service',
    details: { timeout: 5000, retries: 3 },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    level: 'info',
    message: 'Property listing created successfully',
    source: 'property-service',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    level: 'warning',
    message: 'Slow query detected',
    source: 'database-service',
    details: { queryTime: 2500, query: 'SELECT * FROM properties' },
  },
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    type: 'login_attempt',
    severity: 'medium',
    description: 'Failed login attempt from IP 192.168.1.100',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'permission_denied',
    severity: 'low',
    description: 'User attempted to access admin panel without permission',
    userId: 'user-123',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    type: 'rate_limit_exceeded',
    severity: 'high',
    description: 'API rate limit exceeded from IP 10.0.0.50',
    ipAddress: '10.0.0.50',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'suspicious_activity',
    severity: 'critical',
    description: 'Multiple failed login attempts from same IP',
    ipAddress: '203.0.113.0',
  },
];

export default function AdminSystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [logs, setLogs] = useState<SystemLog[]>(mockSystemLogs);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const refreshMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/monitoring');
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }
      const data = await response.json();
      setMetrics(data.metrics);
      setLogs(data.logs);
      setSecurityEvents(data.securityEvents);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Error",
        description: "Failed to refresh monitoring data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (usage: number) => {
    if (usage < 60) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (level: string) => {
    switch (level) {
      case 'info':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Info</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
      case 'critical':
        return <Badge variant="outline" className="text-red-800 border-red-800 bg-red-50">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSecuritySeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refreshMetrics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(metrics.uptime)}</p>
                <p className="text-sm text-muted-foreground">System running time</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{metrics.responseTime}ms</p>
                <p className="text-sm text-muted-foreground">Average API response</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{metrics.network.connections}</p>
                <p className="text-sm text-muted-foreground">Current users online</p>
              </div>
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Network className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU & Memory Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className={`text-lg font-bold ${getStatusColor(metrics.cpu.usage)}`}>
                      {metrics.cpu.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.cpu.usage < 60 ? 'bg-green-500' :
                        metrics.cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.cpu.usage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Temperature: {metrics.cpu.temperature}°C</span>
                    <span>Cores: {metrics.cpu.cores}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className={`text-lg font-bold ${getStatusColor(metrics.memory.usage)}`}>
                      {metrics.memory.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.memory.usage < 60 ? 'bg-green-500' :
                        metrics.memory.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.memory.usage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Used: {formatBytes(metrics.memory.used)}</span>
                    <span>Total: {formatBytes(metrics.memory.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage & Network</CardTitle>
                <CardDescription>Disk usage and network activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className={`text-lg font-bold ${getStatusColor(metrics.disk.usage)}`}>
                      {metrics.disk.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.disk.usage < 60 ? 'bg-green-500' :
                        metrics.disk.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.disk.usage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Used: {formatBytes(metrics.disk.used)}</span>
                    <span>Total: {formatBytes(metrics.disk.total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Activity</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inbound</p>
                      <p className="font-medium">{formatBytes(metrics.network.bytesIn)}/s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outbound</p>
                      <p className="font-medium">{formatBytes(metrics.network.bytesOut)}/s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Real-time database metrics and health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{metrics.database.connections}</p>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{metrics.database.queriesPerSecond}</p>
                  <p className="text-sm text-muted-foreground">Queries/Second</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{metrics.database.slowQueries}</p>
                  <p className="text-sm text-muted-foreground">Slow Queries</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{formatUptime(metrics.database.uptime)}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{metrics.loadAverage[0].toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">1 Minute Load</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{metrics.loadAverage[1].toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">5 Minute Load</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{metrics.loadAverage[2].toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">15 Minute Load</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusBadge(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.source} • {formatTimeAgo(log.timestamp)}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Recent security incidents and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={`border-current ${getSecuritySeverityColor(event.severity)}`}
                      >
                        {event.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.type.replace(/_/g, ' ')} • {formatTimeAgo(event.timestamp)}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        {event.ipAddress && (
                          <span>IP: {event.ipAddress}</span>
                        )}
                        {event.userId && (
                          <span>User: {event.userId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
