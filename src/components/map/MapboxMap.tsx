'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  ExternalLink,
  School,
  Hospital,
  ShoppingCart,
  Car,
  Plane,
  MapIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers
} from 'lucide-react';
import { Property } from '@/lib/types';

// You'll need to set your Mapbox access token
// In production, this should come from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWt3YWFiYWhvbWVzIiwiYSI6ImNrZjN4eDN4MzBhZWYzMnBrZmZhZmZhZmYifQ.placeholder'; // Replace with actual token

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

// Mock nearby places data (in production, this would come from an API)
const mockNearbyPlaces = [
  { 
    type: 'school', 
    name: 'East Legon Primary School', 
    coordinates: { lat: 5.6047, lng: -0.1860 },
    distance: '0.5 km', 
    icon: School,
    category: 'Education'
  },
  { 
    type: 'hospital', 
    name: 'Legon Hospital', 
    coordinates: { lat: 5.6027, lng: -0.1880 },
    distance: '1.2 km', 
    icon: Hospital,
    category: 'Healthcare'
  },
  { 
    type: 'shopping', 
    name: 'East Legon Mall', 
    coordinates: { lat: 5.6057, lng: -0.1850 },
    distance: '0.8 km', 
    icon: ShoppingCart,
    category: 'Shopping'
  },
  { 
    type: 'transport', 
    name: 'Trotro Station', 
    coordinates: { lat: 5.6017, lng: -0.1890 },
    distance: '0.3 km', 
    icon: Car,
    category: 'Transport'
  },
];

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if Mapbox token is available
  const hasValidToken = MAPBOX_TOKEN && !MAPBOX_TOKEN.includes('placeholder');

  useEffect(() => {
    if (!hasValidToken || !mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.lng, coordinates.lat],
      zoom: zoom,
      interactive: interactive
    });

    // Add navigation controls
    if (showControls) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    map.current.on('load', () => {
      setIsLoaded(true);

      // Add main property marker
      const mainMarker = new mapboxgl.Marker({
        color: '#dc2626', // red color for main property
        scale: 1.2
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current!);

      // Add popup for main property
      if (address) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm mb-1">Property Location</h3>
              <p class="text-xs text-gray-600">${address}</p>
            </div>
          `);
        mainMarker.setPopup(popup);
      }

      // Add nearby places if enabled
      if (showNearbyPlaces) {
        mockNearbyPlaces.forEach((place) => {
          const markerElement = document.createElement('div');
          markerElement.className = 'w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg';
          markerElement.innerHTML = `<div class="w-4 h-4 text-white">📍</div>`;

          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat([place.coordinates.lng, place.coordinates.lat])
            .addTo(map.current!);

          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm mb-1">${place.name}</h3>
                <p class="text-xs text-gray-600">${place.category} • ${place.distance}</p>
              </div>
            `);
          marker.setPopup(popup);
        });
      }

      // Add multiple properties if provided
      if (properties.length > 0) {
        properties.forEach((property) => {
          const markerElement = document.createElement('div');
          markerElement.className = 'cursor-pointer transform hover:scale-110 transition-transform';
          markerElement.innerHTML = `
            <div class="bg-white border-2 border-primary rounded-lg p-2 shadow-lg min-w-[120px]">
              <div class="text-xs font-semibold text-primary">₵${property.price.toLocaleString()}</div>
              <div class="text-xs text-gray-600">${property.specifications.bedrooms}bed • ${property.specifications.bathrooms}bath</div>
            </div>
          `;

          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat([property.location.coordinates.lng, property.location.coordinates.lat])
            .addTo(map.current!);

          // Add click event
          markerElement.addEventListener('click', () => {
            if (onPropertySelect) {
              onPropertySelect(property);
            }
          });

          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-3 max-w-sm">
                <h3 class="font-semibold text-sm mb-2">${property.title}</h3>
                <div class="text-lg font-bold text-primary mb-1">₵${property.price.toLocaleString()}</div>
                <div class="text-xs text-gray-600 mb-2">${property.location.address}</div>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <span>${property.specifications.bedrooms} beds</span>
                  <span>•</span>
                  <span>${property.specifications.bathrooms} baths</span>
                  <span>•</span>
                  <span>${property.specifications.size.toLocaleString()} ${property.specifications.sizeUnit}</span>
                </div>
              </div>
            `);
          marker.setPopup(popup);
        });
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [coordinates, hasValidToken, properties, showNearbyPlaces, address, zoom, interactive, showControls, onPropertySelect]);

  const toggleStyle = () => {
    if (!map.current) return;
    
    const newStyle = showSatellite 
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    
    map.current.setStyle(newStyle);
    setShowSatellite(!showSatellite);
  };

  const zoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

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

  // Fallback component when Mapbox token is not available
  if (!hasValidToken) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border ${className}`} style={{ height }}>
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
    );
  }

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height: isFullscreen ? '100vh' : height }}
      />
      
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleStyle}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <Layers className="w-4 h-4" />
          </Button>
          
          <div className="flex flex-col bg-white/90 rounded shadow-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="hover:bg-white rounded-b-none"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="hover:bg-white rounded-t-none border-t"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

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

      {/* Map Style Indicator */}
      {isLoaded && (
        <Badge 
          variant="secondary" 
          className="absolute bottom-4 left-4 bg-white/90 text-xs"
        >
          {showSatellite ? 'Satellite' : 'Street'} View
        </Badge>
      )}
    </div>
  );
}
