'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  StarIcon,
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/lib/auth/authContext';

// Types for our API responses
interface DashboardStats {
  properties: {
    total: number;
    active: number;
    pending: number;
    featured: number;
  };
  users: {
    total: number;
    agents: number;
    sellers: number;
    buyers: number;
  };
  revenue: {
    total: number;
    monthly: number;
    premium: number;
  };
  activity: {
    views: number;
    inquiries: number;
    approvals: number;
  };
}

interface ChartDataPoint {
  date: string;
  properties: number;
  users: number;
  revenue: number;
  views: number;
}

interface RecentActivity {
  id: string;
  type: 'property_created' | 'property_approved' | 'user_registered' | 'payment_received' | 'admin_action';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface Property {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  owner_name: string;
  created_at: string;
  price: number;
  currency: string;
}

interface PremiumPricing {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AdminDashboardProps {
  initialTab?: string;
}

export default function AdminDashboard({ initialTab = 'dashboard' }: AdminDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [propertySubTab, setPropertySubTab] = useState('overview');
  const [agentsSubTab, setAgentsSubTab] = useState('overview');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview');
  const [paymentsSubTab, setPaymentsSubTab] = useState('overview');
  
  // State for real data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [premiumPricing, setPremiumPricing] = useState<PremiumPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();

      // Fetch chart data (using analytics endpoint)
      const chartResponse = await fetch('/api/admin/analytics?timeRange=30d');
      if (!chartResponse.ok) throw new Error('Failed to fetch chart data');
      const chartData = await chartResponse.json();

      // Fetch recent activity (mock data for now)
      const activityData = { activities: [] };

      // Fetch pending properties
      const propertiesResponse = await fetch('/api/admin/properties?status=pending&limit=5');
      if (!propertiesResponse.ok) throw new Error('Failed to fetch pending properties');
      const propertiesData = await propertiesResponse.json();

      // Fetch premium pricing (mock data for now)
      const pricingData = { pricing: [] };

      setStats(statsData);
      setChartData(chartData.data || []);
      setRecentActivity(activityData.activities || []);
      setPendingProperties(propertiesData.properties || []);
      setPremiumPricing(pricingData.pricing || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle property approval/rejection
  const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch('/api/admin/properties/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          action,
          notes: notes || ''
        })
      });

      if (!response.ok) throw new Error('Failed to update property status');
      
      // Refresh data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Property action error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
    }
  };

  // Handle agent approval/rejection
  const handleAgentAction = async (agentId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch('/api/admin/agents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          action,
          reason: action === 'reject' ? (notes || 'Application rejected') : undefined,
          adminNotes: notes || ''
        })
      });

      if (!response.ok) throw new Error('Failed to update agent status');
      
      // Refresh data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Agent action error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update agent status');
    }
  };

  // Handle premium pricing updates
  const handlePricingUpdate = async (pricingId: string, updates: Partial<PremiumPricing>) => {
    try {
      const response = await fetch(`/api/admin/premium-pricing/${pricingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update premium pricing');
      
      // Refresh data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Pricing update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update pricing');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'properties', name: 'Properties', icon: BuildingOfficeIcon },
    { id: 'agents', name: 'Agents', icon: UsersIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'payments', name: 'Payments', icon: CurrencyDollarIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Monitor and manage your platform performance</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats && (
                    <>
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
                          </div>
                          <div className="ml-4 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 truncate">Total Properties</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.properties.total}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {stats.properties.active} Active
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UsersIcon className="h-8 w-8 text-green-500" />
                          </div>
                          <div className="ml-4 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 truncate">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {stats.users.agents} Agents
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
                          </div>
                          <div className="ml-4 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">${stats.revenue.total.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            ${stats.revenue.monthly.toLocaleString()}/month
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <StarIcon className="h-8 w-8 text-purple-500" />
                          </div>
                          <div className="ml-4 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 truncate">Premium Listings</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.properties.featured}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            ${stats.revenue.premium.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Properties Chart */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Properties Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="properties" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity and Pending Properties */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {activity.type === 'property_created' && <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />}
                            {activity.type === 'user_registered' && <UsersIcon className="h-5 w-5 text-green-500" />}
                            {activity.type === 'payment_received' && <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />}
                            {activity.type === 'admin_action' && <CogIcon className="h-5 w-5 text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Properties */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h3>
                    <div className="space-y-3">
                      {pendingProperties.slice(0, 5).map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{property.title}</p>
                            <p className="text-sm text-gray-500">by {property.owner_name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(property.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePropertyAction(property.id, 'approve')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handlePropertyAction(property.id, 'reject')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingProperties.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No pending properties</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Property Management</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Property Approval Queue</h3>
              </div>
              <div className="p-6">
                {pendingProperties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingProperties.map((property) => (
                          <tr key={property.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(property.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {property.owner_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${property.price.toLocaleString()} {property.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Pending
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePropertyAction(property.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handlePropertyAction(property.id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No pending properties for approval</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Premium Pricing Management</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Premium Listing Packages</h3>
              </div>
              <div className="p-6">
                {premiumPricing.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {premiumPricing.map((pricing) => (
                      <div key={pricing.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">{pricing.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pricing.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pricing.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-gray-900">
                            ${pricing.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            for {pricing.duration_days} days
                          </p>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Features:</h5>
                          <ul className="space-y-1">
                            {pricing.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePricingUpdate(pricing.id, { is_active: !pricing.is_active })}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              pricing.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {pricing.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No premium pricing packages configured</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Agent Management</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Agent Applications</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* This will be populated with real data from the API */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Test Agent 2</div>
                            <div className="text-sm text-gray-500">testagent2@gmail.com</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Test Company
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          TEST456
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAgentAction('dd0304ba-5c4a-42f8-a4a5-f2542b740213', 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAgentAction('dd0304ba-5c4a-42f8-a4a5-f2542b740213', 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <tab.icon className="h-5 w-5 inline mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
