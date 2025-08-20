'use client';

import { useState } from 'react';
import { MapboxMap } from '@/components/map/MapboxMap';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, List, Grid3X3, Maximize2 } from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';

interface MapViewProps {
  properties: Property[];
  currency: CurrencyCode;
  onPropertySave?: (propertyId: string) => void;
  onPropertyContact?: (property: Property) => void;
  className?: string;
}

export function MapView({ 
  properties, 
  currency, 
  onPropertySave, 
  onPropertyContact,
  className = '' 
}: MapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate map center based on properties
  const getMapCenter = () => {
    if (properties.length === 0) {
      // Default to Accra, Ghana
      return { lat: 5.6037, lng: -0.1870 };
    }

    const avgLat = properties.reduce((sum, prop) => sum + prop.location.coordinates.lat, 0) / properties.length;
    const avgLng = properties.reduce((sum, prop) => sum + prop.location.coordinates.lng, 0) / properties.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const closePropertyDetails = () => {
    setSelectedProperty(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
        {/* Map Container */}
        <div className={`flex-1 relative ${!isFullscreen && 'rounded-l-lg overflow-hidden border-l border-y'}`}>
          <MapboxMap
            coordinates={getMapCenter()}
            properties={properties}
            height="100%"
            showControls={true}
            showNearbyPlaces={false}
            interactive={true}
            onPropertySelect={handlePropertySelect}
            className="h-full"
          />

          {/* Map Overlay Controls */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 text-sm">
              {properties.length} Properties
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/90 hover:bg-white"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Close Fullscreen */}
          {isFullscreen && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Property Details Sidebar */}
        <div className={`${isFullscreen ? 'w-96' : 'w-80'} flex-shrink-0 bg-white border-r border-y rounded-r-lg overflow-hidden`}>
          {selectedProperty ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Property Details</h3>
                  <Button variant="ghost" size="sm" onClick={closePropertyDetails}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex-1 overflow-y-auto">
                <PropertyCard
                  property={selectedProperty}
                  viewMode="list"
                  showCurrency={currency}
                  onSave={onPropertySave}
                  onContact={onPropertyContact}
                  className="border-0 rounded-none"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center">
              <div>
                <Grid3X3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold text-muted-foreground mb-2">
                  Select a Property
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click on any property marker on the map to view its details here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Property List (for smaller screens) */}
      {selectedProperty && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t max-h-[50vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Property Details</h3>
              <Button variant="ghost" size="sm" onClick={closePropertyDetails}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <PropertyCard
              property={selectedProperty}
              viewMode="list"
              showCurrency={currency}
              onSave={onPropertySave}
              onContact={onPropertyContact}
              className="border-0"
            />
          </div>
        </div>
      )}

      {/* Properties Count Indicator for Fullscreen */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="secondary" className="bg-white/90 text-sm">
            Showing {properties.length} properties on map
          </Badge>
        </div>
      )}
    </div>
  );
}
