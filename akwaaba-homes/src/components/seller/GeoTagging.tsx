'use client';

import { useState, useCallback } from 'react';
import { MapboxMap } from '@/components/map/MapboxMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Target,
  Crosshair,
  Globe
} from 'lucide-react';

interface GeoTaggingProps {
  onLocationSelect: (coordinates: { lat: number; lng: number }, address?: string) => void;
  initialCoordinates?: { lat: number; lng: number };
  initialAddress?: string;
  className?: string;
}

export function GeoTagging({ 
  onLocationSelect, 
  initialCoordinates,
  initialAddress,
  className = '' 
}: GeoTaggingProps) {
  const [coordinates, setCoordinates] = useState(
    initialCoordinates || { lat: 5.6037, lng: -0.1870 } // Default to Accra
  );
  const [address, setAddress] = useState(initialAddress || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<'high' | 'medium' | 'low' | null>(null);
  const [plusCode, setPlusCode] = useState('');

  // Mock geocoding function (in production, use actual geocoding service)
  const mockGeocode = async (query: string) => {
    // This would be replaced with actual geocoding API call
    const mockResults = [
      { address: 'East Legon, Accra, Ghana', coordinates: { lat: 5.6037, lng: -0.1870 } },
      { address: 'Airport Residential, Accra, Ghana', coordinates: { lat: 5.6050, lng: -0.1869 } },
      { address: 'Kumasi, Ashanti, Ghana', coordinates: { lat: 6.6885, lng: -1.6244 } },
    ];
    
    return mockResults.filter(result => 
      result.address.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Generate Plus Code (simplified version)
  const generatePlusCode = (lat: number, lng: number) => {
    // This is a simplified version - in production, use the actual Plus Codes library
    const latCode = Math.floor((lat + 90) * 8000).toString(36).toUpperCase();
    const lngCode = Math.floor((lng + 180) * 8000).toString(36).toUpperCase();
    return `${latCode.slice(-4)}+${lngCode.slice(-4)}`;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await mockGeocode(searchQuery);
      if (results.length > 0) {
        const result = results[0];
        setCoordinates(result.coordinates);
        setAddress(result.address);
        setPlusCode(generatePlusCode(result.coordinates.lat, result.coordinates.lng));
        setLocationAccuracy('medium');
        onLocationSelect(result.coordinates, result.address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleCurrentLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoordinates(newCoordinates);
          setPlusCode(generatePlusCode(newCoordinates.lat, newCoordinates.lng));
          
          // Determine accuracy based on GPS accuracy
          const accuracy = position.coords.accuracy;
          if (accuracy < 10) {
            setLocationAccuracy('high');
          } else if (accuracy < 50) {
            setLocationAccuracy('medium');
          } else {
            setLocationAccuracy('low');
          }
          
          onLocationSelect(newCoordinates);
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleMapClick = useCallback((coordinates: { lat: number; lng: number }) => {
    setCoordinates(coordinates);
    setPlusCode(generatePlusCode(coordinates.lat, coordinates.lng));
    setLocationAccuracy('medium');
    onLocationSelect(coordinates);
  }, [onLocationSelect]);

  const getAccuracyBadge = () => {
    if (!locationAccuracy) return null;
    
    const config = {
      high: { label: 'High Accuracy', color: 'bg-green-600', icon: CheckCircle2 },
      medium: { label: 'Good Accuracy', color: 'bg-blue-600', icon: CheckCircle2 },
      low: { label: 'Low Accuracy', color: 'bg-amber-600', icon: AlertCircle }
    };
    
    const { label, color, icon: Icon } = config[locationAccuracy];
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Property Location (Required)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Search Address</Label>
              <Input
                id="search"
                placeholder="Enter property address (e.g., East Legon, Accra)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex flex-col justify-end">
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Current Location Button */}
          <Button
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center gap-2"
          >
            {isLocating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4" />
                Use Current Location
              </>
            )}
          </Button>

          {/* Accuracy Indicator */}
          {locationAccuracy && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Location Accuracy:</span>
              {getAccuracyBadge()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Pin Your Property Location
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on the map to precisely mark your property location
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MapboxMap
              coordinates={coordinates}
              height="400px"
              showControls={true}
              showNearbyPlaces={false}
              interactive={true}
              className="rounded-lg border"
              // In a real implementation, you'd add a click handler here
            />

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Coordinates</Label>
                <div className="text-sm text-muted-foreground font-mono">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </div>
              </div>
              
              {plusCode && (
                <div>
                  <Label>Plus Code</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{plusCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(plusCode)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {address && (
              <div>
                <Label>Detected Address</Label>
                <div className="text-sm text-muted-foreground">{address}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Geo-tagging Requirements */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h4 className="font-semibold mb-2">Why Geo-tagging is Required</h4>
              <ul className="space-y-1 text-xs">
                <li>• Ensures accurate property location for buyers</li>
                <li>• Prevents fraud and fake property listings</li>
                <li>• Enables precise map search and navigation</li>
                <li>• Required for verification and platform trust</li>
                <li>• Helps diaspora buyers locate properties accurately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            // Reset to default location
            setCoordinates({ lat: 5.6037, lng: -0.1870 });
            setAddress('');
            setPlusCode('');
            setLocationAccuracy(null);
          }}
          className="flex-1"
        >
          Reset Location
        </Button>
        
        <Button
          onClick={() => onLocationSelect(coordinates, address)}
          disabled={!locationAccuracy}
          className="flex-1 btn-ghana"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
