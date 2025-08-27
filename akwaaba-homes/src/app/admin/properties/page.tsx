'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { PropertySearchFilters, PropertyFilters } from '@/components/properties/PropertySearchFilters'
import { PropertyPagination } from '@/components/properties/PropertyPagination'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import { AgentSelector } from '@/components/ui/AgentSelector'

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
  bedrooms: number
  bathrooms: number
  square_feet: number
  status: string
  created_at: string
  views_count: number
  agent_id?: string | null
  images?: Array<{
    url: string
    is_primary: boolean
  }>
}

interface PropertyListResponse {
  properties: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    propertyId: '',
    propertyTitle: '',
    isLoading: false
  })

  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentLimit = parseInt(searchParams.get('limit') || '20')

  const handleDeleteClick = (propertyId: string, propertyTitle: string) => {
    setDeleteModal({
      isOpen: true,
      propertyId,
      propertyTitle,
      isLoading: false
    })
  }

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch(`/api/properties/${deleteModal.propertyId}/soft-delete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'User requested deletion',
          permanent: false
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete property')
      }

      // Remove the property from the local state
      setProperties(prev => prev.filter(p => p.id !== deleteModal.propertyId))
      
      // Close the modal
      setDeleteModal({
        isOpen: false,
        propertyId: '',
        propertyTitle: '',
        isLoading: false
      })

      // Optionally show success message
      console.log('Property deleted successfully')

    } catch (error) {
      console.error('Error deleting property:', error)
      // Optionally show error message to user
    } finally {
      setDeleteModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      propertyId: '',
      propertyTitle: '',
      isLoading: false
    })
  }

  const handleAgentAssignment = async (propertyId: string, agentId: string | null): Promise<void> => {
    try {
      const method = agentId ? 'PATCH' : 'DELETE'
      const url = `/api/properties/${propertyId}/assign-agent`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: agentId ? JSON.stringify({ agent_id: agentId }) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update agent assignment')
      }

      // Update the property in local state
      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, agent_id: agentId }
          : p
      ))

      console.log('Agent assignment updated successfully')

    } catch (error) {
      console.error('Error updating agent assignment:', error)
      // Optionally show error message to user
    }
  }

  const fetchProperties = async (filters: PropertyFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      // Add pagination params
      params.set('page', currentPage.toString())
      params.set('limit', currentLimit.toString())
      
      // Add filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })
      
      const response = await fetch(`/api/properties?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      
      const data: PropertyListResponse = await response.json()
      setProperties(data.properties)
      setPagination(data.pagination)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filters: PropertyFilters = {
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
    
    fetchProperties(filters)
  }, [searchParams, currentPage, currentLimit])

  const handleFiltersChange = (filters: PropertyFilters) => {
    // Filters are already handled by URL updates in PropertySearchFilters
    // This function is called when filters change
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
        return 'bg-blue-100 text-blue-800'
      case 'rented':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Properties</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-sm text-gray-600">
              Manage and view all property listings
            </p>
          </div>
          <Link href="/admin/properties/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Search and Filters */}
        <PropertySearchFilters
          onFiltersChange={handleFiltersChange}
          className="mb-6"
        />

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchParams.toString() ? 'Try adjusting your search criteria.' : 'Get started by adding your first property.'}
                </p>
                {!searchParams.toString() && (
                  <Link href="/admin/properties/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Property
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Property Image */}
                  <div className="aspect-video bg-gray-200 relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images.find(img => img.is_primary)?.url || property.images[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Property Details */}
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {property.description}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.city}, {property.region}</span>
                    </div>

                    {/* Property Specs */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms || 0}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms || 0}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{property.square_feet || 0}</span>
                      </div>
                    </div>

                    {/* Agent Assignment */}
                    <div className="mb-3">
                      <label id={`agent-label-${property.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Assigned Agent
                      </label>
                      <div aria-labelledby={`agent-label-${property.id}`}>
                        <AgentSelector
                          selectedAgentId={property.agent_id}
                          onAgentSelect={(agentId) => handleAgentAssignment(property.id, agentId)}
                          placeholder="Assign agent..."
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-semibold text-green-600">
                          {formatPrice(property.price, property.currency)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(property.id, property.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                      <span>Listed {formatDate(property.created_at)}</span>
                      <span>{property.views_count} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <PropertyPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              className="mt-8"
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Property"
        description="Are you sure you want to delete this property? This action will archive the property and it will no longer be visible to users. You can restore it later if needed."
        itemName={deleteModal.propertyTitle}
        isLoading={deleteModal.isLoading}
        variant="danger"
      />
    </div>
  )
}
