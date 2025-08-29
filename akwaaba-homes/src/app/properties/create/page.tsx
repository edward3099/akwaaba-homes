'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { Loader2, Home, MapPin, DollarSign, Bed, Bath, Car, Ruler } from 'lucide-react';

export default function CreatePropertyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAgent, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'GHS',
    propertyType: 'residential',
    listingType: 'rent',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    area: '',
    location: {
      address: '',
      coordinates: [0, 0],
      plusCode: ''
    },
    features: [],
    images: []
  });

  // Check if user is authenticated and is an agent or admin
  if (!user) {
    router.push('/login?redirect=/properties/create');
    return null;
  }

  if (!isAgent && !isAdmin) {
    router.push('/unauthorized');
    return null;
  }

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.location.address) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Transform form data to match API expectations
      const apiData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        property_type: formData.propertyType,
        listing_type: formData.listingType,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        square_feet: parseFloat(formData.area) || 0,
        address: formData.location.address,
        city: 'Accra', // Default city
        region: 'Greater Accra', // Default region
        latitude: formData.location.coordinates[0] || null,
        longitude: formData.location.coordinates[1] || null,
        features: formData.features || [],
        amenities: [],
        status: 'pending'
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Property Created Successfully!',
          description: 'Your property has been submitted for review.',
        });
        // Redirect to agent dashboard
        router.push('/agent-dashboard');
      } else {
        toast({
          title: 'Creation Failed',
          description: data.error || 'An error occurred while creating the property',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Property creation error:', error);
      toast({
        title: 'Creation Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create New Property Listing
            </CardTitle>
            <CardDescription className="text-gray-600">
              Add a new property to your portfolio
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Beautiful 3-bedroom house in Accra"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <select
                      id="propertyType"
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="listingType">Listing Type</Label>
                    <select
                      id="listingType"
                      value={formData.listingType}
                      onChange={(e) => handleInputChange('listingType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="rent">For Rent</option>
                      <option value="sale">For Sale</option>
                      <option value="lease">For Lease</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the property, its features, and what makes it special..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parking">Parking Spaces</Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="parking"
                        type="number"
                        min="0"
                        value={formData.parking}
                        onChange={(e) => handleInputChange('parking', e.target.value)}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="area"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (GHS) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GHS">GHS (Ghana Cedi)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={formData.location.address}
                      onChange={(e) => handleInputChange('location.address', e.target.value)}
                      placeholder="Enter the full address of the property"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plusCode">Plus Code (Optional)</Label>
                    <Input
                      id="plusCode"
                      value={formData.location.plusCode}
                      onChange={(e) => handleInputChange('location.plusCode', e.target.value)}
                      placeholder="e.g., 8FXP+2M Accra, Ghana"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coordinates">Coordinates (Optional)</Label>
                    <Input
                      id="coordinates"
                      value={`${formData.location.coordinates[0]}, ${formData.location.coordinates[1]}`}
                      onChange={(e) => {
                        const [lat, lng] = e.target.value.split(',').map(Number);
                        if (!isNaN(lat) && !isNaN(lng)) {
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: [lat, lng]
                            }
                          }));
                        }
                      }}
                      placeholder="Latitude, Longitude"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Property...
                  </>
                ) : (
                  'Create Property Listing'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
