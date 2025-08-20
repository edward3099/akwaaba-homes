'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  MapPin, 
  Home, 
  DollarSign,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';
import { SearchFilters, Property, CurrencyCode } from '@/lib/types';

interface MobileSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  defaultValues?: {
    query?: string;
    type?: Property['type'];
    currency?: CurrencyCode;
  };
  className?: string;
}

export function MobileSearchBar({ 
  onSearch, 
  defaultValues = {},
  className = '' 
}: MobileSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(defaultValues.query || '');
  const [propertyType, setPropertyType] = useState<Property['type'] | 'all'>(defaultValues.type || 'all');
  const [status, setStatus] = useState<Property['status'] | 'all'>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [currency, setCurrency] = useState<CurrencyCode>(defaultValues.currency || 'GHS');

  const propertyTypes = [
    { value: 'all', label: 'All Types', icon: '🏠' },
    { value: 'house', label: 'Houses', icon: '🏠' },
    { value: 'apartment', label: 'Apartments', icon: '🏢' },
    { value: 'land', label: 'Land', icon: '🌍' },
    { value: 'commercial', label: 'Commercial', icon: '🏬' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Buy or Rent' },
    { value: 'for-sale', label: 'For Sale' },
    { value: 'for-rent', label: 'For Rent' },
  ];

  const currencyOptions = [
    { value: 'GHS', label: '₵ Ghana Cedi', symbol: '₵' },
    { value: 'USD', label: '$ US Dollar', symbol: '$' },
    { value: 'GBP', label: '£ British Pound', symbol: '£' },
    { value: 'EUR', label: '€ Euro', symbol: '€' },
  ];

  const handleSearch = () => {
    const filters: SearchFilters = {
      location: searchQuery || undefined,
      type: propertyType !== 'all' ? [propertyType] : undefined,
      status: status !== 'all' ? status : undefined,
      priceRange: priceRange.min || priceRange.max ? {
        min: priceRange.min ? parseInt(priceRange.min) : undefined,
        max: priceRange.max ? parseInt(priceRange.max) : undefined,
        currency
      } : undefined,
    };

    onSearch(filters);
    setIsExpanded(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPropertyType('all');
    setStatus('all');
    setPriceRange({ min: '', max: '' });
    setCurrency('GHS');
    onSearch({});
  };

  const hasFilters = searchQuery || propertyType !== 'all' || status !== 'all' || priceRange.min || priceRange.max;

  return (
    <div className={`w-full ${className}`}>
      {/* Compact Search Bar */}
      <Card className="p-4 shadow-lg border-0 bg-white/95 backdrop-blur-md">
        <div className="space-y-4">
          {/* Primary Search Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input
              placeholder="Where are you looking?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-12 text-base no-zoom rounded-xl border-0 bg-muted/50 focus:bg-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-ghana h-8 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Filters Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 smooth-scroll">
            {/* Property Type Quick Select */}
            <Select value={propertyType} onValueChange={(value: string) => setPropertyType(value)}>
              <SelectTrigger className="w-auto min-w-[100px] h-10 border-0 bg-muted/50 rounded-full text-sm">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Quick Select */}
            <Select value={status} onValueChange={(value: string) => setStatus(value)}>
              <SelectTrigger className="w-auto min-w-[100px] h-10 border-0 bg-muted/50 rounded-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`h-10 rounded-full border-0 bg-muted/50 flex items-center gap-2 ${isExpanded ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasFilters && !isExpanded && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t animate-slide-up">
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="space-y-3">
                  {/* Currency Selector */}
                  <Select value={currency} onValueChange={(value: CurrencyCode) => setCurrency(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Price Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {currencyOptions.find(c => c.value === currency)?.symbol}
                      </span>
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="pl-8 h-10 no-zoom"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {currencyOptions.find(c => c.value === currency)?.symbol}
                      </span>
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="pl-8 h-10 no-zoom"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1 h-12 touch-manipulation"
                  disabled={!hasFilters}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleSearch}
                  className="flex-1 h-12 btn-ghana touch-manipulation"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Active Filters Display */}
      {hasFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2 mt-3 px-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {searchQuery}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
          {propertyType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {propertyTypes.find(t => t.value === propertyType)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setPropertyType('all')}
              />
            </Badge>
          )}
          {status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {statusOptions.find(s => s.value === status)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setStatus('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
