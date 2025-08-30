'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  DollarSign,
  Eye,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Smartphone,
  Globe,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Import Recharts components normally - SSR will be handled at component level
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number; agents: number }>;
  propertyMetrics: Array<{ month: string; listed: number; sold: number; views: number }>;
  revenueData: Array<{ month: string; revenue: number; transactions: number }>;
  platformStats: {
    totalUsers: number;
    totalProperties: number;
    totalRevenue: number;
    activeAgents: number;
    conversionRate: number;
    avgPropertyPrice: number;
  };
  deviceUsage: Array<{ device: string; percentage: number }>;
  locationData: Array<{ city: string; properties: number; users: number }>;
}

const mockAnalyticsData: AnalyticsData = {
  userGrowth: [
    { date: '2024-01', users: 120, agents: 15 },
    { date: '2024-02', users: 180, agents: 22 },
    { date: '2024-03', users: 250, agents: 28 },
    { date: '2024-04', users: 320, agents: 35 },
    { date: '2024-05', users: 400, agents: 42 },
    { date: '2024-06', users: 480, agents: 47 },
  ],
  propertyMetrics: [
    { month: 'Jan', listed: 45, sold: 12, views: 1200 },
    { month: 'Feb', listed: 52, sold: 18, views: 1800 },
    { month: 'Mar', listed: 48, sold: 15, views: 1600 },
    { month: 'Apr', listed: 61, sold: 22, views: 2200 },
    { month: 'May', listed: 58, sold: 20, views: 2000 },
    { month: 'Jun', listed: 65, sold: 25, views: 2500 },
  ],
  revenueData: [
    { month: 'Jan', revenue: 45000, transactions: 12 },
    { month: 'Feb', revenue: 68000, transactions: 18 },
    { month: 'Mar', revenue: 52000, transactions: 15 },
    { month: 'Apr', revenue: 89000, transactions: 22 },
    { month: 'May', revenue: 78000, transactions: 20 },
    { month: 'Jun', revenue: 95000, transactions: 25 },
  ],
  platformStats: {
    totalUsers: 480,
    totalProperties: 156,
    totalRevenue: 387000,
    activeAgents: 47,
    conversionRate: 8.2,
    avgPropertyPrice: 2480,
  },
  deviceUsage: [
    { device: 'Mobile', percentage: 68 },
    { device: 'Desktop', percentage: 28 },
    { device: 'Tablet', percentage: 4 },
  ],
  locationData: [
    { city: 'Accra', properties: 89, users: 280 },
    { city: 'Kumasi', properties: 34, users: 95 },
    { city: 'Tamale', properties: 18, users: 52 },
    { city: 'Sekondi', properties: 15, users: 53 },
  ],
};

const COLORS = ['#C21807', '#FFD700', '#00A86B', '#6366F1', '#EC4899'];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.status} ${response.statusText}`);
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GH').format(num);
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0,
      icon: growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />,
      color: growth >= 0 ? 'text-green-600' : 'text-red-600',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Platform performance and user insights</p>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Analytics</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance and user insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(data.platformStats.totalUsers)}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +12.5%
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{formatNumber(data.platformStats.totalProperties)}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +8.3%
                </div>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.platformStats.totalRevenue)}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +15.2%
                </div>
              </div>
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{formatNumber(data.platformStats.activeAgents)}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +6.8%
                </div>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user and agent registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#C21807" fill="#C21807" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="agents" stackId="1" stroke="#00A86B" fill="#00A86B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-lg font-bold text-green-600">{data.platformStats.conversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Property Price</span>
                  <span className="text-lg font-bold">{formatCurrency(data.platformStats.avgPropertyPrice)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.deviceUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }) => `${device} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {data.deviceUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>Detailed user acquisition and growth patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#C21807" strokeWidth={2} />
                    <Line type="monotone" dataKey="agents" stroke="#00A86B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>Property listings, sales, and view metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.propertyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="listed" fill="#C21807" />
                    <Bar dataKey="sold" fill="#00A86B" />
                    <Bar dataKey="views" fill="#FFD700" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue and transaction volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#00A86B" fill="#00A86B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Location Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Property and user distribution across major cities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.locationData.map((location) => (
              <div key={location.city} className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">{location.city}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <Building2 className="inline mr-1 h-4 w-4" />
                    {location.properties} properties
                  </p>
                  <p className="text-sm text-gray-600">
                    <Users className="inline mr-1 h-4 w-4" />
                    {location.users} users
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
