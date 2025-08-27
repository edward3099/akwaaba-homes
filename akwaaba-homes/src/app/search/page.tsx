'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/property/PropertyCard';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { Pagination } from '@/components/search/Pagination';
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
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    features: ['Modern Kitchen', 'Balcony', 'Security', 'Parking'],
    amenities: ['24/7 Security', 'Backup Generator', 'Swimming Pool'],
    seller: {
      id: 'seller2',
      name: 'Accra Prime Properties',
      type: 'agent',
      phone: '+233244789012',
      whatsapp: '+233244789012',
      isVerified: true,
      company: 'Accra Prime Properties Ltd',
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
      verificationDate: '2024-01-10',
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10',
    expiresAt: '2024-02-05',
    tier: 'premium',
  },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  
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
  const [filters, setFilters] = useState<SearchFilters>({});
  
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

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
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
  };

  const handlePriceRangeSelect = (range: string) => {
    setSelectedPriceRange(range);
    setShowPriceDropdown(false);
  };

  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort);
    setShowSortDropdown(false);
  };

  const handleSearchClick = () => {
    const newFilters: SearchFilters = {};
    if (locationInput.trim()) newFilters.location = locationInput.trim();
    if (selectedPropertyType !== 'All Types') newFilters.type = [selectedPropertyType.toLowerCase() as Property['type']];
    if (selectedPriceRange !== 'Any Price') {
      // Parse price range and add to filters
      console.log('Price range selected:', selectedPriceRange);
    }
    handleSearch(newFilters);
  };

  const handleContact = (property: Property) => {
    console.log('Contact for property:', property.title);
    // In a real app, you would navigate to a contact page or open a chat
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Search Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-3 py-4">
          {/* Mobile Horizontal Search Menu */}
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-border/50 relative">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Location Input */}
              <div className="flex-shrink-0 w-48">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Location"
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="flex-shrink-0" data-dropdown="property-type">
                <Button 
                  variant="outline" 
                  className="h-10 px-4 gap-2 bg-white hover:bg-accent/50 border-input"
                  onClick={() => {
                    setShowPropertyTypeDropdown(!showPropertyTypeDropdown);
                    setShowPriceDropdown(false);
                    setShowSortDropdown(false);
                  }}
                >
                  <House className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedPropertyType}</span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showPropertyTypeDropdown ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {/* Price Range Dropdown */}
              <div className="flex-shrink-0" data-dropdown="price">
                <Button 
                  variant="outline" 
                  className="h-10 px-4 gap-2 bg-white hover:bg-accent/50 border-input"
                  onClick={() => {
                    setShowPriceDropdown(!showPriceDropdown);
                    setShowPropertyTypeDropdown(false);
                    setShowSortDropdown(false);
                  }}
                >
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedPriceRange}</span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} />
                </Button>
              </div>



              {/* Search Button */}
              <div className="flex-shrink-0">
                <Button 
                  className="h-10 px-6 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg"
                  onClick={handleSearchClick}
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Search</span>
                </Button>
              </div>
            </div>

            {/* Dropdowns positioned outside scrollable container */}
            {showPropertyTypeDropdown && (
              <div className="absolute top-full left-4 mt-1 w-48 bg-white border-2 border-primary rounded-lg shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                <div className="p-2 bg-blue-50 border-b border-primary">
                  <span className="text-xs font-medium text-primary">Select Property Type</span>
                </div>
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-border/50 last:border-b-0"
                    onClick={() => handlePropertyTypeSelect(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
            
            {showPriceDropdown && (
              <div className="absolute top-full left-32 mt-1 w-48 bg-white border-2 border-primary rounded-lg shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                <div className="p-2 bg-blue-50 border-b border-primary">
                  <span className="text-xs font-medium text-primary">Select Price Range</span>
                </div>
                {priceRanges.map((range) => (
                  <button
                    key={range}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-border/50 last:border-b-0"
                    onClick={() => handlePriceRangeSelect(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
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
            {/* Mobile Results Header */}
            <div className="mb-4">
              {/* Title and Count */}
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-bold text-foreground">
                  {filters.location ? `Properties in ${filters.location}` : 'All Properties'}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {properties.length} found
                    </Badge>
              </div>

              {/* Horizontal Controls Menu */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {/* Filters Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-shrink-0 h-9 px-3 gap-2 bg-white hover:bg-accent/50 border-input"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="default" className="ml-1 h-5 w-5 p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {/* Sort Dropdown */}
                <div className="flex-shrink-0 relative">
                  <Button 
                    variant="outline" 
                    className="h-9 px-3 gap-2 bg-white hover:bg-accent/50 border-input"
                    onClick={() => {
                      setShowSortDropdown(!showSortDropdown);
                      setShowPropertyTypeDropdown(false);
                      setShowPriceDropdown(false);
                    }}
                  >
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedSort}</span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showSortDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-input rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-border/50 last:border-b-0"
                          onClick={() => handleSortSelect(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-9 px-3 rounded-none bg-white hover:bg-accent/50"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-9 px-3 rounded-none bg-white hover:bg-accent/50"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
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
              <div className="lg:hidden mb-4 sm:mb-6 bg-white rounded-2xl shadow-lg border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 w-4" />
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
            <div className={`grid gap-2 sm:gap-3 md:gap-6 mb-6 sm:mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {currentProperties.map((property, index) => (
                <div 
                  key={property.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PropertyCard 
                    key={property.id}
                    property={property} 
                    viewMode={viewMode}
                    showCurrency={currency}
                    onContact={handleContact}
                    className="h-full"
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


