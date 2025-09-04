'use client'

import React from 'react'

// Temporary simplified version to test Vercel deployment
export default function AdminPropertiesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Properties</h1>
      <p>This page is temporarily simplified to test Vercel deployment.</p>
    </div>
  )
}

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
  })

  // View property modal state
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    property: null as Property | null,
  })

  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentLimit = parseInt(searchParams.get('limit') || '20')

  // API mutation hooks
  const fetchPropertiesMutation = useApiMutation({
    successMessage: 'Properties loaded successfully',
    errorMessage: 'Failed to load properties',
    loadingMessage: 'Loading properties...',
    onSuccess: (data: PropertyListResponse) => {
      setProperties(data.properties)
      setPagination({
        page: currentPage,
        limit: currentLimit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      })
    }
  });

  const deletePropertyMutation = useDestructiveMutation({
    successMessage: 'Property archived successfully',
    errorMessage: 'Failed to archive property',
    loadingMessage: 'Archiving property...',
    confirmationMessage: 'Are you sure you want to archive this property? This action cannot be undone.',
    confirmationTitle: 'Archive Property',
    onSuccess: () => {
      // Remove the property from the local state
      setProperties(prev => prev.filter(p => p.id !== deleteModal.propertyId))
      
      // Close the modal
      setDeleteModal({
        isOpen: false,
        propertyId: '',
        propertyTitle: '',
      })
    }
  });

  const agentAssignmentMutation = useApiMutation({
    successMessage: 'Agent assignment updated successfully',
    errorMessage: 'Failed to update agent assignment',
    loadingMessage: 'Updating agent assignment...',
    onSuccess: (data: any) => {
      // Update the property in local state
      setProperties(prev => prev.map(p => 
        p.id === deleteModal.propertyId 
          ? { ...p, agent_id: data.agent_id }
          : p
      ))
    }
  });

  const handleDeleteClick = (propertyId: string, propertyTitle: string) => {
    setDeleteModal({
      isOpen: true,
      propertyId,
      propertyTitle,
    })
  }

  const handleViewClick = (property: Property) => {
    setViewModal({
      isOpen: true,
      property,
    })
  }

  const handleDeleteConfirm = async () => {
    await deletePropertyMutation.executeWithConfirmation(async () => {
      const response = await fetch(`/api/admin/properties/${deleteModal.propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to archive property')
      }

      return await response.json()
    })
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      propertyId: '',
      propertyTitle: '',
    })
  }

  const handleViewClose = () => {
    setViewModal({
      isOpen: false,
      property: null,
    })
  }

  const handleAgentAssignment = async (propertyId: string, agentId: string | null): Promise<void> => {
    await agentAssignmentMutation.mutate(async () => {
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

      const result = await response.json()
      
      // Update the property in local state
      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, agent_id: agentId }
          : p
      ))
      
      return result
    })
  }

  const fetchProperties = async (filters: PropertyFilters) => {
    await fetchPropertiesMutation.mutate(async () => {
      const params = new URLSearchParams()
      
      // Add pagination params
      params.set('limit', currentLimit.toString())
      params.set('offset', ((currentPage - 1) * currentLimit).toString())
      
      // Add filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })
      
      const response = await fetch(`/api/admin/properties?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      
      return await response.json()
    })
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

  // Loading state
  if (fetchPropertiesMutation.isLoading && properties.length === 0) {
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

  // Error state
  if (fetchPropertiesMutation.error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Properties</h3>
              <p className="text-gray-600 mb-4">{fetchPropertiesMutation.error.message}</p>
              <Button 
                onClick={() => {
                  fetchPropertiesMutation.reset()
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
                }}
                className="bg-ghana-green hover:bg-ghana-green-dark text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
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
                          disabled={fetchPropertiesMutation.isLoading}
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewClick(property)}
                        >
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
        title="Archive Property"
        description="Are you sure you want to archive this property? This action will hide the property from public view but preserve all data. You can restore it later if needed."
        itemName={deleteModal.propertyTitle}
        isLoading={deletePropertyMutation.isLoading}
        variant="warning"
      />

      {/* Property View Modal */}
      <Dialog open={viewModal.isOpen} onOpenChange={handleViewClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>
              View detailed information about this property including location, pricing, and specifications.
            </DialogDescription>
          </DialogHeader>
          {viewModal.property && (
            <div className="space-y-6">
              {/* Property Image */}
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {viewModal.property.images && viewModal.property.images.length > 0 ? (
                  <img
                    src={viewModal.property.images.find(img => img.is_primary)?.url || viewModal.property.images[0].url}
                    alt={viewModal.property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Property Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {viewModal.property.title}
                  </h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{viewModal.property.address}, {viewModal.property.city}, {viewModal.property.region}</span>
                  </div>
                  <Badge className={getStatusColor(viewModal.property.status)}>
                    {viewModal.property.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(viewModal.property.price, viewModal.property.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {viewModal.property.listing_type}
                  </div>
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="ml-2 text-sm font-medium">{viewModal.property.property_type}</span>
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Bedrooms:</span>
                      <span className="ml-2 text-sm font-medium">{viewModal.property.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Bathrooms:</span>
                      <span className="ml-2 text-sm font-medium">{viewModal.property.bathrooms || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Square Feet:</span>
                      <span className="ml-2 text-sm font-medium">{viewModal.property.square_feet || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Property ID:</span>
                      <span className="ml-2 text-sm font-mono text-gray-500">{viewModal.property.id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Listed:</span>
                      <span className="ml-2 text-sm font-medium">{formatDate(viewModal.property.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Views:</span>
                      <span className="ml-2 text-sm font-medium">{viewModal.property.views_count}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Agent ID:</span>
                      <span className="ml-2 text-sm font-mono text-gray-500">
                        {viewModal.property.agent_id || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {viewModal.property.description}
                </p>
              </div>

              {/* Images Gallery */}
              {viewModal.property.images && viewModal.property.images.length > 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewModal.property.images
                      .filter(img => !img.is_primary)
                      .map((image, index) => (
                        <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={`${viewModal.property.title} - Image ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
