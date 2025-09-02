'use client';

import React, { useState, useEffect } from 'react';
import { useLoadingState } from '@/lib/utils/loadingStates';
import { propertiesApi } from '@/lib/api/client';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  address: string;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  created_at: string;
}

interface PropertyDetailProps {
  propertyId: string;
}

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const loadingState = useLoadingState();

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      loadingState.setLoading(true);
      const response = await propertiesApi.getById(propertyId);
      
      if (response.success && response.data) {
        setProperty(response.data);
      } else {
        console.error('Failed to fetch property:', response.error);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      loadingState.setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loadingState.isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{property.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{property.address}, {property.city}, {property.state}</p>
        
        <div className="text-3xl font-bold text-blue-600 mb-6">
          {formatPrice(property.price)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {property.bedrooms && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{property.bedrooms}</div>
              <div className="text-gray-600">Bedrooms</div>
            </div>
          )}
          {property.bathrooms && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{property.bathrooms}</div>
              <div className="text-gray-600">Bathrooms</div>
            </div>
          )}
          {property.square_feet && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{property.square_feet}</div>
              <div className="text-gray-600">Square Feet</div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed">{property.description}</p>
        </div>
        
        <div className="text-sm text-gray-500">
          Listed on {new Date(property.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
