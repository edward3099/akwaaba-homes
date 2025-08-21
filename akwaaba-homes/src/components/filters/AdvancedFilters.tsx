'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Bed, 
  Bath, 
  Square,
  Filter,
  CheckCircle2,
  Star
} from 'lucide-react';
import { Property, SearchFilters, CurrencyCode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  currency, 
  onCurrencyChange 
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleFilterChange = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const propertyTypes: { value: Property['type']; label: string; icon: string }[] = [
    { value: 'house', label: 'Houses', icon: '🏠' },
    { value: 'apartment', label: 'Apartments', icon: '🏢' },
    { value: 'land', label: 'Land', icon: '🌍' },
    { value: 'commercial', label: 'Commercial', icon: '🏬' },
    { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
    { value: 'condo', label: 'Condos', icon: '🏙️' },
  ];

  const priceRanges = [
    { value: '0-100000', label: formatCurrency(0, currency) + ' - ' + formatCurrency(100000, currency, undefined, { compact: true }) },
    { value: '100000-300000', label: formatCurrency(100000, currency, undefined, { compact: true }) + ' - ' + formatCurrency(300000, currency, undefined, { compact: true }) },
    { value: '300000-500000', label: formatCurrency(300000, currency, undefined, { compact: true }) + ' - ' + formatCurrency(500000, currency, undefined, { compact: true }) },
    { value: '500000-1000000', label: formatCurrency(500000, currency, undefined, { compact: true }) + ' - ' + formatCurrency(1000000, currency, undefined, { compact: true }) },
    { value: '1000000+', label: formatCurrency(1000000, currency, undefined, { compact: true }) + '+' },
  ];

  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Eastern',
    'Northern',
    'Upper East',
    'Upper West',
    'Volta',
    'Brong Ahafo',
  ];

  const amenities = [
    'Swimming Pool',
    '24/7 Security',
    'Gym/Fitness Center',
    'Parking',
    'Generator',
    'Air Conditioning',
    'Garden',
    'Balcony',
    'CCTV',
    'Water Tank',
    'Solar Panels',
    'Servant Quarters',
  ];

  const togglePropertyType = (type: Property['type']) => {
    const currentTypes = localFilters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    handleFilterChange('type', newTypes.length > 0 ? newTypes : []);
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = localFilters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', newAmenities.length > 0 ? newAmenities : []);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Currency Selection */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            Currency
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={currency} onValueChange={(value: CurrencyCode) => onCurrencyChange(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GHS">₵ Ghana Cedi (GHS)</SelectItem>
              <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
              <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
              <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Property Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Home className="w-4 h-4" />
            Property Type
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <Button
                key={type.value}
                variant={localFilters.type?.includes(type.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePropertyType(type.value)}
                className="justify-start h-auto py-3"
              >
                <span className="mr-2">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={localFilters.priceRange?.min || ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : undefined;
                handleFilterChange('priceRange', {
                  ...localFilters.priceRange,
                  min,
                  currency
                });
              }}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={localFilters.priceRange?.max || ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : undefined;
                handleFilterChange('priceRange', {
                  ...localFilters.priceRange,
                  max,
                  currency
                });
              }}
            />
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground mb-2">Quick Select:</div>
            {priceRanges.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => {
                  const [min, max] = range.value.includes('+') 
                    ? [parseInt(range.value.replace('+', '')), undefined]
                    : range.value.split('-').map(v => parseInt(v));
                  
                  handleFilterChange('priceRange', { min, max, currency });
                }}
                className="w-full justify-start text-xs h-8"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bedrooms & Bathrooms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bed className="w-4 h-4" />
            Rooms
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Bedrooms</label>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, '6+'].map((bed) => (
                <Button
                  key={bed}
                  variant={localFilters.bedrooms?.min === (typeof bed === 'string' ? 6 : bed) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const value = typeof bed === 'string' ? 6 : bed;
                    handleFilterChange('bedrooms', { min: value });
                  }}
                  className="text-xs p-1 h-8"
                >
                  {bed}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Bathrooms</label>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, '6+'].map((bath) => (
                <Button
                  key={bath}
                  variant={localFilters.bathrooms?.min === (typeof bath === 'string' ? 6 : bath) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const value = typeof bath === 'string' ? 6 : bath;
                    handleFilterChange('bathrooms', { min: value });
                  }}
                  className="text-xs p-1 h-8"
                >
                  {bath}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Square className="w-4 h-4" />
            Property Size
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min sqft"
              value={localFilters.sizeRange?.min || ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : undefined;
                handleFilterChange('sizeRange', {
                  ...localFilters.sizeRange,
                  min,
                  unit: 'sqft'
                });
              }}
            />
            <Input
              type="number"
              placeholder="Max sqft"
              value={localFilters.sizeRange?.max || ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : undefined;
                handleFilterChange('sizeRange', {
                  ...localFilters.sizeRange,
                  max,
                  unit: 'sqft'
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            Amenities
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {amenities.map((amenity) => (
              <Button
                key={amenity}
                variant="ghost"
                size="sm"
                onClick={() => toggleAmenity(amenity)}
                className={`w-full justify-start text-xs h-8 ${
                  localFilters.amenities?.includes(amenity) 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <CheckCircle2 
                  className={`w-3 h-3 mr-2 ${
                    localFilters.amenities?.includes(amenity) 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`} 
                />
                {amenity}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            variant={localFilters.verifiedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('verifiedOnly', !localFilters.verifiedOnly)}
            className="w-full justify-start"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Verified Properties Only
          </Button>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => {
          setLocalFilters({});
          onFiltersChange({});
        }}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
