'use client';

import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useProperties } from '@/lib/hooks/useApi';
import { DatabaseProperty, DatabasePropertyImage } from '@/lib/types/database';

// Extended interface for API response that includes property_images
interface PropertyWithImages extends DatabaseProperty {
  property_images?: DatabasePropertyImage[];
}

  // Transform database property to frontend property format
const transformDatabaseProperty = (dbProperty: PropertyWithImages) => {
  // Get valid images and filter out any invalid URLs
  const validImages = dbProperty.property_images
    ?.map((img: DatabasePropertyImage) => img.image_url)
    .filter((url): url is string => 
      Boolean(url) && 
      typeof url === 'string' && 
      url.trim() !== '' && 
      (url.startsWith('http') || url.startsWith('/'))
    ) || [];
  
  // Use placeholder if no valid images
  const transformedImages = validImages.length > 0 ? validImages : ['/placeholder-property.svg'];

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description || '',
    price: dbProperty.price,
    currency: dbProperty.currency,
    status: dbProperty.listing_type === 'sale' ? 'for-sale' : 'for-rent',
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
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('for-sale');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6; // Show 6 properties per page
  
    const {
    loading,
    error,
    data,
    getFeaturedProperties,
    clearError
  } = useProperties();

  // Extract properties from the data structure
  const properties = data?.properties || null;

  // Debug logging
  console.log('FeaturedProperties Debug:', {
    loading,
    error,
    data,
    properties,
    propertiesType: typeof properties,
    isArray: Array.isArray(properties),
    length: properties?.length
  });

  useEffect(() => {
    // Load featured properties on component mount
    console.log('FeaturedProperties: Calling getFeaturedProperties(6)');
    
    let ignore = false;
    const fetchData = async () => {
      try {
        const result = await getFeaturedProperties(6);
        if (!ignore) {
          console.log('FeaturedProperties: Data fetched successfully', result);
        }
      } catch (error) {
        if (!ignore) {
          console.error('FeaturedProperties: Error fetching data', error);
        }
      }
    };
    
    fetchData();
    
    return () => {
      ignore = true; // Cleanup to prevent race conditions
    };
  }, []); // Empty dependency array - run only once on mount

  // Debug logging for useEffect
  console.log('FeaturedProperties: useEffect triggered');

  // Debug logging
  useEffect(() => {
    console.log('FeaturedProperties Debug:', {
      loading,
      error,
      data,
      properties,
      propertiesType: typeof properties,
      isArray: Array.isArray(properties),
      length: properties?.length
    });
  }, [loading, error, data, properties]);



  // Transform database properties to frontend format with better safety
  const transformedProperties = useMemo(() => {
    if (!properties || !Array.isArray(properties)) {
      return [];
    }
    return properties.map(transformDatabaseProperty);
  }, [properties]);

  // Filter properties based on selected property type
  const filteredProperties = transformedProperties.filter((property: any) => {
    switch (selectedPropertyType) {
      case 'for-sale':
        return property.status === 'for-sale';
      case 'for-rent':
        return property.status === 'for-rent';
      case 'short-let':
        return property.status === 'short-let';
      default:
        return true;
    }
  });

  // Calculate pagination
  const totalProperties = filteredProperties.length;
  const totalPages = Math.ceil(totalProperties / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentPageProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to first page when property type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPropertyType]);

  const handlePropertyTypeChange = (type: string) => {
    setSelectedPropertyType(type);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Show loading state first
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading featured properties...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Add safety check to prevent null reference errors - only after loading and error checks
  if (!transformedProperties || transformedProperties.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">No properties available</p>
          </div>
        </div>
      </section>
    );
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
          {currentPageProperties.map((property: any, index: number) => (
            <div 
              key={property.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard 
                property={property} 
                viewMode="grid"
                onContact={(property) => console.log('Contact for property:', property.title)}
              />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, totalProperties)} of {totalProperties} verified properties
            </p>
          </div>
        )}


      </div>
    </section>
  );
}
