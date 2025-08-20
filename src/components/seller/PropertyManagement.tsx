'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  Clock,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';

interface PropertyManagementProps {
  agentId: string;
  onCreateListing: () => void;
}

// Mock properties for the seller
const mockSellerProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury 4-Bedroom Villa in East Legon',
    description: 'Stunning modern villa with panoramic city views',
    price: 850000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'house',
    location: {
      address: 'East Legon Hills',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6037, lng: -0.1870 },
    },
    specifications: {
      bedrooms: 4,
      bathrooms: 3,
      size: 3200,
      sizeUnit: 'sqft',
      yearBuilt: 2023,
      parkingSpaces: 2,
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    ],
    features: ['Swimming Pool', 'Garden', 'Security'],
    amenities: ['24/7 Security', 'Generator'],
    seller: {
      id: 'agent_001',
      name: 'Kwame Asante',
      type: 'agent',
      phone: '+233244123456',
      isVerified: true,
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    expiresAt: '2024-02-10',
    tier: 'premium',
    // Add performance metrics
    performance: {
      views: 234,
      inquiries: 8,
      saves: 12,
      lastViewed: '2024-01-20T10:30:00Z'
    }
  },
  {
    id: '2',
    title: 'Modern 3-Bedroom Apartment in Airport',
    description: 'Contemporary apartment with modern amenities',
    price: 450000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'apartment',
    location: {
      address: 'Airport Residential Area',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6037, lng: -0.1870 },
    },
    specifications: {
      bedrooms: 3,
      bathrooms: 2,
      size: 1800,
      sizeUnit: 'sqft',
      yearBuilt: 2022,
    },
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    ],
    features: ['Balcony', 'Modern Kitchen'],
    amenities: ['Elevator', 'Security'],
    seller: {
      id: 'agent_001',
      name: 'Kwame Asante',
      type: 'agent',
      phone: '+233244123456',
      isVerified: true,
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
    expiresAt: '2024-01-25', // Expiring soon
    tier: 'standard',
    performance: {
      views: 89,
      inquiries: 3,
      saves: 5,
      lastViewed: '2024-01-19T15:20:00Z'
    }
  },
  {
    id: '3',
    title: '2-Bedroom House in Kumasi',
    description: 'Comfortable family home in quiet neighborhood',
    price: 280000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'house',
    location: {
      address: 'Ahodwo',
      city: 'Kumasi',
      region: 'Ashanti',
      country: 'Ghana',
      coordinates: { lat: 6.6885, lng: -1.6244 },
    },
    specifications: {
      bedrooms: 2,
      bathrooms: 1,
      size: 1200,
      sizeUnit: 'sqft',
      yearBuilt: 2020,
    },
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    ],
    features: ['Garden', 'Parking'],
    amenities: ['Water Tank'],
    seller: {
      id: 'agent_001',
      name: 'Kwame Asante',
      type: 'agent',
      phone: '+233244123456',
      isVerified: true,
    },
    verification: {
      isVerified: false,
      documentsUploaded: false,
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    expiresAt: '2024-02-08',
    tier: 'basic',
    performance: {
      views: 45,
      inquiries: 1,
      saves: 2,
      lastViewed: '2024-01-18T09:15:00Z'
    }
  },
];

export function PropertyManagement({ agentId, onCreateListing }: PropertyManagementProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price' | 'views'>('newest');

  // Filter properties based on status and search
  const filteredProperties = mockSellerProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const now = new Date();
    const expiryDate = new Date(property.expiresAt);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filterStatus) {
      case 'active':
        return daysUntilExpiry > 7;
      case 'expiring':
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      case 'draft':
        return !property.verification.isVerified;
      default:
        return true;
    }
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price':
        return b.price - a.price;
      case 'views':
        return (b.performance?.views || 0) - (a.performance?.views || 0);
      default:
        return 0;
    }
  });

  const getStatusBadge = (property: Property) => {
    const now = new Date();
    const expiryDate = new Date(property.expiresAt);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (!property.verification.isVerified) {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Draft</Badge>;
    }
    
    if (daysUntilExpiry <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (daysUntilExpiry <= 7) {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">
        Expires in {daysUntilExpiry} days
      </Badge>;
    }
    
    return <Badge className="bg-green-600">Active</Badge>;
  };

  const getTierBadge = (tier: Property['tier']) => {
    const tierConfig = {
      basic: { label: 'Basic', className: 'bg-gray-500' },
      standard: { label: 'Standard', className: 'bg-blue-500' },
      premium: { label: 'Premium', className: 'bg-purple-600' }
    };
    
    const config = tierConfig[tier];
    return (
      <Badge className={`${config.className} text-white`}>
        {tier === 'premium' && <Star className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Properties</h2>
          <p className="text-muted-foreground">
            Manage your property listings and track performance
          </p>
        </div>
        <Button onClick={onCreateListing} className="btn-ghana flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Listing
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="views">Views</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {sortedProperties.map((property) => (
          <Card key={property.id} className="property-card-shadow hover:shadow-lg transition-shadow">
            <div className={`${viewMode === 'list' ? 'flex' : ''}`}>
              {/* Image */}
              <div className={`relative ${
                viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-[4/3]'
              } bg-gray-100 rounded-lg overflow-hidden`}>
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {getTierBadge(property.tier)}
                  {getStatusBadge(property)}
                </div>

                {/* Performance Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <div className="flex items-center gap-1 text-xs">
                    <Eye className="w-3 h-3" />
                    <span>{property.performance?.views || 0}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="space-y-3">
                  {/* Title and Price */}
                  <div>
                    <h3 className="font-semibold text-lg leading-tight mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location.address}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(property.price, 'GHS')}
                  </div>

                  {/* Specifications */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.specifications.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.specifications.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>{property.specifications.size.toLocaleString()} {property.specifications.sizeUnit}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{property.performance?.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{property.performance?.inquiries || 0} inquiries</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Listed {new Date(property.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedProperties.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Create your first property listing to get started.'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={onCreateListing} className="btn-ghana">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
