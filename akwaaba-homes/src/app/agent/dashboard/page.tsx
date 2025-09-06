'use client';

import { useAuth } from '@/lib/auth/authContext';
import { LoadingSpinner } from '@/components/ui/loading';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, Users, Settings, BarChart3, FileText, X, Upload, Building, MapPin, DollarSign } from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  property_type: string;
  status: string;
  location: string;
  address: string;
  city: string;
  region: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  area_unit: string;
  features: string[];
  images: File[];
}

export default function AgentDashboardPage() {
  const { user, loading, isAgent, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    activeProperties: 0,
    totalInquiries: 0
  });
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    currency: 'GHS',
    property_type: '',
    status: 'pending',
    location: '',
    address: '',
    city: '',
    region: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    area_unit: 'sqft',
    features: [],
    images: []
  });
  const [newFeature, setNewFeature] = useState('');

  // Check authentication and role
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/agent-dashboard');
      return;
    }
    
    if (!loading && user && !isAgent && !isAdmin) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, isAgent, isAdmin, router]);

  // Fetch agent stats
  useEffect(() => {
    if (user && (isAgent || isAdmin)) {
      fetchAgentStats();
    }
  }, [user, isAgent, isAdmin]);

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agent/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch agent stats:', error);
    }
  };

  // Form handling functions
  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.property_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setFormLoading(true);
    
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        property_type: formData.property_type,
        status: formData.status,
        location: {
          address: formData.address,
          city: formData.city,
          region: formData.region,
          coordinates: undefined,
          plusCode: undefined
        },
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        area: formData.area ? parseFloat(formData.area) : undefined,
        features: formData.features,
        images: formData.images
      };

      const response = await fetch('/api/agent/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to create properties",
            variant: "destructive"
          });
          return;
        }
        throw new Error('Failed to create property');
      }

      toast({
        title: "Success",
        description: "Property created successfully!",
      });

      // Reset form and hide it
      setFormData({
        title: '',
        description: '',
        price: '',
        currency: 'GHS',
        property_type: '',
        status: 'pending',
        location: '',
        address: '',
        city: '',
        region: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        area_unit: 'sqft',
        features: [],
        images: []
      });
      setShowPropertyForm(false);
      
      // Refresh stats
      fetchAgentStats();
      
    } catch (error) {
      console.error('Create property error:', error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      currency: 'GHS',
      property_type: '',
      status: 'pending',
      location: '',
      address: '',
      city: '',
      region: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      area_unit: 'sqft',
      features: [],
      images: []
    });
    setNewFeature('');
    setShowPropertyForm(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || (!isAgent && !isAdmin)) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            Agent Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base break-words">
            Welcome back, {user.user_metadata?.first_name || user.email}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                All your property listings
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Pending Approval</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.pendingProperties}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting admin review
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Active Listings</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.activeProperties}</div>
              <p className="text-xs text-muted-foreground">
                Currently visible to buyers
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium min-w-0">Total Inquiries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalInquiries}</div>
              <p className="text-xs text-muted-foreground">
                Buyer interest in your properties
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <div onClick={() => setShowPropertyForm(!showPropertyForm)}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">
                    {showPropertyForm ? 'Hide Property Form' : 'Add New Property'}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {showPropertyForm ? 'Cancel property creation' : 'Create a new property listing'}
                </CardDescription>
              </CardHeader>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/properties">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Manage Properties</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  View and edit your property listings
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/inquiries">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">View Inquiries</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Check buyer inquiries and messages
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/profile">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Profile Settings</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Update your profile and preferences
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/analytics">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Performance Analytics</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  View your property performance metrics
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer min-w-0">
            <Link href="/agent/support">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base min-w-0">Support & Help</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Get help and contact support
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Property Creation Form */}
        {showPropertyForm && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Property
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Fill in the details below to create a new property listing
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Home className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>
                    
                    <div>
                      <Label htmlFor="title">Property Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Beautiful 3-bedroom house in Accra"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your property in detail..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="property_type">Property Type *</Label>
                        <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Location & Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Location & Details
                    </h3>
                    
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., East Legon, Accra"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Full Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          value={formData.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          placeholder="Region"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area</Label>
                        <Input
                          id="area"
                          type="number"
                          value={formData.area}
                          onChange={(e) => handleInputChange('area', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="area_unit">Area Unit</Label>
                      <Select value={formData.area_unit} onValueChange={(value) => handleInputChange('area_unit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqft">Square Feet</SelectItem>
                          <SelectItem value="sqm">Square Meters</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                          <SelectItem value="hectares">Hectares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <Building className="w-5 h-5 mr-2" />
                    Property Features
                  </h3>
                  <div className="flex space-x-2 mb-4">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="e.g., Swimming Pool, Garden, Security"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    />
                    <Button type="button" onClick={handleAddFeature} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feature)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <Upload className="w-5 h-5 mr-2" />
                    Property Images
                  </h3>
                  <div>
                    <Label htmlFor="images">Upload Images</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1"
                    />
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="default" className="text-xs">Main</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="mt-6 flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? 'Creating...' : 'Create Property'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-sm">
              Your latest property updates and inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">No recent activity to display</p>
              <p className="text-xs sm:text-sm">Start by adding your first property!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
