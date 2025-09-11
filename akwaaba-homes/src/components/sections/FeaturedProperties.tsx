'use client';

import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { ViewToggle } from '@/components/search/ViewToggle';
import { MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchState } from '@/hooks/useSearchState';
import { DatabaseProperty, DatabasePropertyImage } from '@/lib/types/database';

// Ghana images for slideshow
const ghanaImages = [
  '/Landmarks-in-Ghana-Black-Star-Square.jpg',
  '/Landmarks-in-Ghana-Larabanga-Mosque.jpg',
  '/Statue_of_Nii_Tackie_Tawiah_III_located_in_Accra_Ghana_market.jpg',
  '/71089263-2023-apr-11-11-41-12-000000-accra-gfaa0de8b5_1920.jpg',
  '/view-from-kejetia-market-kumasi-1.jpg',
  '/gh_eka_mensah_g.jpg',
  '/the-nkyinkyim-museum.jpg',
  '/ashanti-empire-human-sacrifice-featured.png'
];

// Extended interface for API response that includes property_images and seller info
interface PropertyWithImages extends DatabaseProperty {
  property_images?: DatabasePropertyImage[];
  image_urls?: string[]; // Add image_urls field
  users?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
    user_type: string;
    is_verified: boolean;
  };
}

  // Transform database property to frontend property format
const transformDatabaseProperty = (dbProperty: PropertyWithImages) => {
  // Get valid images from property_images field (primary) or image_urls (fallback)
  const validImages = (dbProperty.property_images
    ?.map((img: DatabasePropertyImage) => img.image_url)
    .filter((url): url is string => 
      Boolean(url) && 
      typeof url === 'string' && 
      url.trim() !== '' && 
      (url.startsWith('http') || url.startsWith('/'))
    ) || []) || 
    (dbProperty.image_urls || [])
      .filter((url): url is string => 
        Boolean(url) && 
        typeof url === 'string' && 
        url.trim() !== '' && 
        (url.startsWith('http') || url.startsWith('/'))
      );
  
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
      name: (dbProperty as any).users?.full_name || 'Property Seller',
      type: (dbProperty as any).users?.user_type === 'agent' ? 'agent' : 'individual',
      phone: (dbProperty as any).users?.phone || '',
      email: (dbProperty as any).users?.email,
      isVerified: (dbProperty as any).users?.is_verified || false,
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
  
  // Slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRegion, setSearchRegion] = useState<string>('');
  const propertiesPerPage = 6; // Show 6 properties per page
  
  // Additional state for expanded search options
  const [addedToSite, setAddedToSite] = useState<string>('0'); // 0 = Anytime, 1 = Last 24h, 2 = Last 3d, etc.
  const [expandedKeywords, setExpandedKeywords] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Sync local state with search state hook when it's initialized
  useEffect(() => {
    if (isInitialized && filters) {
      console.log('🔍 DEBUG FeaturedProperties: Syncing selectedType with filters.type:', filters.type);
      // Use functional state updates to avoid setState during render
      setSelectedType(prev => {
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
          const newType = typeToTidMap[propertyType] || '0';
          console.log('🔍 DEBUG FeaturedProperties: Setting selectedType from', prev, 'to', newType);
          return newType !== prev ? newType : prev;
        } else {
          // No property type filter means "All Types" should be selected
          console.log('🔍 DEBUG FeaturedProperties: No filters.type, setting selectedType to 0');
          return prev !== '0' ? '0' : prev;
        }
      });
      
      setSelectedBedrooms(prev => {
        const newBedrooms = (filters as any).bedrooms ? (filters as any).bedrooms.toString() : '0';
        return newBedrooms !== prev ? newBedrooms : prev;
      });
      
      setSelectedMinPrice(prev => {
        const newMinPrice = filters.priceRange?.min ? filters.priceRange.min.toString() : '0';
        return newMinPrice !== prev ? newMinPrice : prev;
      });
      
      setSelectedMaxPrice(prev => {
        const newMaxPrice = filters.priceRange?.max ? filters.priceRange.max.toString() : '0';
        return newMaxPrice !== prev ? newMaxPrice : prev;
      });
      
      setSearchRegion(prev => {
        const newRegion = filters.location || '';
        return newRegion !== prev ? newRegion : prev;
      });
      
      setSearchKeywords(prev => {
        const newKeywords = (filters as any).keywords || '';
        return newKeywords !== prev ? newKeywords : prev;
      });
      
      setAddedToSite(prev => {
        const newAddedToSite = (filters as any).addedToSite || '0';
        return newAddedToSite !== prev ? newAddedToSite : prev;
      });
    }
  }, [isInitialized, filters.type, filters.bedrooms, filters.priceRange, filters.location, filters.keywords, filters.addedToSite]);

  // Slideshow effect - change image every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % ghanaImages.length
      );
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

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
    
    if (value === '0') {
      // "All Types" selected - clear the type filter
      updateFilter('type', undefined);
    } else {
      // Specific type selected - set the filter
      updateFilter('type', tidToTypeMap[value] || value);
    }
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
            let propertyType: string;
            
            // Handle both array and string formats
            if (Array.isArray(filters.type) && filters.type.length > 0) {
              propertyType = filters.type[0];
            } else if (typeof filters.type === 'string') {
              propertyType = filters.type;
            } else {
              propertyType = '';
            }
            
            console.log('🔍 DEBUG FeaturedProperties: propertyType:', propertyType);
            
            if (propertyType) {
              // Check if it's already a tid (numeric string) or a property type name
              if (/^\d+$/.test(propertyType)) {
                // It's already a tid, use it directly
                apiFilters.tid = propertyType;
                console.log('🔍 DEBUG FeaturedProperties: Using tid directly:', propertyType);
              } else {
                // Convert property type name to tid value
                const typeToTidMap: { [key: string]: string } = {
                  'apartment': '1',
                  'house': '2',
                  'office': '3',
                  'land': '5'
                };
                const tid = typeToTidMap[propertyType];
                if (tid) {
                  apiFilters.tid = tid;
                  console.log('🔍 DEBUG FeaturedProperties: Mapped propertyType to tid:', propertyType, '->', tid);
                }
              }
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
          console.log('🔍 DEBUG FeaturedProperties: API filters:', apiFilters);
          console.log('🔍 DEBUG FeaturedProperties: filters.type:', filters.type);
          
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
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              setCurrentPage(1);
              // Update URL to page 1
              const newSearchParams = new URLSearchParams(window.location.search);
              newSearchParams.set('page', '1');
              router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
            }, 0);
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
  }, [isInitialized, filters.status, filters.type, filters.bedrooms, filters.priceRange, filters.location, currentPage]);

  // Use properties directly from API (already transformed)
  const currentPageProperties = properties || [];

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

    // Map URL type parameter to internal numeric format
    const typeToTidMap: { [key: string]: string } = {
      'apartment': '1',
      'house': '2',
      'office': '3',
      'land': '5'
    };
    
    // Convert URL type to internal format, fallback to urlType if it's already numeric
    const mappedType = typeToTidMap[urlType] || urlType;

    // Use functional state updates to avoid circular dependencies
    setSelectedType(prev => mappedType !== prev ? mappedType : prev);
    setSelectedBedrooms(prev => urlBedrooms !== prev ? urlBedrooms : prev);
    setSelectedMinPrice(prev => urlMinPrice !== prev ? urlMinPrice : prev);
    setSelectedMaxPrice(prev => urlMaxPrice !== prev ? urlMaxPrice : prev);
    setSearchKeywords(prev => urlKeywords !== prev ? urlKeywords : prev);
    setSearchRegion(prev => urlLocation !== prev ? urlLocation : prev);
    
    // Handle page validation separately to avoid circular dependency
    const requestedPage = parseInt(urlPage);
    setCurrentPage(prev => {
      if (requestedPage !== prev) {
        // If totalPages is known and requested page is invalid, redirect to page 1
        if (totalPages > 0 && requestedPage > totalPages) {
          // Update URL to page 1
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set('page', '1');
          router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
          return 1;
        } else {
          return requestedPage;
        }
      }
      return prev;
    });
    
    // Note: We don't need to manually update filters here as the search state hook 
    // handles URL parameter parsing automatically
  }, [searchParams, totalPages, router]); // Removed state variables from dependencies

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

        {/* Search Form Card Section */}
        <div className="mb-6">
          {/* Larger Card Container */}
          <div className="max-w-6xl mx-auto">
            <div 
              className="relative rounded-xl shadow-2xl p-8 sm:p-12 lg:p-16 overflow-hidden"
              style={{
                backgroundImage: `url(${ghanaImages[currentImageIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Light overlay for better readability */}
              <div className="absolute inset-0 bg-white/20"></div>
              
              {/* Content with relative positioning to appear above overlay */}
              <div className="relative z-10">
              {/* Search Form with Background Image */}
              <div className="relative rounded-lg shadow-lg p-2 sm:p-3 overflow-hidden max-w-2xl mx-auto"
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1"></div>
                <h2 className="text-xs sm:text-sm md:text-base font-bold text-foreground text-center flex-1">Find your new property</h2>
                <div className="flex-1 flex justify-end">
                  <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              </div>

            {/* Search Form */}
            <form className="space-y-2" onSubmit={handleFormSubmit}>
              {/* Property Type Tabs */}
              <div className="form-group">
                <ul className="flex justify-center space-x-0.5" id="">
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
                      className={`block w-full px-2 py-1 text-center text-xs font-medium rounded-lg border-2 cursor-pointer transition-all duration-200 ${
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
                      className={`block w-full px-2 py-1 text-center text-xs font-medium rounded-lg border-2 cursor-pointer transition-all duration-200 ${
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
                      className={`block w-full px-2 py-1 text-center text-xs font-medium rounded-lg border-2 cursor-pointer transition-all duration-200 ${
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
              <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center">
                <div className="flex-1 max-w-xs">
                  <label htmlFor="searchRegion" className="block text-xs font-medium text-gray-700 mb-1">
                    Search by Location
                  </label>
                  <input
                    type="text"
                    id="searchRegion"
                    name="region"
                    placeholder="e.g., Accra, Kumasi, East Legon, Cantonments"
                    value={searchRegion}
                    onChange={(e) => handleSearchRegionChange(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Panel */}
              <div className="filter-panel">
                {/* Mobile Layout: Type buttons, then Bedrooms under, then prices */}
                <div className="block sm:hidden space-y-2">
                  {/* Type Row */}
                  <div className="form-group">
                    <label className="block text-xs font-medium text-foreground mb-1">Type</label>
                    <div className="flex gap-1 overflow-x-auto">
                      <button
                        onClick={() => handleTypeChange('0')}
                        className={`px-1.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${
                          selectedType === '0'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleTypeChange('1')}
                        className={`px-1.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${
                          selectedType === '1'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        Apt
                      </button>
                      <button
                        onClick={() => handleTypeChange('2')}
                        className={`px-1.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${
                          selectedType === '2'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        House
                      </button>
                      <button
                        onClick={() => handleTypeChange('3')}
                        className={`px-1.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${
                          selectedType === '3'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        Office
                      </button>
                      <button
                        onClick={() => handleTypeChange('5')}
                        className={`px-1.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap flex-shrink-0 ${
                          selectedType === '5'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        Land
                      </button>
                    </div>
                  </div>
                  
                  {/* Bedrooms Row - positioned under the type buttons */}
                  <div className="form-group">
                    <label className="block text-xs font-medium text-foreground mb-0.5">Bedrooms</label>
                    <select 
                      name="bedrooms" 
                      id="bedrooms" 
                      value={selectedBedrooms}
                      onChange={(e) => handleBedroomsChange(e.target.value)}
                      className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                  {/* Price Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-group">
                      <label className="block text-xs font-medium text-foreground mb-0.5">Min price</label>
                      <select 
                        name="minprice" 
                        id="minprice" 
                        value={selectedMinPrice}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                      <label className="block text-xs font-medium text-foreground mb-0.5">Max price</label>
                      <select 
                        name="maxprice" 
                        id="maxprice" 
                        value={selectedMaxPrice}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

                {/* Desktop Layout: Original 4-column grid */}
                <div className="hidden sm:grid grid-cols-4 gap-2">
                  <div className="form-group">
                    <label className="block text-xs font-medium text-foreground mb-1">Type</label>
                    <div className="flex flex-wrap gap-1">
                      {console.log('🔍 DEBUG FeaturedProperties: Rendering buttons with selectedType:', selectedType)}
                      <button
                        onClick={() => handleTypeChange('0')}
                        className={`px-2 py-1 text-xs rounded-md border transition-all ${
                          selectedType === '0'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        All Types
                      </button>
                      <button
                        onClick={() => handleTypeChange('1')}
                        className={`px-2 py-1 text-xs rounded-md border transition-all ${
                          selectedType === '1'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        Apartment
                      </button>
                      <button
                        onClick={() => handleTypeChange('2')}
                        className={`px-2 py-1 text-xs rounded-md border transition-all ${
                          selectedType === '2'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        House
                      </button>
                      <button
                        onClick={() => handleTypeChange('3')}
                        className={`px-2 py-1 text-xs rounded-md border transition-all ${
                          selectedType === '3'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        Office
                      </button>
                      <button
                        onClick={() => handleTypeChange('5')}
                        className={`px-2 py-1 text-xs rounded-md border transition-all ${
                          selectedType === '5'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-muted'
                        }`}
                      >
                        Land
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-medium text-foreground mb-0.5">Bedrooms</label>
                    <select 
                      name="bedrooms" 
                      id="bedrooms" 
                      value={selectedBedrooms}
                      onChange={(e) => handleBedroomsChange(e.target.value)}
                      className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                    <label className="block text-xs font-medium text-foreground mb-0.5">Min price</label>
                    <select 
                      name="minprice" 
                      id="minprice" 
                      value={selectedMinPrice}
                      onChange={(e) => handleMinPriceChange(e.target.value)}
                      className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                    <label className="block text-xs font-medium text-foreground mb-0.5">Max price</label>
                    <select 
                      name="maxprice" 
                      id="maxprice" 
                      value={selectedMaxPrice}
                      onChange={(e) => handleMaxPriceChange(e.target.value)}
                      className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                          className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium"
                        >
                          Search
            </Button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Search Content */}
                  <div id="advanced-search" className="hidden p-2 bg-muted/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="form-group">
                        <label className="block text-xs font-medium text-foreground mb-0.5">Added to site</label>
                        <select 
                          name="added" 
                          id="added" 
                          value={addedToSite}
                          onChange={(e) => handleAddedToSiteChange(e.target.value)}
                          className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                        <label className="block text-xs font-medium text-foreground mb-0.5">Keywords</label>
                        <input 
                          name="keywords" 
                          id="keywords" 
                          value={expandedKeywords}
                          onChange={(e) => handleExpandedKeywordsChange(e.target.value)}
                          className="w-full h-7 px-2 text-xs rounded-lg border border-input bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
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
            </div>
          </div>
        </div>

        {/* Properties Display */}
        {currentPageProperties && currentPageProperties.length > 0 ? (
          <div className={`gap-2 sm:gap-3 mb-12 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3' 
              : 'space-y-4'
          }`}>
            {currentPageProperties.map((property: any, index: number) => (
              <div 
                key={property.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PropertyCard 
                  property={property} 
                  viewMode={viewMode}
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
