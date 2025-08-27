'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { propertyService } from '@/lib/services/propertyService';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { DatabaseProperty } from '@/lib/types/database';
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Eye, 
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';

interface PropertyListingProps {
  limit?: number;
  showFeatured?: boolean;
}

export default function PropertyListing({ limit = 6, showFeatured = false }: PropertyListingProps) {
  const [properties, setProperties] = useState<DatabaseProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, [showFeatured]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (showFeatured) {
        response = await propertyService.getFeaturedProperties(limit);
      } else {
        response = await propertyService.getProperties({ limit, sort_by: 'created_at', sort_order: 'desc' });
      }

      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError(response.error || 'Failed to load properties');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyView = async (propertyId: string) => {
    try {
      // Track the view in analytics
      await AnalyticsService.trackPropertyView(propertyId);
      
      // Increment the view count in the database
      await propertyService.incrementViews(propertyId);
      
      // Reload properties to show updated view count
      loadProperties();
    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  };

  const handleFavorite = async (propertyId: string) => {
    try {
      await AnalyticsService.trackFavorite(propertyId, 'added');
      // In a real app, you'd toggle favorite status
    } catch (error) {
      console.error('Error tracking favorite:', error);
    }
  };

  const handleShare = async (propertyId: string) => {
    try {
      await AnalyticsService.trackShare(propertyId, 'whatsapp');
      // In a real app, you'd open share dialog
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'GHS') {
      return `₵${price.toLocaleString()}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <Home className="w-4 h-4" />;
      case 'apartment':
        return <Home className="w-4 h-4" />;
      case 'land':
        return <Square className="w-4 h-4" />;
      case 'commercial':
        return <Home className="w-4 h-4" />;
      case 'office':
        return <Home className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadProperties} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          {showFeatured ? 'No featured properties available.' : 'No properties found.'}
        </p>
        <Button onClick={loadProperties} variant="outline">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          onClick={() => handlePropertyView(property.id)}
        >
          <CardHeader className="p-0">
            <div className="relative">
              {/* Property Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Home className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Property Image</p>
                </div>
              </div>
              
              {/* Property Type Badge */}
              <Badge className="absolute top-2 left-2 bg-primary/90 text-white">
                {getPropertyTypeIcon(property.property_type)}
                <span className="ml-1 capitalize">{property.property_type}</span>
              </Badge>
              
              {/* Featured Badge */}
              {property.is_featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
              
              {/* Listing Type Badge */}
              <Badge className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground">
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
              {property.title}
            </CardTitle>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.city}, {property.region}</span>
            </div>
            
            <div className="text-2xl font-bold text-primary mb-3">
              {formatPrice(property.price, property.currency)}
              {property.listing_type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
            </div>
            
            {/* Property Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms} beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms} baths</span>
                </div>
              )}
              {property.square_feet && (
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{property.square_feet} sq ft</span>
                </div>
              )}
            </div>
            
            {/* Property Features */}
            {property.features && property.features.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {property.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {property.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Property Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{property.views_count} views</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>Contact</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle contact/inquiry
                }}
              >
                Contact Agent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(property.id);
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(property.id);
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
