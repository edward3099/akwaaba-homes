'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, MapPin, Filter } from 'lucide-react';
import { Property } from '@/lib/types';

// Mock data - in production this would come from an API
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury 4-Bedroom Villa in East Legon',
    description: 'Stunning modern villa with panoramic city views, private pool, and premium finishes throughout.',
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
      lotSize: 5000,
      lotSizeUnit: 'sqft',
      yearBuilt: 2023,
      parkingSpaces: 2,
    },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Swimming Pool', 'Garden', 'Security', 'Parking'],
    amenities: ['24/7 Security', 'Backup Generator', 'Borehole Water'],
    seller: {
      id: 'seller1',
      name: 'Kwame Asante Properties',
      type: 'agent',
      phone: '+233244123456',
      whatsapp: '+233244123456',
      isVerified: true,
      company: 'Premium Estates Ghana',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
      verificationDate: '2024-01-15',
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    expiresAt: '2024-02-10',
    tier: 'premium',
  },
  {
    id: '2',
    title: 'Modern 3-Bedroom Apartment in Airport Residential',
    description: 'Contemporary apartment with modern amenities, close to Kotoka International Airport.',
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
      parkingSpaces: 1,
    },
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Balcony', 'Modern Kitchen', 'Air Conditioning'],
    amenities: ['Elevator', '24/7 Security', 'Gym', 'Swimming Pool'],
    seller: {
      id: 'seller2',
      name: 'Ama Owusu',
      type: 'agent',
      phone: '+233244654321',
      whatsapp: '+233244654321',
      isVerified: true,
      company: 'Accra Prime Properties',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
    expiresAt: '2024-02-12',
    tier: 'standard',
  },
  {
    id: '3',
    title: '2-Bedroom House in Kumasi',
    description: 'Comfortable family home in a quiet neighborhood with easy access to schools and markets.',
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
      lotSize: 2000,
      lotSizeUnit: 'sqft',
      yearBuilt: 2020,
    },
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Garden', 'Parking', 'Security Fence'],
    amenities: ['Water Tank', 'Solar Ready'],
    seller: {
      id: 'seller3',
      name: 'Kofi Mensah',
      type: 'individual',
      phone: '+233244789012',
      whatsapp: '+233244789012',
      isVerified: true,
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    expiresAt: '2024-02-08',
    tier: 'basic',
  },
];

export function FeaturedProperties() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'greater-accra', label: 'Greater Accra' },
    { value: 'ashanti', label: 'Ashanti' },
    { value: 'western', label: 'Western' },
    { value: 'central', label: 'Central' },
  ];

  const filteredProperties = selectedRegion === 'all' 
    ? mockProperties 
    : mockProperties.filter(p => p.location.region.toLowerCase().replace(' ', '-') === selectedRegion);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">


        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Region:</span>
            </div>
            <div className="flex gap-2">
              {regions.map((region) => (
                <Button
                  key={region.value}
                  variant={selectedRegion === region.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRegion(region.value)}
                  className="text-sm"
                >
                  {region.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Properties Grid/List */}
        <div className={`grid gap-6 mb-12 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredProperties.map((property, index) => (
            <div 
              key={property.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard 
                property={property} 
                viewMode={viewMode}
                onSave={(id) => console.log('Saved property:', id)}
                onContact={(property) => console.log('Contact for property:', property.title)}
              />
            </div>
          ))}
        </div>

        {/* Load More / View All */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="flex items-center gap-2 mx-auto"
          >
            View All Properties
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredProperties.length} of 5,000+ verified properties
          </p>
        </div>


      </div>
    </section>
  );
}
