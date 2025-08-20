'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  Eye,
  MessageSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface DashboardStatsProps {
  stats: {
    totalListings: number;
    activeListings: number;
    expiringSoon: number;
    totalViews: number;
    totalInquiries: number;
    responseRate: number;
    averageResponseTime: string;
    monthlyEarnings: number;
    conversionRate: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: Home,
      description: `${stats.activeListings} active`,
      trend: stats.expiringSoon > 0 ? `${stats.expiringSoon} expiring soon` : 'All up to date',
      trendType: stats.expiringSoon > 0 ? 'warning' : 'positive' as const
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      description: 'This month',
      trend: '+12% from last month',
      trendType: 'positive' as const
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      description: 'This month',
      trend: `${stats.responseRate}% response rate`,
      trendType: 'positive' as const
    },
    {
      title: 'Response Time',
      value: stats.averageResponseTime,
      icon: Clock,
      description: 'Average response',
      trend: 'Within 4 hours',
      trendType: 'positive' as const
    },
    {
      title: 'Monthly Earnings',
      value: formatCurrency(stats.monthlyEarnings, 'GHS'),
      icon: DollarSign,
      description: 'From listing fees',
      trend: '+8% from last month',
      trendType: 'positive' as const
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Target,
      description: 'Views to inquiries',
      trend: 'Above average',
      trendType: 'positive' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Here's how your properties are performing this month
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {stat.trendType === 'positive' && (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    )}
                    {stat.trendType === 'warning' && (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    <span className={`text-xs ${
                      stat.trendType === 'positive' 
                        ? 'text-green-600' 
                        : stat.trendType === 'warning'
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-600 font-medium">Inquiry Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                Industry average: 1.8%
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {(stats.totalViews / stats.activeListings).toFixed(0)}
              </div>
              <div className="text-sm text-blue-600 font-medium">Views per Listing</div>
              <div className="text-xs text-muted-foreground mt-1">
                Well above average
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {stats.responseRate}%
              </div>
              <div className="text-sm text-purple-600 font-medium">Response Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                Excellent performance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
