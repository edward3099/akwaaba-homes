'use client';

import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchState } from '@/hooks/useSearchState';
import { DatabaseProperty, DatabasePropertyImage } from '@/lib/types/database';

// Extended interface for API response that includes property_images
interface PropertyWithImages extends DatabaseProperty {
  property_images?: DatabasePropertyImage[];
  image_urls?: string[]; // Add image_urls field
}

  // Transform database property to frontend property format
const transformDatabaseProperty = (dbProperty: PropertyWithImages) => {
  // Get valid images from image_urls field (primary) or property_images (fallback)
  const validImages = (dbProperty.image_urls || [])
    .filter((url): url is string => 
      Boolean(url) && 
      typeof url === 'string' && 
      url.trim() !== '' && 
      (url.startsWith('http') || url.startsWith('/'))
    ) || 
    (dbProperty.property_images
      ?.map((img: DatabasePropertyImage) => img.image_url)
      .filter((url): url is string => 
        Boolean(url) && 
        typeof url === 'string' && 
        url.trim() !== '' && 
        (url.startsWith('http') || url.startsWith('/'))
      ) || []);
  
  // Use placeholder if no valid images
  const transformedImages = validImages.length > 0 ? validImages : ['/placeholder-property.svg'];

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description || '',
    price: dbProperty.price,
    currency: dbProperty.currency,
    status: dbProperty.listing_type === 'sale' ? 'for-sale' : 
            dbProperty.listing_type === 'rent' ? 'for-rent' : 
            dbProperty.listing_type === 'lease' ? 'short-let' : 'for-rent',
    type: dbProperty.property_type,
    location: {
      address: dbProperty.address,
      city: dbProperty.city,
      region: dbProperty.region,
      country: 'Ghana' as const,
      coordinates: {
        lat: dbProperty.latitude || 0,
        lng: dbProperty.longitude || 0,
      },
    },
    specifications: {
      bedrooms: dbProperty.bedrooms,
      bathrooms: dbProperty.bathrooms,
      size: dbProperty.square_feet || 0,
      sizeUnit: 'sqft' as const,
      lotSize: dbProperty.land_size,
      lotSizeUnit: 'sqft' as const,
      yearBuilt: dbProperty.year_built,
      parkingSpaces: undefined,
    },
    images: transformedImages,
    features: dbProperty.features,
    amenities: dbProperty.amenities,
    seller: {
      id: dbProperty.seller_id,
      name: 'Property Seller', // Will be populated from user service
      type: 'agent' as const,
      phone: '',
      isVerified: true,
    },
    verification: {
      isVerified: true,
      documentsUploaded: true,
      verificationDate: dbProperty.created_at,
    },
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    tier: dbProperty.is_featured ? 'premium' : 'normal',
  };
};



export function FeaturedProperties() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use the new search state hook
  const {
    filters,
    isInitialized,
    updateFilters,
    updateFilter
  } = useSearchState();
  
  // Local state for properties and pagination
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Initialize local state from the search state hook
  // Use URL as single source of truth - derive state from filters.status
  const selectedPropertyType = filters.status || 'for-sale';
  const [selectedType, setSelectedType] = useState<string>('0');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('0');
  const [selectedMinPrice, setSelectedMinPrice] = useState<string>('0');
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<string>('0');
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRegion, setSearchRegion] = useState<string>('');
  const propertiesPerPage = 6; // Show 6 properties per page
  
  // Additional state for expanded search options
  const [addedToSite, setAddedToSite] = useState<string>('0'); // 0 = Anytime, 1 = Last 24h, 2 = Last 3d, etc.
  const [expandedKeywords, setExpandedKeywords] = useState<string>('');
  
  // Sync local state with search state hook when it's initialized
  useEffect(() => {
    if (isInitialized && filters) {
      // Map search state filters to local state
      if (filters.type) {
        // Map property type to tid format
        const typeToTidMap: { [key: string]: string } = {
          'apartment': '1',
          'house': '2',
          'office': '3',
          'land': '5'
        };
        // Handle both single type and array of types
        const propertyType = Array.isArray(filters.type) ? filters.type[0] : filters.type;
        setSelectedType(typeToTidMap[propertyType] || '0');
      }
      if ((filters as any).bedrooms) {
        setSelectedBedrooms((filters as any).bedrooms.toString());
      }
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          setSelectedMinPrice(filters.priceRange.min.toString());
        }
        if (filters.priceRange.max) {
          setSelectedMaxPrice(filters.priceRange.max.toString());
        }
      }
      if (filters.location) {
        setSearchRegion(filters.location);
        
      }
      if ((filters as any).keywords) {
        setSearchKeywords((filters as any).keywords);
        
      }
      if ((filters as any).addedToSite) {
        setAddedToSite((filters as any).addedToSite);
      }
      

    }
  }, [isInitialized, filters.status]);

  // Handlers for form inputs
  const handlePropertyTypeChange = (value: string) => {
    setCurrentPage(1); // Reset to first page when changing property type
    // Update search state - this is the key fix for preventing mixed results
    updateFilter('status', value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
    // Map tid to property type and update search state
    const tidToTypeMap: { [key: string]: string } = {
      '1': 'apartment',
      '2': 'house',
      '3': 'office',
      '5': 'land'
    };
    updateFilter('type', tidToTypeMap[value] || value);
  };

  const handleBedroomsChange = (value: string) => {
    setSelectedBedrooms(value);
    setCurrentPage(1);
    updateFilter('bedrooms', parseInt(value));
  };

  const handleMinPriceChange = (value: string) => {
    setSelectedMinPrice(value);
    setCurrentPage(1);
    const currentPriceRange = filters.priceRange || {};
    updateFilter('priceRange', { ...currentPriceRange, min: parseInt(value), currency: 'GHS' });
  };

  const handleMaxPriceChange = (value: string) => {
    setSelectedMaxPrice(value);
    setCurrentPage(1);
    const currentPriceRange = filters.priceRange || {};
    updateFilter('priceRange', { ...currentPriceRange, max: parseInt(value), currency: 'GHS' });
  };

  const handleSearchKeywordsChange = (value: string) => {
    setSearchKeywords(value);
    // Don't reset page immediately - let debouncing handle it
  };

  const handleExpandedKeywordsChange = (value: string) => {
    setExpandedKeywords(value);
    // Don't reset page immediately - let debouncing handle it
  };

  const handleSearchRegionChange = (value: string) => {
    setSearchRegion(value);
    // Don't reset page immediately - let debouncing handle it
  };

  const handleAddedToSiteChange = (value: string) => {
    setAddedToSite(value);
    // Don't reset page immediately - let debouncing handle it
  };
  
  

  // Update search state when addedToSite changes
  useEffect(() => {
    // Only update if the value has actually changed to prevent infinite loops
    if (addedToSite !== '0') {
      updateFilter('addedToSite', addedToSite);
    }
  }, [addedToSite, updateFilter]);

    // Always fetch on initial load, or when filters change
  useEffect(() => {
    if (isInitialized) {
      
      let ignore = false;
      const fetchData = async () => {
        try {
          // Build filter parameters using the search state hook filters
          const apiFilters: any = {
            page: currentPage,
            limit: propertiesPerPage,
            status: 'active',
          };

          // Apply property type filter from search state, or use default 'sale' if none set
          if (filters.status) {
            // Map frontend status values to database listing_type values
            const statusToListingTypeMap: { [key: string]: string } = {
              'for-sale': 'sale',
              'for-rent': 'rent', 
              'short-let': 'lease',  // Map short-let to database enum value
              'lease': 'lease'       // Also support the new lease value directly
            };
            
            const listingType = statusToListingTypeMap[filters.status];
            if (listingType) {
              apiFilters.listing_type = listingType;
            }
          } else {
            // Default to 'sale' if no status filter is set
            apiFilters.listing_type = 'sale';
          }

          // Apply property type filter (tid)
          if (filters.type) {
            const typeToTidMap: { [key: string]: string } = {
              'apartment': '1',
              'house': '2',
              'office': '3',
              'land': '5'
            };
            const propertyType = Array.isArray(filters.type) ? filters.type[0] : filters.type;
            const tid = typeToTidMap[propertyType];
            if (tid) {
              apiFilters.tid = tid;
            }
          }

          // Apply bedrooms filter
          if ((filters as any).bedrooms) {
            apiFilters.bedrooms = (filters as any).bedrooms;
          }

          // Apply price range filters
          if (filters.priceRange) {
            if (filters.priceRange.min && filters.priceRange.min > 0) {
              apiFilters.minprice = filters.priceRange.min;
            }
            if (filters.priceRange.max && filters.priceRange.max > 0) {
              apiFilters.maxprice = filters.priceRange.max;
            }
          }

          // Apply location filter
          if (filters.location) {
            apiFilters.region = filters.location;
          }

          // Apply keywords filter
          if ((filters as any).keywords) {
            apiFilters.keywords = (filters as any).keywords;
          }

          // Apply added to site filter
          if ((filters as any).addedToSite) {
            apiFilters.addedToSite = (filters as any).addedToSite;
          }

          // Debug: Log API filters before making the call
          
          
          // Make the API call
          const response = await fetch('/api/properties?' + new URLSearchParams(apiFilters));
          
          if (ignore) return;

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (ignore) return;

          setProperties(data.properties || []);
          // Fix: Extract total from pagination object, not directly from data
          setTotalProperties(data.pagination?.total || data.total || 0);
          // Fix: Use totalPages from pagination object if available, otherwise calculate
          const calculatedPages = data.pagination?.totalPages || 
            (data.pagination?.total > 0 ? Math.ceil(data.pagination.total / propertiesPerPage) : 0) ||
            (data.total > 0 ? Math.ceil(data.total / propertiesPerPage) : 0) || 0;
          setTotalPages(calculatedPages);
          
          // Validate current page after receiving API response
          if (calculatedPages > 0 && currentPage > calculatedPages) {
            // Current page is invalid, redirect to page 1
            setCurrentPage(1);
            // Update URL to page 1
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set('page', '1');
            router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch properties:', error);
          if (!ignore) {
            setLoading(false);
            setProperties([]);
            setTotalProperties(0);
            setTotalPages(0);
          }
        }
      };

      setLoading(true);
      fetchData();

      return () => {
        ignore = true;
      };
    }
  }, [isInitialized, filters, currentPage]);

  // Transform database properties to frontend format with better safety
  const transformedProperties = useMemo(() => {
    if (!properties || !Array.isArray(properties)) {
      return [];
    }
    return properties.map(transformDatabaseProperty);
  }, [properties]);

  // Since we're filtering on the API side, we don't need frontend filtering
  // The properties returned are already filtered by the selected type
  const currentPageProperties = transformedProperties;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update URL to reflect the page change
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', page.toString());
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      // Update URL to reflect the page change
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      // Update URL to reflect the page change
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL parameters with new search criteria using the correct parameter names for search state
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('status', selectedPropertyType); // Use 'status' instead of 'cid'
    newSearchParams.set('type', selectedType === '0' ? 'all' : selectedType); // Use 'type' instead of 'tid'
    newSearchParams.set('bedrooms', selectedBedrooms);
    newSearchParams.set('minprice', selectedMinPrice);
    newSearchParams.set('maxprice', selectedMaxPrice);
    newSearchParams.set('keywords', searchKeywords);
    if (searchRegion) {
      newSearchParams.set('q', searchRegion); // Use 'q' instead of 'region' for location
    } else {
      newSearchParams.delete('q');
    }
    newSearchParams.set('page', '1'); // Reset to first page on new search
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  // Watch for URL parameter changes and update local state
  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'for-sale';
    const urlType = searchParams.get('type') || '0';
    const urlBedrooms = searchParams.get('bedrooms') || '0';
    const urlMinPrice = searchParams.get('minprice') || '0';
    const urlMaxPrice = searchParams.get('maxprice') || '0';
    const urlKeywords = searchParams.get('keywords') || '';
    const urlLocation = searchParams.get('q') || '';
    const urlPage = searchParams.get('page') || '1';

    // Only update state if URL parameters have actually changed
    // This prevents unnecessary re-renders and state resets
    // Note: selectedPropertyType is derived from filters.status, not a state variable
    if (urlType !== selectedType) setSelectedType(urlType);
    if (urlBedrooms !== selectedBedrooms) setSelectedBedrooms(urlBedrooms);
    if (urlMinPrice !== selectedMinPrice) setSelectedMinPrice(urlMinPrice);
    if (urlMaxPrice !== selectedMaxPrice) setSelectedMaxPrice(urlMaxPrice);
    if (urlKeywords !== searchKeywords) setSearchKeywords(urlKeywords);
    if (urlLocation !== searchRegion) setSearchRegion(urlLocation);
    
    
    // Note: We don't need to manually update filters here as the search state hook 
    // handles URL parameter parsing automatically
    
    // Validate page number and ensure it's within valid range
    const requestedPage = parseInt(urlPage);
    if (requestedPage !== currentPage) {
      // If totalPages is known and requested page is invalid, redirect to page 1
      if (totalPages > 0 && requestedPage > totalPages) {
        // Update URL to page 1
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('page', '1');
        router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
        setCurrentPage(1);
      } else {
        setCurrentPage(requestedPage);
      }
    }
  }, [searchParams, totalPages, currentPage, router]);

  // Show loading state
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-muted/30">
      <div className="container mx-auto px-3">

        {/* Full Search Form with Background Image */}
        <div className="mb-6">
          <div 
            className="relative rounded-lg shadow-lg p-3 sm:p-4 border border-border/50 overflow-hidden"
            style={{
              backgroundImage: 'url(/placeholder-house-1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Semi-transparent overlay for better text readability */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
            
            {/* Content with relative positioning to appear above overlay */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Find your new property</h2>
              </div>

            {/* Search Form */}
            <form className="space-y-4" onSubmit={handleFormSubmit}>
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

              {/* Search Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                <div className="flex-1 max-w-xs">
                  <label htmlFor="searchRegion" className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Location
                  </label>
                  <input
                    type="text"
                    id="searchRegion"
                    name="region"
                    placeholder="e.g., Accra, Kumasi, East Legon, Cantonments"
                    value={searchRegion}
                    onChange={(e) => handleSearchRegionChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Panel */}
              <div className="filter-panel">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                    <select 
                      name="tid" 
                      id="tid" 
                      value={selectedType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="0">All Types</option>
                      <option value="1">Apartment</option>
                      <option value="2">House</option>
                      <option value="3">Office</option>
                      <option value="5">Land</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-foreground mb-1">Bedrooms</label>
                    <select 
                      name="bedrooms" 
                      id="bedrooms" 
                      value={selectedBedrooms}
                      onChange={(e) => handleBedroomsChange(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
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
                    <select 
                      name="minprice" 
                      id="minprice" 
                      value={selectedMinPrice}
                      onChange={(e) => handleMinPriceChange(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
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
                    <select 
                      name="maxprice" 
                      id="maxprice" 
                      value={selectedMaxPrice}
                      onChange={(e) => handleMaxPriceChange(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
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
                        <label className="block text-sm font-medium text-foreground mb-1">Added to site</label>
                        <select 
                          name="added" 
                          id="added" 
                          value={addedToSite}
                          onChange={(e) => handleAddedToSiteChange(e.target.value)}
                          className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
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
                          value={expandedKeywords}
                          onChange={(e) => handleExpandedKeywordsChange(e.target.value)}
                          className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                          placeholder="e.g. 'pool' or 'jacuzzi'" 
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
        </div>

        {/* Properties Display */}
        {currentPageProperties && currentPageProperties.length > 0 ? (
          <div className="grid gap-2 sm:gap-3 mb-12 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {currentPageProperties.map((property: any, index: number) => (
              <div 
                key={property.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PropertyCard 
                  property={property} 
                  viewMode="grid"
                  onContact={(property) => {
                    // Handle contact for property - this will open the contact form
                    // The PropertyCard component handles the actual contact logic
                    console.log('Contact initiated for property:', property.title);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties available</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && currentPageProperties && currentPageProperties.length > 0 && totalPages > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="px-3 py-2"
                disabled={currentPage === 1 || loading}
                onClick={handlePreviousPage}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "outline"}
                    className="px-3 py-2 min-w-[40px]"
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="px-3 py-2"
                disabled={currentPage === totalPages || loading}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} • Showing {currentPage * propertiesPerPage - propertiesPerPage + 1}-{Math.min(currentPage * propertiesPerPage, totalProperties)} of {totalProperties} verified properties
            </p>
          </div>
        )}




      </div>
    </section>
  );
}
