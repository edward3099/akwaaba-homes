'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, SlidersHorizontal } from 'lucide-react'

export interface PropertyFilters {
  search: string
  property_type: string
  listing_type: string
  status: string
  min_price: string
  max_price: string
  min_bedrooms: string
  min_bathrooms: string
  city: string
  region: string
}

interface PropertySearchFiltersProps {
  onFiltersChange: (filters: PropertyFilters) => void
  className?: string
}

export function PropertySearchFilters({ onFiltersChange, className }: PropertySearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    property_type: '',
    listing_type: '',
    status: '',
    min_price: '',
    max_price: '',
    min_bedrooms: '',
    min_bathrooms: '',
    city: '',
    region: ''
  })

  useEffect(() => {
    const newFilters: PropertyFilters = {
      search: searchParams.get('search') || '',
      property_type: searchParams.get('property_type') || '',
      listing_type: searchParams.get('listing_type') || '',
      status: searchParams.get('status') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      min_bedrooms: searchParams.get('min_bedrooms') || '',
      min_bathrooms: searchParams.get('min_bathrooms') || '',
      city: searchParams.get('city') || '',
      region: searchParams.get('region') || ''
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [searchParams, onFiltersChange])

  const updateFilters = (updates: Partial<PropertyFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.delete('page')
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(newUrl, { scroll: false })
    onFiltersChange(newFilters)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by address, city, or description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={filters.property_type}
              onChange={(e) => updateFilters({ property_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Type
            </label>
            <select
              value={filters.listing_type}
              onChange={(e) => updateFilters({ listing_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Listings</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Cities</option>
              <option value="accra">Accra</option>
              <option value="kumasi">Kumasi</option>
              <option value="tamale">Tamale</option>
            </select>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (GHS)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.min_price}
                  onChange={(e) => updateFilters({ min_price: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (GHS)
                </label>
                <Input
                  type="number"
                  placeholder="Any"
                  value={filters.max_price}
                  onChange={(e) => updateFilters({ max_price: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Bedrooms
                </label>
                <select
                  value={filters.min_bedrooms}
                  onChange={(e) => updateFilters({ min_bedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Bathrooms
                </label>
                <select
                  value={filters.min_bathrooms}
                  onChange={(e) => updateFilters({ min_bathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
