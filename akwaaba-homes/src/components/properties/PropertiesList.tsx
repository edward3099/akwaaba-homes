'use client'

import { useState, useEffect } from 'react';
import { useProperties } from '@/lib/hooks/useApi';
import PropertyCard from './PropertyCard';
import { DatabaseProperty } from '@/lib/types/database';
import { Property } from '@/lib/types/index';

const transformDatabaseProperty = (dbProperty: DatabaseProperty): Property => {
  return {
    id: dbProperty.id,
    title: dbProperty.title || 'Untitled Property',
    description: dbProperty.description || '',
    price: dbProperty.price || 0,
    currency: 'GHS', // Always GHS for Ghana
    status: dbProperty.status === 'active' ? 'for-sale' : 
            dbProperty.status === 'sold' ? 'sold' : 
            dbProperty.status === 'rented' ? 'rented' : 'for-sale',
    type: dbProperty.property_type === 'office' ? 'commercial' : dbProperty.property_type,
    
    // Location & Geo-tagging (mandatory)
    location: {
      address: dbProperty.address || '',
      city: dbProperty.city || '',
      region: dbProperty.region || '',
      country: 'Ghana',
      coordinates: {
        lat: dbProperty.latitude || 5.6037, // Default to Accra coordinates
        lng: dbProperty.longitude || -0.1870,
      },
      plusCode: undefined, // Will be generated later
    },

    // Property Details
    specifications: {
      bedrooms: dbProperty.bedrooms,
      bathrooms: dbProperty.bathrooms,
      size: dbProperty.square_feet || dbProperty.land_size || 0,
      sizeUnit: 'sqft',
      lotSize: dbProperty.land_size,
      lotSizeUnit: 'sqft',
      yearBuilt: dbProperty.year_built,
      parkingSpaces: undefined,
    },

    // Media
    images: dbProperty.image_urls || [], // Use the image_urls from database
    videos: undefined,
    virtualTour: undefined,
    
    // Features & Amenities
    features: dbProperty.features || [],
    amenities: dbProperty.amenities || [],
    
    // Seller Information (placeholder - will need to fetch from user table)
    seller: {
      id: dbProperty.seller_id,
      name: 'Unknown Seller', // Will be fetched separately
      type: 'individual', // Default
      phone: '', // Will be fetched separately
      email: undefined,
      whatsapp: undefined,
      isVerified: false, // Will be fetched separately
      company: undefined,
      licenseNumber: undefined,
    },

    // Trust & Verification
    verification: {
      isVerified: false, // Will be updated based on actual verification status
      documentsUploaded: false, // Will be updated based on actual status
      verificationDate: undefined,
      adminNotes: undefined,
    },

    // Timestamps
    createdAt: dbProperty.created_at || new Date().toISOString(),
    updatedAt: dbProperty.updated_at || new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    
    // Visibility Tier
    tier: dbProperty.is_featured ? 'premium' : 'normal',
    
    // Diaspora Features
    diasporaFeatures: {
      multiCurrencyDisplay: true,
      inspectionScheduling: true,
      virtualTourAvailable: false,
      familyRepresentativeContact: undefined,
    },
  };
};

export default function PropertiesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  
  const { loading, error, data: properties, getProperties, clearError } = useProperties();

  useEffect(() => {
    console.log('Calling getProperties with filters:', {
      page: currentPage,
      limit: 12,
      propertyType: selectedPropertyType === 'all' ? undefined : selectedPropertyType,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
    getProperties({
      page: currentPage,
      limit: 12,
      propertyType: selectedPropertyType === 'all' ? undefined : selectedPropertyType,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  }, [currentPage, selectedPropertyType, selectedStatus, priceRange]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !properties) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-600 text-lg mb-4">Error loading properties</div>
        <button
          onClick={clearError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log('Raw properties data:', properties);
  const transformedProperties = properties?.properties?.map(transformDatabaseProperty) || [];
  console.log('Transformed properties:', transformedProperties);
  const totalPages = properties?.pagination?.totalPages || 1;

  return (
    <div>
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price (GHS)
            </label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price (GHS)
            </label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
            />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {transformedProperties.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-500 text-lg">No properties found</div>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {transformedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
