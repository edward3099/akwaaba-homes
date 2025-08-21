'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, MapPin, Filter, Search } from 'lucide-react';
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
  {
    id: '6',
    title: 'Luxury Villa in Cape Coast',
    description: 'Stunning oceanfront villa with panoramic sea views and private beach access.',
    price: 1200000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'house',
    location: {
      address: 'Cape Coast Castle Road',
      city: 'Cape Coast',
      region: 'Central',
      country: 'Ghana',
      coordinates: { lat: 5.1053, lng: -1.2466 },
    },
    specifications: {
      bedrooms: 5,
      bathrooms: 4,
      size: 4500,
      sizeUnit: 'sqft',
      lotSize: 8000,
      lotSizeUnit: 'sqft',
      yearBuilt: 2021,
      parkingSpaces: 3,
    },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Ocean View', 'Private Beach', 'Swimming Pool', 'Garden'],
    amenities: ['24/7 Security', 'Backup Generator', 'Borehole Water', 'Solar Panels'],
    seller: {
      id: 'seller6',
      name: 'Cape Coast Estates',
      type: 'developer',
      phone: '+233244789012',
      whatsapp: '+233244789012',
      isVerified: true,
      company: 'Cape Coast Estates Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    expiresAt: '2024-02-05',
    tier: 'premium',
  },
  {
    id: '7',
    title: 'Commercial Space in Takoradi',
    description: 'Prime commercial property in the heart of Takoradi business district.',
    price: 850000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'commercial',
    location: {
      address: 'Harbor Road',
      city: 'Takoradi',
      region: 'Western',
      country: 'Ghana',
      coordinates: { lat: 4.9011, lng: -1.7833 },
    },
    specifications: {
      size: 2500,
      sizeUnit: 'sqft',
      yearBuilt: 2020,
      parkingSpaces: 5,
    },
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['High Traffic Area', 'Modern Design', 'Parking'],
    amenities: ['24/7 Security', 'Backup Generator', 'Loading Bay'],
    seller: {
      id: 'seller7',
      name: 'Western Properties',
      type: 'developer',
      phone: '+233244789013',
      whatsapp: '+233244789013',
      isVerified: true,
      company: 'Western Properties Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
    expiresAt: '2024-02-03',
    tier: 'standard',
  },
];

export function FeaturedProperties() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'greater-accra', label: 'Greater Accra' },
    { value: 'ashanti', label: 'Ashanti' },
    { value: 'western', label: 'Western' },
    { value: 'central', label: 'Central' },
    { value: 'eastern', label: 'Eastern' },
    { value: 'volta', label: 'Volta' },
    { value: 'northern', label: 'Northern' },
    { value: 'upper-east', label: 'Upper East' },
    { value: 'upper-west', label: 'Upper West' },
    { value: 'bono', label: 'Bono' },
    { value: 'ahafo', label: 'Ahafo' },
    { value: 'savannah', label: 'Savannah' },
    { value: 'north-east', label: 'North East' },
  ];

  const filteredProperties = selectedRegion === 'all' 
    ? mockProperties 
    : mockProperties.filter(p => p.location.region.toLowerCase().replace(' ', '-') === selectedRegion);

  return (
    <section className="py-6 bg-muted/30">
      <div className="container mx-auto px-3">


        {/* Region Filter - Form-Based Design */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border border-border/50">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Find Your New Property</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Select your preferred region to discover properties</p>
            </div>

            {/* Region Selection Form */}
            <form className="space-y-6">
              {/* Region Selection */}
              <div className="form-group">
                <label className="block text-sm font-medium text-foreground mb-3">
                  <MapPin className="w-4 h-4 inline mr-2 text-primary" />
                  Choose Your Region
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {regions.map((region) => (
                    <div key={region.value} className="flex-shrink-0">
                      <input
                        type="radio"
                        id={`region-${region.value}`}
                        name="region"
                        value={region.value}
                        checked={selectedRegion === region.value}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`region-${region.value}`}
                        className={`
                          block w-full px-4 py-3 text-center text-sm font-medium rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${selectedRegion === region.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                            : 'bg-white text-muted-foreground border-border hover:border-primary/50 hover:bg-accent/50 hover:text-foreground'
                          }
                        `}
                      >
                        {region.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Selection Display */}
              <div className="text-center pt-4 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Currently viewing:</span>
                <span className="ml-2 text-sm font-semibold text-primary">
                  {regions.find(r => r.value === selectedRegion)?.label}
                </span>
              </div>

              {/* Search Button */}
              <div className="text-center pt-2">
                <Button 
                  type="button"
                  size="lg"
                  className="px-8 py-3 text-base font-medium"
                  onClick={() => {
                    // Handle region-based search
                    console.log('Searching in region:', selectedRegion);
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-2 sm:gap-3 mb-12 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property, index) => (
            <div 
              key={property.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard 
                property={property} 
                viewMode="grid"
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
