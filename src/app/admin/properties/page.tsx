'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertySearchFilters, PropertyFilters } from '@/components/properties/PropertySearchFilters'
import { PropertyPagination } from '@/components/properties/PropertyPagination'
import { Grid3X3, List, Eye, Edit, Trash2, MapPin, Bed, Bath, Square, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  description: string
  property_type: string
  listing_type: string
  price: number
  currency: string
  address: string
  city: string
  region: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  status: string
  is_featured: boolean
  created_at: string
  images?: Array<{
    url: string
    is_primary: boolean
    alt_text?: string
  }>
}

interface PropertiesResponse {
  properties: Property[]
  total: number
  page: number
  totalPages: number
}

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    itemsPerPage: 12
  })

  // Get current filters from URL
  const getCurrentFilters = (): PropertyFilters => ({
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
  })

  // Fetch properties based on current filters and pagination
  const fetchProperties = async () => {
    setLoading(true)
    setError(null)

    try {
      const filters = getCurrentFilters()
      const currentPage = parseInt(searchParams.get('page') || '1')
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.property_type) params.set('property_type', filters.property_type)
      if (filters.listing_type) params.set('listing_type', filters.listing_type)
      if (filters.status) params.set('status', filters.status)
      if (filters.min_price) params.set('min_price', filters.min_price)
      if (filters.max_price) params.set('max_price', filters.max_price)
      if (filters.min_bedrooms) params.set('min_bedrooms', filters.min_bedrooms)
      if (filters.min_bathrooms) params.set('min_bathrooms', filters.min_bathrooms)
      if (filters.city) params.set('city', filters.city)
      if (filters.region) params.set('region', filters.region)
      params.set('page', currentPage.toString())
      params.set('limit', pagination.itemsPerPage.toString())

      const response = await fetch(`/api/properties?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`)
      }

      const data: PropertiesResponse = await response.json()
      
      setProperties(data.properties)
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        itemsPerPage: pagination.itemsPerPage
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties')
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: PropertyFilters) => {
    // The PropertySearchFilters component already updates the URL
    // We just need to refetch the data
    fetchProperties()
  }

  // Fetch properties when component mounts or URL changes
  useEffect(() => {
    fetchProperties()
  }, [searchParams])

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Get primary image URL
  const getPrimaryImage = (property: Property) => {
    if (property.images && property.images.length > 0) {
      const primaryImage = property.images.find(img => img.is_primary)
      return primaryImage?.url || property.images[0].url
    }
    return '/placeholder-property.jpg' // Fallback image
  }

  // Render property card for grid view
  const renderPropertyCard = (property: Property) => (
    <Card key={property.id} className="h-full hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={getPrimaryImage(property)}
          alt={property.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-property.jpg'
          }}
        />
        {property.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
            Featured
          </Badge>
        )}
        <Badge 
          variant={property.status === 'active' ? 'default' : 'secondary'}
          className="absolute top-2 right-2"
        >
          {property.status}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {property.title}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{property.city}, {property.region}</span>
            </div>
          </div>
          <div className="text-right ml-2">
            <div className="text-lg font-bold text-green-600">
              {formatPrice(property.price, property.currency)}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {property.listing_type}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {property.description}
        </p>

        {/* Property details */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          {property.bedrooms !== undefined && (
            <div className="flex items-center text-gray-600">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} beds</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center text-gray-600">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} baths</span>
            </div>
          )}
          {property.square_feet !== undefined && (
            <div className="flex items-center text-gray-600">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.square_feet} sq ft</span>
            </div>
          )}
        </div>

        {/* Property type and date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="capitalize">{property.property_type}</span>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{new Date(property.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/admin/properties/${property.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/admin/properties/${property.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Render property list item for list view
  const renderPropertyListItem = (property: Property) => (
    <Card key={property.id} className="mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        <div className="w-48 h-32 flex-shrink-0">
          <img
            src={getPrimaryImage(property)}
            alt={property.title}
            className="w-full h-full object-cover rounded-l-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-property.jpg'
            }}
          />
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{property.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.city}, {property.region}</span>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-xl font-bold text-green-600">
                {formatPrice(property.price, property.currency)}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {property.listing_type}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {property.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {property.bedrooms !== undefined && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms} beds</span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms} baths</span>
                </div>
              )}
              {property.square_feet !== undefined && (
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.square_feet} sq ft</span>
                </div>
              )}
              <span className="capitalize">{property.property_type}</span>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/properties/${property.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/properties/${property.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  // Basic structure - will add functionality incrementally
  return (
    <div className="space-y-6">
      <PropertySearchFilters onFiltersChange={handleFiltersChange} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${properties.length} of ${pagination.total} properties`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Properties</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchProperties} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {properties.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    No properties match your current search criteria. Try adjusting your filters.
                  </p>
                  <Button asChild>
                    <Link href="/admin/properties/new">
                      Add Your First Property
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {properties.map(renderPropertyCard)}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {properties.map(renderPropertyListItem)}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <PropertyPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.itemsPerPage}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  )
}
