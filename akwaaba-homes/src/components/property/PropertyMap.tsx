'use client';

import { MapboxMap } from '@/components/map/MapboxMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  ExternalLink,
  School,
  Hospital,
  ShoppingCart,
  Car,
  Plane
} from 'lucide-react';

interface PropertyMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

// Mock nearby places data
const mockNearbyPlaces = [
  { type: 'school', name: 'East Legon Primary School', distance: '0.5 km', icon: School },
  { type: 'hospital', name: 'Legon Hospital', distance: '1.2 km', icon: Hospital },
  { type: 'shopping', name: 'East Legon Mall', distance: '0.8 km', icon: ShoppingCart },
  { type: 'transport', name: 'Trotro Station', distance: '0.3 km', icon: Car },
  { type: 'airport', name: 'Kotoka International Airport', distance: '15.2 km', icon: Plane },
];

export function PropertyMap({ coordinates, address }: PropertyMapProps) {
  return (
    <div className="space-y-4">
      {/* Interactive Map */}
      <div className="relative">
        <MapboxMap
          coordinates={coordinates}
          address={address}
          height="400px"
          showControls={true}
          showNearbyPlaces={true}
          interactive={true}
          className="rounded-lg border"
        />
      </div>

      {/* Address Information */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="font-medium">{address}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Places */}
      <div className="space-y-3">
        <h4 className="font-semibold">Nearby Places</h4>
        <div className="grid grid-cols-1 gap-2">
          {mockNearbyPlaces.map((place, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <place.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{place.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{place.type}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {place.distance}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Transportation Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Transportation</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>15 min drive to Accra CBD</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            <span>20 min drive to Kotoka Airport</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Public transport readily available</span>
          </div>
        </div>
      </div>

      {/* Neighborhood Insights */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 className="font-semibold text-green-900 mb-2">Neighborhood Highlights</h4>
        <div className="space-y-1 text-sm text-green-800">
          <p>• Upscale residential area with 24/7 security</p>
          <p>• Close to international schools and embassies</p>
          <p>• Walking distance to restaurants and cafes</p>
          <p>• Well-maintained roads and infrastructure</p>
        </div>
      </div>
    </div>
  );
}
