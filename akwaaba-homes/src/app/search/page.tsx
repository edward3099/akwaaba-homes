'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientOnly } from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/property/PropertyCard';
import { SearchBar } from '@/components/search/SearchBar';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { SortControls } from '@/components/search/SortControls';
import { ViewToggle } from '@/components/search/ViewToggle';
import { Pagination } from '@/components/search/Pagination';
import { 
  Filter, 
  MapPin, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  TrendingUp,
  X
} from 'lucide-react';
import { Property, SearchFilters, SortOption, CurrencyCode } from '@/lib/types';

// Extended mock data for search results
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
  // Additional properties for search results...
  {
    id: '4',
    title: 'Spacious 5-Bedroom Executive Home in Tema',
    description: 'Executive family home with large compound, ideal for families seeking comfort and security.',
    price: 1200000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'house',
    location: {
      address: 'Community 25',
      city: 'Tema',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6698, lng: 0.0166 },
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
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Swimming Pool', 'Generator', 'CCTV', 'Garage'],
    amenities: ['24/7 Security', 'Landscaped Garden', 'Servant Quarters'],
    seller: {
      id: 'seller4',
      name: 'Grace Tema Properties',
      type: 'agent',
      phone: '+233244567890',
      whatsapp: '+233244567890',
      isVerified: true,
      company: 'Tema Luxury Homes',
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
];

function SearchResults() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});

  const itemsPerPage = 12;
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  // Initialize filters from URL params (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlFilters: SearchFilters = {};
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const currencyParam = searchParams.get('currency');

    if (query) urlFilters.location = query;
    if (type) urlFilters.type = [type as Property['type']];
    if (status) urlFilters.status = status as Property['status'];
    if (currencyParam) setCurrency(currencyParam as CurrencyCode);

    setFilters(urlFilters);
  }, [searchParams]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // In a real app, this would make an API call
    console.log('Searching with filters:', newFilters);
  };

  const handleSort = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    // Apply sorting logic here
    console.log('Sorting by:', newSortBy);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <SearchBar 
            onSearch={handleSearch}
            defaultValues={{
              query: filters.location || '',
              type: filters.type?.[0],
              currency: currency,
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={handleSearch}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {filters.location ? `Properties in ${filters.location}` : 'All Properties'}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{properties.length} properties found</span>
                  {filters.status && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filters Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="default" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <SortControls sortBy={sortBy} onSortChange={handleSort} />
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.type?.map((type) => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    {type}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      const newFilters = { ...filters };
                      newFilters.type = newFilters.type?.filter(t => t !== type);
                      if (newFilters.type?.length === 0) delete newFilters.type;
                      handleSearch(newFilters);
                    }} />
                  </Badge>
                ))}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters.location;
                      handleSearch(newFilters);
                    }} />
                  </Badge>
                )}
              </div>
            )}

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden mb-6 bg-white rounded-2xl shadow-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    handleSearch(newFilters);
                    setShowFilters(false);
                  }}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                />
              </div>
            )}

            {/* Properties Grid/List */}
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {currentProperties.map((property, index) => (
                <div 
                  key={property.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PropertyCard 
                    property={property} 
                    viewMode={viewMode}
                    showCurrency={currency}
                    onSave={(id) => console.log('Saved property:', id)}
                    onContact={(property) => console.log('Contact for property:', property.title)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
