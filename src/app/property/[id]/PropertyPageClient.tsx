'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bed, Bath, Square, Phone, Mail, Share2, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: string
  property_type: string
  listing_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  address: string
  city: string
  region: string
  latitude: number
  longitude: number
  features: string[]
  amenities: string[]
  status: string
  created_at: string
  updated_at: string
  agent: {
    id: string
    name: string
    company: string
    role: string
    phone: string
    bio: string
  } | null
  images: Array<{
    id: string
    image_url: string
    image_type: string
    alt_text: string
    is_primary: boolean
    order: number
  }>
}

interface PropertyPageClientProps {
  property: Property
}

export default function PropertyPageClient({ property }: PropertyPageClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleContact = () => {
    if (property.agent?.phone) {
      window.open(`tel:${property.agent.phone}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {property.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}, {property.city}, {property.region}</span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {property.images.length > 0 ? (
                  <Image
                    src={property.images[currentImageIndex]?.image_url}
                    alt={property.images[currentImageIndex]?.alt_text || property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No images available
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {property.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => handleImageChange(index)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                        index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || property.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{property.square_feet}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{property.property_type}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{property.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            {property.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Price and Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(property.price, property.currency)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {property.listing_type === 'rent' ? 'per month' : 'total price'}
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleContact}
                      className="w-full"
                      size="lg"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Agent
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleFavorite}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {isFavorite ? 'Saved' : 'Save'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Information */}
            {property.agent && (
              <Card>
                <CardHeader>
                  <CardTitle>Agent Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <h3 className="font-semibold text-gray-900">{property.agent.name}</h3>
                    <p className="text-sm text-gray-600">{property.agent.company}</p>
                    <p className="text-sm text-gray-500">{property.agent.role}</p>
                    {property.agent.bio && (
                      <p className="text-sm text-gray-700 mt-2">{property.agent.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
