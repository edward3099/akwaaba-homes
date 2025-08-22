'use client';

import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { MapPin, ChevronDown } from 'lucide-react';
import { Property } from '@/lib/types';
import { useState } from 'react';

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
  {
    id: '8',
    title: '2-Bedroom Apartment for Rent in Osu',
    description: 'Modern apartment in the heart of Osu, close to restaurants, shops, and nightlife.',
    price: 2500,
    currency: 'GHS',
    status: 'for-rent',
    type: 'apartment',
    location: {
      address: 'Osu Oxford Street',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.5600, lng: -0.1869 },
    },
    specifications: {
      bedrooms: 2,
      bathrooms: 1,
      size: 1200,
      sizeUnit: 'sqft',
      yearBuilt: 2021,
      parkingSpaces: 1,
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Balcony', 'Modern Kitchen', 'Air Conditioning'],
    amenities: ['24/7 Security', 'Elevator', 'Gym'],
    seller: {
      id: 'seller8',
      name: 'Osu Properties',
      type: 'agent',
      phone: '+233244789014',
      whatsapp: '+233244789014',
      isVerified: true,
      company: 'Osu Properties Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    expiresAt: '2024-02-20',
    tier: 'standard',
  },
  {
    id: '9',
    title: '3-Bedroom House for Rent in East Legon',
    description: 'Spacious family home with garden and parking, perfect for families.',
    price: 3500,
    currency: 'GHS',
    status: 'for-rent',
    type: 'house',
    location: {
      address: 'East Legon',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6037, lng: -0.1870 },
    },
    specifications: {
      bedrooms: 3,
      bathrooms: 2,
      size: 2000,
      sizeUnit: 'sqft',
      lotSize: 3000,
      lotSizeUnit: 'sqft',
      yearBuilt: 2020,
      parkingSpaces: 2,
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Garden', 'Parking', 'Security', 'Modern Kitchen'],
    amenities: ['24/7 Security', 'Backup Generator', 'Water Tank'],
    seller: {
      id: 'seller9',
      name: 'East Legon Rentals',
      type: 'agent',
      phone: '+233244789015',
      whatsapp: '+233244789015',
      isVerified: true,
      company: 'East Legon Rentals Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
    expiresAt: '2024-02-18',
    tier: 'premium',
  },
  {
    id: '10',
    title: 'Luxury Villa for Short Let in Labadi',
    description: 'Exclusive villa perfect for short stays, close to Labadi Beach.',
    price: 800,
    currency: 'GHS',
    status: 'short-let',
    type: 'house',
    location: {
      address: 'Labadi Beach Road',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.5500, lng: -0.1667 },
    },
    specifications: {
      bedrooms: 4,
      bathrooms: 3,
      size: 3000,
      sizeUnit: 'sqft',
      lotSize: 4000,
      lotSizeUnit: 'sqft',
      yearBuilt: 2022,
      parkingSpaces: 3,
    },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Beach Access', 'Swimming Pool', 'Garden', 'Ocean View'],
    amenities: ['24/7 Security', 'Housekeeping', 'Concierge', 'WiFi'],
    seller: {
      id: 'seller10',
      name: 'Labadi Luxury Stays',
      type: 'agent',
      phone: '+233244789016',
      whatsapp: '+233244789016',
      isVerified: true,
      company: 'Labadi Luxury Stays Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
    expiresAt: '2024-02-22',
    tier: 'premium',
  },
  {
    id: '11',
    title: 'Modern Apartment for Short Let in Cantonments',
    description: 'Contemporary apartment perfect for business travelers and tourists.',
    price: 450,
    currency: 'GHS',
    status: 'short-let',
    type: 'apartment',
    location: {
      address: 'Cantonments',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.5600, lng: -0.1869 },
    },
    specifications: {
      bedrooms: 2,
      bathrooms: 1,
      size: 1500,
      sizeUnit: 'sqft',
      yearBuilt: 2023,
      parkingSpaces: 1,
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Modern Design', 'Fully Furnished', 'Air Conditioning', 'Balcony'],
    amenities: ['24/7 Security', 'WiFi', 'Housekeeping', 'Gym Access'],
    seller: {
      id: 'seller11',
      name: 'Cantonments Stays',
      type: 'agent',
      phone: '+233244789017',
      whatsapp: '+233244789017',
      isVerified: true,
      company: 'Cantonments Stays Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
    },
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
    expiresAt: '2024-02-25',
    tier: 'standard',
  },
];

export function FeaturedProperties() {
  // Add state for property type selection
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('for-sale');
  
  // Filter properties based on selected property type
  const filteredProperties = mockProperties.filter(property => {
    switch (selectedPropertyType) {
      case 'for-sale':
        return property.status === 'for-sale';
      case 'for-rent':
        return property.status === 'for-rent';
      case 'short-let':
        return property.status === 'short-let';
      default:
        return true; // Show all properties if no specific type is selected
    }
  });

  // Handle property type selection
  const handlePropertyTypeChange = (type: string) => {
    setSelectedPropertyType(type);
  };

  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <section className="py-6 bg-muted/30">
      <div className="container mx-auto px-3">

        {/* Full Search Form */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 border border-border/50">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Find your new property</h2>
            </div>

            {/* Search Form */}
            <form className="space-y-4">
              {/* Property Type Tabs */}
              <div className="form-group">
                <ul className="flex justify-center space-x-1" id="">
                  <li id="li-cid-for-sale" className="flex-1">
                    <input 
                      type="radio" 
                      name="cid" 
                      id="cid-for-sale" 
                      value="for-sale" 
                      checked={selectedPropertyType === 'for-sale'}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="cid-for-sale" 
                      className={`block w-full px-3 py-2 text-center text-sm font-medium rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPropertyType === 'for-sale'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white text-muted-foreground border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      Buy
                    </label>
                  </li>
                  <li id="li-cid-for-rent" className="flex-1">
                    <input 
                      type="radio" 
                      name="cid" 
                      id="cid-for-rent" 
                      value="for-rent" 
                      checked={selectedPropertyType === 'for-rent'}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="cid-for-rent" 
                      className={`block w-full px-3 py-2 text-center text-sm font-medium rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPropertyType === 'for-rent'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white text-muted-foreground border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      Rent
                    </label>
                  </li>
                  <li id="li-cid-short-let" className="flex-1">
                    <input 
                      type="radio" 
                      name="cid" 
                      id="cid-short-let" 
                      value="short-let" 
                      checked={selectedPropertyType === 'short-let'}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="cid-short-let" 
                      className={`block w-full px-3 py-2 text-center text-sm font-medium rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPropertyType === 'short-let'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white text-muted-foreground border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      Short Let
                    </label>
                  </li>
                </ul>
              </div>

              {/* Location Input */}
              <div className="form-group">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    id="propertyLocation" 
                    name="propertyLocation" 
                    placeholder="Enter a region, district or subdistrict" 
                    type="text" 
                    className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    autoComplete="off"
                  />
                </div>
                <em className="text-sm text-red-500 hidden" id="no-location-found">Location not found</em>
                <input type="hidden" name="sid" id="sid" />
                <input type="hidden" name="lid" id="lid" />
                <input type="hidden" name="slid" id="slid" />
                <input type="hidden" name="n" id="n" />
                <input type="hidden" name="selectedLoc" id="selectedLoc" />
              </div>

              {/* Filter Panel */}
              <div className="filter-panel">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                    <select name="tid" id="tid" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                      <option value="0">All Types</option>
                      <option value="1">Apartment</option>
                      <option value="2">House</option>
                      <option value="5">Land</option>
                      <option value="3">Commercial Property</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-foreground mb-1">Bedrooms</label>
                    <select name="bedrooms" id="bedrooms" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                      <option value="0">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-foreground mb-1">Min price</label>
                    <select name="minprice" id="minprice" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                      <option value="0">No Min</option>
                      <option value="250">GH₵ 250</option>
                      <option value="300">GH₵ 300</option>
                      <option value="400">GH₵ 400</option>
                      <option value="500">GH₵ 500</option>
                      <option value="600">GH₵ 600</option>
                      <option value="800">GH₵ 800</option>
                      <option value="1000">GH₵ 1,000</option>
                      <option value="1200">GH₵ 1,200</option>
                      <option value="1400">GH₵ 1,400</option>
                      <option value="1600">GH₵ 1,600</option>
                      <option value="1800">GH₵ 1,800</option>
                      <option value="2000">GH₵ 2,000</option>
                      <option value="2500">GH₵ 2,500</option>
                      <option value="5000">GH₵ 5,000</option>
                      <option value="10000">GH₵ 10,000</option>
                      <option value="25000">GH₵ 25,000</option>
                      <option value="50000">GH₵ 50,000</option>
                      <option value="100000">GH₵ 100,000</option>
                      <option value="150000">GH₵ 150,000</option>
                      <option value="200000">GH₵ 200,000</option>
                      <option value="250000">GH₵ 250,000</option>
                      <option value="300000">GH₵ 300,000</option>
                      <option value="350000">GH₵ 350,000</option>
                      <option value="400000">GH₵ 400,000</option>
                      <option value="500000">GH₵ 500,000</option>
                      <option value="600000">GH₵ 600,000</option>
                      <option value="750000">GH₵ 750,000</option>
                      <option value="1000000">GH₵ 1 Million</option>
                      <option value="2000000">GH₵ 2 Million</option>
                      <option value="5000000">GH₵ 5 Million</option>
                      <option value="10000000">GH₵ 10 Million</option>
                      <option value="25000000">GH₵ 25 Million</option>
                      <option value="50000000">GH₵ 50 Million</option>
                      <option value="100000000">GH₵ 100 Million</option>
                      <option value="125000000">GH₵ 125 Million</option>
                      <option value="150000000">GH₵ 150 Million</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-foreground mb-1">Max price</label>
                    <select name="maxprice" id="maxprice" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                      <option value="0">No Max</option>
                      <option value="250">GH₵ 250</option>
                      <option value="300">GH₵ 300</option>
                      <option value="400">GH₵ 400</option>
                      <option value="500">GH₵ 500</option>
                      <option value="600">GH₵ 600</option>
                      <option value="800">GH₵ 800</option>
                      <option value="1000">GH₵ 1,000</option>
                      <option value="1200">GH₵ 1,200</option>
                      <option value="1400">GH₵ 1,400</option>
                      <option value="1600">GH₵ 1,600</option>
                      <option value="1800">GH₵ 1,800</option>
                      <option value="2000">GH₵ 2,000</option>
                      <option value="2500">GH₵ 2,500</option>
                      <option value="5000">GH₵ 5,000</option>
                      <option value="10000">GH₵ 10,000</option>
                      <option value="25000">GH₵ 25,000</option>
                      <option value="50000">GH₵ 50,000</option>
                      <option value="100000">GH₵ 100,000</option>
                      <option value="150000">GH₵ 150,000</option>
                      <option value="200000">GH₵ 200,000</option>
                      <option value="250000">GH₵ 250,000</option>
                      <option value="300000">GH₵ 300,000</option>
                      <option value="350000">GH₵ 350,000</option>
                      <option value="400000">GH₵ 400,000</option>
                      <option value="500000">GH₵ 500,000</option>
                      <option value="600000">GH₵ 600,000</option>
                      <option value="750000">GH₵ 750,000</option>
                      <option value="1000000">GH₵ 1 Million</option>
                      <option value="2000000">GH₵ 2 Million</option>
                      <option value="5000000">GH₵ 5 Million</option>
                      <option value="10000000">GH₵ 10 Million</option>
                      <option value="25000000">GH₵ 25 Million</option>
                      <option value="50000000">GH₵ 50 Million</option>
                      <option value="100000000">GH₵ 100 Million</option>
                      <option value="125000000">GH₵ 125 Million</option>
                      <option value="150000000">GH₵ 150 Million</option>
                    </select>
                  </div>
            </div>
          </div>

              {/* Advanced Search Panel */}
              <div className="filter-panel">
                <div className="border rounded-lg">
                  {/* Advanced Search Collapsible */}
                  <div className="border-b">
                    <div className="flex items-center justify-between p-3">
                      <div className="hidden sm:block">
                        <h4 className="text-sm font-medium text-foreground">
                          <button 
                            type="button"
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                            onClick={() => {
                              // Toggle advanced search visibility
                              const advancedSearch = document.getElementById('advanced-search');
                              if (advancedSearch) {
                                advancedSearch.classList.toggle('hidden');
                              }
                            }}
                          >
                            More search options
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </h4>
                      </div>
                      <div className="sm:hidden text-center">
                        <h4 className="text-sm font-medium text-foreground">
                          <button 
                            type="button"
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                            onClick={() => {
                              // Toggle advanced search visibility
                              const advancedSearch = document.getElementById('advanced-search');
                              if (advancedSearch) {
                                advancedSearch.classList.toggle('hidden');
                              }
                            }}
                          >
                            More search options
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </h4>
                      </div>
                      <div className="flex-1 sm:flex-none sm:ml-3">
            <Button
                          type="submit" 
                          size="default"
                          className="w-full sm:w-auto px-6 py-2 text-sm font-medium"
                        >
                          Search
            </Button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Search Content */}
                  <div id="advanced-search" className="hidden p-3 bg-muted/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-foreground mb-1">Furnishing</label>
                        <select name="furnished" id="furnished" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="0">Any</option>
                          <option value="1">Furnished</option>
                          <option value="2">Unfurnished</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-foreground mb-1">Serviced</label>
                        <select name="serviced" id="serviced" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="0">Any</option>
                          <option value="1">Serviced</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-foreground mb-1">Shared</label>
                        <select name="shared" id="shared" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="0">Any</option>
                          <option value="1">Shared</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-foreground mb-1">Added to site</label>
                        <select name="added" id="added" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="0">Anytime</option>
                          <option value="1">Last 24 hours</option>
                          <option value="3">Last 3 days</option>
                          <option value="7">Last 7 days</option>
                          <option value="14">Last 14 days</option>
                          <option value="30">Last 30 days</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-foreground mb-1">Keywords</label>
                        <input 
                          name="keywords" 
                          id="keywords" 
                          className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                          placeholder="e.g. 'pool' or 'jacuzzi'" 
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-foreground mb-1">Property Ref.</label>
                        <input 
                          name="ref" 
                          id="ref" 
                          className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                          placeholder="e.g. 83256" 
                          type="number" 
                          min="0" 
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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

        {/* Pagination */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3 py-2"
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  className="px-3 py-2 min-w-[40px]"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
          <Button 
              size="sm" 
            variant="outline" 
              className="px-3 py-2"
              onClick={handleNextPage}
          >
              Next
          </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {filteredProperties.length} of 5,000+ verified properties
          </p>
        </div>


      </div>
    </section>
  );
}
