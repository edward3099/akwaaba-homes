'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Star, 
  Eye, 
  DollarSign, 
  Calendar,
  MapPin,
  Home,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Types for our API responses
interface PropertyRecommendation {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  score: number;
  reason: string;
  images?: Array<{
    url: string;
    is_primary: boolean;
  }>;
}

interface PaymentData {
  amount: number;
  currency: string;
  payment_method: 'paystack' | 'flutterwave' | 'stripe';
  property_id?: string;
  premium_package_id?: string;
  description: string;
}

interface PaymentResponse {
  success: boolean;
  transaction_id: string;
  payment_url?: string;
  message: string;
}

interface MarketTrend {
  period: string;
  location: string;
  property_type: string;
  avg_price: number;
  price_change: number;
  volume_change: number;
  demand_score: number;
}

interface PricePrediction {
  property_id: string;
  current_price: number;
  predicted_price: number;
  confidence: number;
  factors: string[];
  timeline: string;
}

interface UserBehavior {
  user_id: string;
  search_patterns: string[];
  favorite_properties: string[];
  view_history: string[];
  inquiry_history: string[];
  preferences: {
    price_range: [number, number];
    locations: string[];
    property_types: string[];
  };
}

interface PropertyPerformance {
  property_id: string;
  title: string;
  views: number;
  inquiries: number;
  conversion_rate: number;
  avg_time_on_page: number;
  bounce_rate: number;
  revenue_generated: number;
}

interface DemandAnalysis {
  location: string;
  property_type: string;
  demand_score: number;
  supply_score: number;
  price_trend: 'increasing' | 'decreasing' | 'stable';
  market_opportunity: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedFeatures() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [propertyPerformance, setPropertyPerformance] = useState<PropertyPerformance[]>([]);
  const [demandAnalysis, setDemandAnalysis] = useState<DemandAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment form state
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'GHS',
    payment_method: 'paystack',
    description: ''
  });

  // Recommendation filters
  const [recommendationFilters, setRecommendationFilters] = useState({
    type: 'personalized',
    limit: 10,
    location: '',
    propertyType: ''
  });

  // Fetch ML recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type: recommendationFilters.type,
        limit: recommendationFilters.limit.toString()
      });

      if (recommendationFilters.location) params.set('location', recommendationFilters.location);
      if (recommendationFilters.propertyType) params.set('propertyType', recommendationFilters.propertyType);

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      console.error('Recommendations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch advanced analytics
  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch market trends
      const trendsResponse = await fetch('/api/analytics/advanced?type=market_trends&period=30d');
      if (!trendsResponse.ok) throw new Error('Failed to fetch market trends');
      const trendsData = await trendsResponse.json();

      // Fetch price predictions
      const predictionsResponse = await fetch('/api/analytics/advanced?type=price_predictions&period=30d');
      if (!predictionsResponse.ok) throw new Error('Failed to fetch price predictions');
      const predictionsData = await predictionsResponse.json();

      // Fetch user behavior
      const behaviorResponse = await fetch('/api/analytics/advanced?type=user_behavior&period=30d');
      if (!behaviorResponse.ok) throw new Error('Failed to fetch user behavior');
      const behaviorData = await behaviorResponse.json();

      // Fetch property performance
      const performanceResponse = await fetch('/api/analytics/advanced?type=property_performance&period=30d');
      if (!performanceResponse.ok) throw new Error('Failed to fetch property performance');
      const performanceData = await performanceResponse.json();

      // Fetch demand analysis
      const demandResponse = await fetch('/api/analytics/advanced?type=demand_analysis&period=30d');
      if (!demandResponse.ok) throw new Error('Failed to fetch demand analysis');
      const demandData = await demandResponse.json();

      setMarketTrends(trendsData.data || []);
      setPricePredictions(predictionsData.data || []);
      setUserBehavior(behaviorData.data || null);
      setPropertyPerformance(performanceData.data || []);
      setDemandAnalysis(demandData.data || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process payment
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) throw new Error('Failed to process payment');
      
      const paymentResult: PaymentResponse = await response.json();
      
      if (paymentResult.success && paymentResult.payment_url) {
        // Redirect to payment gateway
        window.open(paymentResult.payment_url, '_blank');
      } else {
        setError(paymentResult.message || 'Payment failed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify payment
  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/payments?transaction_id=${transactionId}&payment_method=${paymentData.payment_method}`);
      if (!response.ok) throw new Error('Failed to verify payment');
      
      const verificationResult = await response.json();
      console.log('Payment verification:', verificationResult);
      
    } catch (err) {
      console.error('Payment verification error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchRecommendations();
    } else if (activeTab === 'analytics') {
      fetchAdvancedAnalytics();
    }
  }, [activeTab, recommendationFilters]);

  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">AI-Powered Property Recommendations</h2>
        <Button onClick={fetchRecommendations} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Filters</CardTitle>
          <CardDescription>Customize your property recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={recommendationFilters.type} onValueChange={(value) => setRecommendationFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalized">Personalized</SelectItem>
                  <SelectItem value="similar">Similar Properties</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="market">Market Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">Limit</Label>
              <Select value={recommendationFilters.limit.toString()} onValueChange={(value) => setRecommendationFilters(prev => ({ ...prev, limit: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Accra, Kumasi"
                value={recommendationFilters.location}
                onChange={(e) => setRecommendationFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Input
                id="propertyType"
                placeholder="e.g., Apartment, House"
                value={recommendationFilters.propertyType}
                onChange={(e) => setRecommendationFilters(prev => ({ ...prev, propertyType: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images.find(img => img.is_primary)?.url || property.images[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-blue-600">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Score: {property.score.toFixed(1)}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>
                <div className="text-xl font-bold text-green-600 mb-3">
                  ${property.price.toLocaleString()} {property.currency}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>🛏️ {property.bedrooms} beds</span>
                  <span>🚿 {property.bathrooms} baths</span>
                  <span>📐 {property.square_feet?.toLocaleString()} sq ft</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Why recommended:</strong> {property.reason}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later</p>
        </Card>
      )}
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Payment System</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make a Payment</CardTitle>
            <CardDescription>Process payments for premium listings or other services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={paymentData.currency} onValueChange={(value) => setPaymentData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS (Ghana Cedi)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentData.payment_method} onValueChange={(value: any) => setPaymentData(prev => ({ ...prev, payment_method: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paystack">Paystack</SelectItem>
                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  required
                  value={paymentData.description}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Payment description"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Process Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Payment Methods</CardTitle>
            <CardDescription>Secure payment options for your convenience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Paystack</h4>
                <p className="text-sm text-gray-600">Local Ghanaian payments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Flutterwave</h4>
                <p className="text-sm text-gray-600">Pan-African payments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-gray-600">International payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics & Insights</h2>
      
      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
          <CardDescription>Real estate market analysis and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {marketTrends.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marketTrends.map((trend, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.property_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trend.avg_price.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={trend.price_change >= 0 ? 'default' : 'destructive'}>
                          {trend.price_change >= 0 ? '+' : ''}{trend.price_change.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${trend.demand_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{trend.demand_score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No market trends data available</p>
          )}
        </CardContent>
      </Card>

      {/* Price Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Price Predictions</CardTitle>
          <CardDescription>AI-powered property price forecasting</CardDescription>
        </CardHeader>
        <CardContent>
          {pricePredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricePredictions.map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Property {prediction.property_id.slice(0, 8)}...</h4>
                    <Badge variant="outline">
                      {prediction.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Price:</span>
                      <span className="font-medium">${prediction.current_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predicted Price:</span>
                      <span className="font-medium text-green-600">${prediction.predicted_price.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Timeline:</strong> {prediction.timeline}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Key Factors:</strong> {prediction.factors.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No price predictions available</p>
          )}
        </CardContent>
      </Card>

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance Analytics</CardTitle>
          <CardDescription>Detailed performance metrics for your properties</CardDescription>
        </CardHeader>
        <CardContent>
          {propertyPerformance.length > 0 ? (
            <div className="space-y-4">
              {propertyPerformance.map((property, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{property.title}</h4>
                    <Badge variant="outline">
                      ${property.revenue_generated.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Views:</span>
                      <div className="font-medium">{property.views.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Inquiries:</span>
                      <div className="font-medium">{property.inquiries}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Conversion:</span>
                      <div className="font-medium">{property.conversion_rate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Bounce Rate:</span>
                      <div className="font-medium">{property.bounce_rate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No property performance data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Features</h1>
          <p className="text-gray-600 mt-2">AI-powered insights, payments, and advanced analytics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">
              <Brain className="h-4 w-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment System
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Advanced Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            {renderRecommendationsTab()}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {renderPaymentsTab()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderAnalyticsTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
