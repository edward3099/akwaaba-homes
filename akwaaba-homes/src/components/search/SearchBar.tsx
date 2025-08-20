'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Home, DollarSign, Filter } from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';

interface SearchBarProps {
  onSearch?: (filters: { query: string; type: Property['type'][] | undefined; minPrice: number; maxPrice: number; status: Property['status'] | undefined }) => void;
  showAdvancedFilters?: boolean;
  className?: string;
}

export function SearchBar({ onSearch, showAdvancedFilters = false, className = '' }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState<Property['type'] | 'all'>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'house', label: 'Houses' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condo', label: 'Condos' },
  ];

  const priceRanges = [
    { value: 'all', label: 'Any Price' },
    { value: '0-100000', label: formatCurrency(0, currency) + ' - ' + formatCurrency(100000, currency, undefined, { compact: true }) },
    { value: '100000-300000', label: formatCurrency(100000, currency, undefined, { compact: true }) + ' - ' + formatCurrency(300000, currency, undefined, { compact: true }) },
    { value: '300000-500000', label: formatCurrency(300000, currency, undefined, { compact: true }) + ' - ' + formatCurrency(500000, currency, undefined, { compact: true }) },
    { value: '500000-1000000', label: formatCurrency(500000, currency, undefined, { compact: true }) + ' - ' + formatCurrency(1000000, currency, undefined, { compact: true }) },
    { value: '1000000+', label: formatCurrency(1000000, currency, undefined, { compact: true }) + '+' },
  ];

  const currencies = [
    { value: 'GHS', label: '₵ GHS' },
    { value: 'USD', label: '$ USD' },
    { value: 'GBP', label: '£ GBP' },
    { value: 'EUR', label: '€ EUR' },
  ];

  const handleSearch = () => {
    const filters = {
      query: searchQuery,
      type: propertyType !== 'all' ? [propertyType as Property['type']] : undefined,
      minPrice: 0,
      maxPrice: 10000000,
      status: undefined,
    };

    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to search page with filters
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (propertyType !== 'all') params.set('type', propertyType);
      if (priceRange !== 'all') params.set('price', priceRange);
      if (currency !== 'GHS') params.set('currency', currency);
      
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
          {/* Location Search */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="City, Region, or Neighborhood"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 search-input h-11 no-zoom"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Property Type
            </label>
            <Select value={propertyType} onValueChange={(value: string) => setPropertyType(value as Property['type'] | 'all')}>
              <SelectTrigger className="w-full h-11">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Price Range
            </label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full h-11">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Currency
            </label>
            <Select value={currency} onValueChange={(value: CurrencyCode) => setCurrency(value)}>
              <SelectTrigger className="w-full h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <Button 
              onClick={handleSearch}
              className="w-full h-11 btn-ghana flex items-center gap-2 touch-manipulation tap-target"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        )}
      </div>


    </div>
  );
}
