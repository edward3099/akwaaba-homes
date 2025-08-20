'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardStats } from '@/components/seller/DashboardStats';
import { PropertyManagement } from '@/components/seller/PropertyManagement';
import { InquiryManagement } from '@/components/seller/InquiryManagement';
import { ListingCreator } from '@/components/seller/ListingCreator';
import { VerificationStatus } from '@/components/seller/VerificationStatus';
import { 
  Plus,
  Home,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Eye,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { Property, Agent } from '@/lib/types';

// Mock seller/agent data
const mockAgent: Agent = {
  id: 'agent_001',
  email: 'kwame@premiumestates.com.gh',
  name: 'Kwame Asante',
  phone: '+233244123456',
  type: 'seller',
  location: {
    country: 'Ghana',
    region: 'Greater Accra'
  },
  preferences: {
    currency: 'GHS',
    notifications: {
      email: true,
      sms: true,
      whatsapp: true
    },
    savedSearches: [],
    favoriteProperties: []
  },
  verification: {
    emailVerified: true,
    phoneVerified: true
  },
  createdAt: '2023-06-15',
  updatedAt: '2024-01-15',
  agentProfile: {
    company: 'Premium Estates Ghana',
    licenseNumber: 'REA-GH-2024-001',
    experienceYears: 8,
    specializations: ['house', 'apartment', 'commercial'],
    bio: 'Experienced real estate agent specializing in luxury properties in Greater Accra. Committed to helping both local and diaspora clients find their dream homes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    rating: 4.8,
    reviewCount: 127,
    isVerified: true,
    verificationDocuments: ['license', 'id', 'company_registration']
  }
};

// Mock dashboard stats
const dashboardStats = {
  totalListings: 12,
  activeListings: 8,
  expiringSoon: 2,
  totalViews: 1847,
  totalInquiries: 34,
  responseRate: 92,
  averageResponseTime: '2.3 hours',
  monthlyEarnings: 4500, // GHS
  conversionRate: 18.5
};

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'inquiries' | 'analytics' | 'settings'>('overview');
  const [showCreateListing, setShowCreateListing] = useState(false);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {mockAgent.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {mockAgent.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{mockAgent.agentProfile?.company}</span>
                  {mockAgent.agentProfile?.isVerified && (
                    <Badge className="verification-badge">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button 
                onClick={() => setShowCreateListing(true)}
                className="btn-ghana flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeTab === item.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <div className="mt-6">
                <VerificationStatus agent={mockAgent} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <DashboardStats stats={dashboardStats} />

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setShowCreateListing(true)}
                      >
                        <Plus className="w-6 h-6" />
                        <span>Create New Listing</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setActiveTab('inquiries')}
                      >
                        <MessageSquare className="w-6 h-6" />
                        <span>View Inquiries</span>
                        {dashboardStats.totalInquiries > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {dashboardStats.totalInquiries}
                          </Badge>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setActiveTab('analytics')}
                      >
                        <BarChart3 className="w-6 h-6" />
                        <span>View Analytics</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Eye className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium">New inquiry received</p>
                          <p className="text-sm text-muted-foreground">
                            Someone is interested in your "4-Bedroom Villa in East Legon"
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium">Listing performance boost</p>
                          <p className="text-sm text-muted-foreground">
                            Your premium listing got 47 views today
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">6 hours ago</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Bell className="w-5 h-5 text-amber-600" />
                        <div className="flex-1">
                          <p className="font-medium">Listing expiring soon</p>
                          <p className="text-sm text-muted-foreground">
                            "Modern Apartment in Airport" expires in 3 days
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">1 day ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'properties' && (
              <PropertyManagement 
                agentId={mockAgent.id}
                onCreateListing={() => setShowCreateListing(true)}
              />
            )}

            {activeTab === 'inquiries' && (
              <InquiryManagement agentId={mockAgent.id} />
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground">
                        Detailed analytics and reporting features will be available here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Settings Panel</h3>
                      <p className="text-muted-foreground">
                        Account settings and preferences will be configurable here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateListing && (
        <ListingCreator
          onClose={() => setShowCreateListing(false)}
          agent={mockAgent}
        />
      )}
    </div>
  );
}
