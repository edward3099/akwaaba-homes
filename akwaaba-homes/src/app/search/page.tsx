'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/property/PropertyCard';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { Pagination } from '@/components/search/Pagination';
import { useSearchState } from '@/hooks/useSearchState';
import { 
  MapPin, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  X,
  House,
  DollarSign,
  ChevronDown,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { Property, SearchFilters, CurrencyCode } from '@/lib/types/index';

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
      '/placeholder-property.svg',
      '/placeholder-property.svg',
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
      adminNotes: 'All documents verified and property inspected.',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-02-05',
    tier: 'premium',
  },
  {
    id: '2',
    title: 'Modern 3-Bedroom Apartment in Airport City',
    description: 'Contemporary apartment with modern amenities, located in the heart of Airport City with easy access to major roads.',
    price: 450000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'apartment',
    location: {
      address: 'Airport City',
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
      lotSize: 0,
      lotSizeUnit: 'sqft',
      yearBuilt: 2022,
      parkingSpaces: 1,
    },
    images: [
      '/placeholder-property.svg',
      '/placeholder-property.svg',
    ],
    features: ['Balcony', 'Security', 'Parking', 'Elevator'],
    amenities: ['24/7 Security', 'Backup Generator', 'Swimming Pool'],
    seller: {
      id: 'seller2',
      name: 'Airport City Properties',
      type: 'agent',
      phone: '+233244123457',
      whatsapp: '+233244123457',
      isVerified: true,
      company: 'Airport City Estates',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
      verificationDate: '2024-01-10',
      adminNotes: 'Property verified and ready for listing.',
    },
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    expiresAt: '2024-02-10',
    tier: 'normal',
  },
  {
    id: '3',
    title: 'Prime Development Land in Tema',
    description: 'Excellent development opportunity in Tema Industrial Area, perfect for commercial or residential development.',
    price: 800000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'land',
    location: {
      address: 'Tema Industrial Area',
      city: 'Tema',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6037, lng: -0.1870 },
    },
    specifications: {
      bedrooms: 0,
      bathrooms: 0,
      size: 0,
      sizeUnit: 'sqft',
      lotSize: 10000,
      lotSizeUnit: 'sqft',
      yearBuilt: 0,
      parkingSpaces: 0,
    },
    images: [
      '/placeholder-property.svg',
    ],
    features: ['Flat Terrain', 'Road Access', 'Drainage', 'Security'],
    amenities: ['24/7 Security', 'Fenced Perimeter'],
    seller: {
      id: 'seller3',
      name: 'Tema Land Development',
      type: 'agent',
      phone: '+233244123458',
      whatsapp: '+233244123458',
      isVerified: true,
      company: 'Tema Development Co.',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
      verificationDate: '2024-01-05',
      adminNotes: 'Land title verified and survey completed.',
    },
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
    expiresAt: '2024-02-05',
    tier: 'premium',
  },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  
  // Use the new search state hook
  const {
    filters,
    isInitialized,
    updateFilters,
    updateFilter,
    clearFilters,
    getCurrentURLFilters
  } = useSearchState();
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]') && !target.closest('.absolute')) {
        setShowPropertyTypeDropdown(false);
        setShowPriceDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dropdown states
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Form states
  const [locationInput, setLocationInput] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('All Types');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('Any Price');
  const [selectedSort, setSelectedSort] = useState<string>('Most Relevant');

  const itemsPerPage = 12;
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  // Initialize form states from filters when they change
  useEffect(() => {
    if (isInitialized && filters) {
      if (filters.location) setLocationInput(filters.location);
      if (filters.type && filters.type.length > 0) {
        setSelectedPropertyType(filters.type[0] === 'house' ? 'House' : 
                              filters.type[0] === 'apartment' ? 'Apartment' : 
                              filters.type[0] === 'land' ? 'Land' : 
                              filters.type[0] === 'commercial' ? 'Commercial' : 'All Types');
      }
      // Remove access to non-existent properties
      // if (filters.currency) setCurrency(filters.currency);
      // if (filters.page) setCurrentPage(filters.page);
    }
  }, [filters, isInitialized]);

  const handleSearch = (newFilters: SearchFilters) => {
    updateFilters(newFilters);
    setCurrentPage(1);
    // In a real app, this would make an API call
  };

  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
    setLocationInput('');
    setSelectedPropertyType('All Types');
    setSelectedPriceRange('Any Price');
    setSelectedSort('Most Relevant');
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Dropdown options
  const propertyTypes = ['All Types', 'House', 'Apartment', 'Land', 'Commercial'];
  const priceRanges = ['Any Price', 'Under ₵200K', '₵200K - ₵500K', '₵500K - ₵1M', 'Over ₵1M'];
  const sortOptions = ['Most Relevant', 'Price: Low to High', 'Price: High to Low', 'Newest First', 'Oldest First'];

  // Dropdown handlers
  const handlePropertyTypeSelect = (type: string) => {
    setSelectedPropertyType(type);
    setShowPropertyTypeDropdown(false);
    
    // Update filters
    if (type === 'All Types') {
      updateFilter('type', undefined);
    } else {
      const typeMap: Record<string, any> = {
        'House': 'house',
        'Apartment': 'apartment',
        'Land': 'land',
        'Commercial': 'commercial'
      };
      updateFilter('type', [typeMap[type]]);
    }
  };

  const handlePriceRangeSelect = (range: string) => {
    setSelectedPriceRange(range);
    setShowPriceDropdown(false);
    
    // Update filters based on price range
    if (range === 'Any Price') {
      updateFilter('priceRange', undefined);
    } else {
      const priceMap: Record<string, { min?: number; max?: number; currency: CurrencyCode }> = {
        'Under ₵200K': { max: 200000, currency: 'GHS' },
        '₵200K - ₵500K': { min: 200000, max: 500000, currency: 'GHS' },
        '₵500K - ₵1M': { min: 500000, max: 1000000, currency: 'GHS' },
        'Over ₵1M': { min: 1000000, currency: 'GHS' }
      };
      updateFilter('priceRange', priceMap[range]);
    }
  };

  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort);
    setShowSortDropdown(false);
    
    // Update filters based on sort
    const sortMap: Record<string, { sortBy: string; sortOrder: string }> = {
      'Most Relevant': { sortBy: 'relevance', sortOrder: 'desc' },
      'Price: Low to High': { sortBy: 'price', sortOrder: 'asc' },
      'Price: High to Low': { sortBy: 'price', sortOrder: 'desc' },
      'Newest First': { sortBy: 'createdAt', sortOrder: 'desc' },
      'Oldest First': { sortBy: 'createdAt', sortOrder: 'asc' }
    };
    
    if (sortMap[sort]) {
      updateFilter('sortBy', sortMap[sort].sortBy);
      updateFilter('sortOrder', sortMap[sort].sortOrder);
    }
  };

  const handleSearchClick = () => {
    const newFilters: SearchFilters = {};
    
    if (locationInput) newFilters.location = locationInput;
    if (selectedPropertyType !== 'All Types') {
      const typeMap: Record<string, any> = {
        'House': 'house',
        'Apartment': 'apartment',
        'Land': 'land',
        'Commercial': 'commercial'
      };
      newFilters.type = [typeMap[selectedPropertyType]];
    }
    if (selectedPriceRange !== 'Any Price') {
      const priceMap: Record<string, { min?: number; max?: number; currency: CurrencyCode }> = {
        'Under ₵200K': { max: 200000, currency: 'GHS' },
        '₵200K - ₵500K': { min: 200000, max: 500000, currency: 'GHS' },
        '₵500K - ₵1M': { min: 500000, max: 1000000, currency: 'GHS' },
        'Over ₵1M': { min: 1000000, currency: 'GHS' }
      };
      newFilters.priceRange = priceMap[selectedPriceRange];
    }
    
    // Remove non-existent properties
    // newFilters.currency = currency;
    // newFilters.page = 1;
    
    updateFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Remove updateFilter call since 'page' doesn't exist in SearchFilters
    // updateFilter('page', page);
  };

  // Don't render until filters are initialized
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Properties</h1>
              <p className="text-gray-600 mt-1">Find your perfect property in Ghana</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Location Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter location..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className={selectedPropertyType === 'All Types' ? 'text-gray-500' : 'text-gray-900'}>
                      {selectedPropertyType}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {showPropertyTypeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {propertyTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => handlePropertyTypeSelect(type)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className={selectedPriceRange === 'Any Price' ? 'text-gray-500' : 'text-gray-900'}>
                      {selectedPriceRange}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {showPriceDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {priceRanges.map((range) => (
                        <button
                          key={range}
                          onClick={() => handlePriceRangeSelect(range)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className="text-gray-900">{selectedSort}</span>
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {showSortDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSortSelect(option)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearchClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Properties
              </Button>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, properties.length)} of {properties.length} properties
                </p>
                {activeFilterCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Properties Grid/List */}
            {currentProperties.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {currentProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode={viewMode}
                    showCurrency={currency}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <House className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or clearing some filters.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search page...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}


