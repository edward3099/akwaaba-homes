'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  ExternalLink,
  MapIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers
} from 'lucide-react';
import { Property } from '@/lib/types/index';

interface MapboxMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  properties?: Property[];
  address?: string;
  zoom?: number;
  height?: string;
  showControls?: boolean;
  showNearbyPlaces?: boolean;
  interactive?: boolean;
  className?: string;
  onPropertySelect?: (property: Property) => void;
}

export function MapboxMap({ 
  coordinates, 
  properties = [],
  address,
  zoom = 14,
  height = '400px',
  showControls = true,
  showNearbyPlaces = false,
  interactive = true,
  className = '',
  onPropertySelect
}: MapboxMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openInGoogleMaps = () => {
    const url = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  const getDirections = () => {
    const url = `https://maps.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fallback component when Mapbox token is not available (for development)
  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div 
        className="w-full rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 border"
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="text-center">
            <MapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Interactive map will be integrated here</p>
            <p className="text-sm text-gray-500 mb-4">
              Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
            {address && (
              <p className="text-sm text-gray-600 mb-4">{address}</p>
            )}
            <div className="flex gap-2 justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={openInGoogleMaps}
                className="bg-white/90 hover:bg-white flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View in Maps
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={getDirections}
                className="bg-white/90 hover:bg-white flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* External Map Links */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={openInGoogleMaps}
          className="bg-white/90 hover:bg-white shadow-md flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Maps
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={getDirections}
          className="bg-white/90 hover:bg-white shadow-md flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </Button>
      </div>

      {/* Close Fullscreen Button */}
      {isFullscreen && (
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white shadow-md"
        >
          Close
        </Button>
      )}
    </div>
  );
}
