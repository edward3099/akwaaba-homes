'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SearchFilters } from '@/lib/types/index';

interface UseSearchStateOptions {
  persistToLocalStorage?: boolean;
  localStorageKey?: string;
}

export function useSearchState(options: UseSearchStateOptions = {}) {
  const {
    persistToLocalStorage = true,
    localStorageKey = 'akwaaba-search-filters'
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL params or localStorage
  useEffect(() => {
    if (isInitialized) return;

    const urlFilters = parseSearchParams(searchParams);
    
    if (Object.keys(urlFilters).length > 0) {
      // URL has filters, use them
      setFilters(urlFilters);
    } else if (persistToLocalStorage) {
      // Try to restore from localStorage
      try {
        const savedFilters = localStorage.getItem(localStorageKey);
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          setFilters(parsedFilters);
        } else {
          // No saved filters, set default
          const defaultFilters = { status: 'for-sale' as const };
          setFilters(defaultFilters);
        }
      } catch (error) {
        console.warn('Failed to restore search filters from localStorage:', error);
        // Set default filters on error
        const defaultFilters = { status: 'for-sale' as const };
        setFilters(defaultFilters);
      }
    } else {
      // No localStorage persistence, set default
      const defaultFilters = { status: 'for-sale' as const };
      setFilters(defaultFilters);
    }
    
    setIsInitialized(true);
  }, [searchParams, isInitialized, persistToLocalStorage, localStorageKey]);

  // Parse search params into filters object
  const parseSearchParams = useCallback((params: URLSearchParams): SearchFilters => {
    const filters: SearchFilters = {};
    
    // Basic search filters
    const query = params.get('q');
    if (query) filters.location = query;
    
    const type = params.get('type');
    if (type && type !== 'all') filters.type = [type as any];
    
    const status = params.get('status');
    if (status && status !== 'all') filters.status = status as any;
    
    // Price filters
    const minPrice = params.get('minprice');
    if (minPrice && minPrice !== '0') {
      filters.priceRange = { min: parseInt(minPrice), currency: 'GHS' };
    }
    
    const maxPrice = params.get('maxprice');
    if (maxPrice && maxPrice !== '0') {
      if (filters.priceRange) {
        filters.priceRange.max = parseInt(maxPrice);
      } else {
        filters.priceRange = { max: parseInt(maxPrice), currency: 'GHS' };
      }
    }
    
    // Bedroom filters
    const bedrooms = params.get('bedrooms');
    if (bedrooms && bedrooms !== '0') {
      // Add to filters object if it exists in SearchFilters type
      (filters as any).bedrooms = parseInt(bedrooms);
    }
    
    // Additional filters
    const addedToSite = params.get('addedToSite');
    if (addedToSite) {
      // Add to filters object if it exists in SearchFilters type
      (filters as any).addedToSite = addedToSite;
    }
    
    const keywords = params.get('keywords') || params.get('expandedKeywords');
    if (keywords) {
      // Add to filters object if it exists in SearchFilters type
      (filters as any).keywords = keywords;
    }
    
    // Page
    const page = params.get('page');
    if (page) {
      // Add to filters object if it exists in SearchFilters type
      (filters as any).page = parseInt(page);
    }
    
    return filters;
  }, []);

  // Update URL with new filters
  const updateURL = useCallback((newFilters: SearchFilters, replace = false) => {
    const params = new URLSearchParams();
    
    // Add filters to URL params
    if (newFilters.location) params.set('q', newFilters.location);
    if (newFilters.type && newFilters.type.length > 0) params.set('type', newFilters.type[0]);
    if (newFilters.status) params.set('status', newFilters.status);
    
    if (newFilters.priceRange) {
      if (newFilters.priceRange.min) params.set('minprice', newFilters.priceRange.min.toString());
      if (newFilters.priceRange.max) params.set('maxprice', newFilters.priceRange.max.toString());
    }
    
    if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms.toString());
    
    // Handle additional filters that might not be in the base SearchFilters type
    if ((newFilters as any).addedToSite) params.set('addedToSite', (newFilters as any).addedToSite);
    if ((newFilters as any).keywords) params.set('keywords', (newFilters as any).keywords);
    if ((newFilters as any).page) params.set('page', (newFilters as any).page.toString());
    
    // Set default values for required params
    if (!params.has('cid')) params.set('cid', 'for-sale');
    if (!params.has('tid')) params.set('tid', '0');
    if (!params.has('minprice')) params.set('minprice', '0');
    if (!params.has('maxprice')) params.set('maxprice', '0');
    if (!params.has('bedrooms')) params.set('bedrooms', '0');
    if (!params.has('keywords')) params.set('keywords', '');
    if (!params.has('page')) params.set('page', '1');
    
    const newURL = `${pathname}?${params.toString()}`;
    
    if (replace) {
      router.replace(newURL);
    } else {
      router.push(newURL);
    }
  }, [pathname, router]);

  // Update filters and URL
  const updateFilters = useCallback((newFilters: SearchFilters, replace = false) => {
    setFilters(newFilters);
    updateURL(newFilters, replace);
    
    // Save to localStorage if enabled
    if (persistToLocalStorage) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(newFilters));
      } catch (error) {
        console.warn('Failed to save search filters to localStorage:', error);
      }
    }
  }, [updateURL, persistToLocalStorage, localStorageKey]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {};
    setFilters(emptyFilters);
    updateURL(emptyFilters, true);
    
    if (persistToLocalStorage) {
      try {
        localStorage.removeItem(localStorageKey);
      } catch (error) {
        console.warn('Failed to clear search filters from localStorage:', error);
      }
    }
  }, [updateURL, persistToLocalStorage, localStorageKey]);

  // Update a single filter
  const updateFilter = useCallback((key: keyof SearchFilters | string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    updateFilters(newFilters, false);
  }, [filters, updateFilters]);

  // Get current URL filters
  const getCurrentURLFilters = useCallback(() => {
    return parseSearchParams(searchParams);
  }, [searchParams, parseSearchParams]);

  return {
    filters,
    isInitialized,
    updateFilters,
    updateFilter,
    clearFilters,
    getCurrentURLFilters,
    updateURL
  };
}
