'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReturnToSearch } from '@/components/navigation/ReturnToSearch';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Shield, 
  Clock, 
  Eye, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  Star,
  FileText,
  Map,
  Flag,
  Share2,
  Mail,
  ChevronLeft
} from 'lucide-react';
import { CurrencyCode } from '@/lib/types/index';
import { formatDiasporaPrice } from '@/lib/utils/currency';
import { useLoadingState } from '@/lib/utils/loadingStates';
import { propertiesApi } from '@/lib/api/client';
import PropertyStickyBar from '@/components/property/PropertyStickyBar';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  square_feet?: number;
  address: string;
  city: string;
  region: string;
  created_at: string;
  features?: string[];
  amenities?: string[];
  image_urls?: string[];
  users?: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    user_type: string;
    is_verified: boolean;
  };
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    alt_text: string;
  }>;
}

interface PropertyDetailProps {
  propertyId: string;
}

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [currency] = useState<CurrencyCode>('GHS');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const loadingState = useLoadingState();

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      loadingState.setLoading(true);
      const response = await propertiesApi.getById(propertyId);
      
      if (response.success && response.data) {
        // Type assertion for the API response - safely access the property
        const propertyData = response.data as { property?: Property };
        if (propertyData && propertyData.property) {
          setProperty(propertyData.property);
        } else {
          console.error('Property not found in response data');
        }
      } else {
        console.error('Failed to fetch property:', response.error);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      loadingState.setLoading(false);
    }
  };

  if (loadingState.isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const priceDisplay = formatDiasporaPrice(property.price, currency);
  
  // Get images from property_images or image_urls
  const images = property.property_images?.map(img => img.image_url) || property.image_urls || [];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <ReturnToSearch 
              className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {property.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Property Header Info */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {property.bedrooms || 0} bedroom {property.property_type.toLowerCase()} for {property.status === 'active' ? 'sale' : 'rent'}
                  </h2>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {priceDisplay.primary}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {priceDisplay.alternatives.map(alt => alt.formatted).join(' • ')}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm border-t pt-4">
                <div className="flex items-center gap-1">
                  <Bed className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{property.bedrooms || 0} Bedrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{property.bathrooms || 0} Bathrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{property.square_feet ? property.square_feet.toLocaleString() : 'N/A'} sqft</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="capitalize">{property.property_type}</span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96">
                <Image
                  src={images[currentImageIndex] || '/placeholder-property.svg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image || '/placeholder-property.svg'}
                          alt={`${property.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details Tabs */}
            <div className="bg-white rounded-lg border">
              <div className="border-b">
                <div className="flex">
                  {['details', 'features', 'location'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{property.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Property Type</span>
                          <span className="font-medium capitalize">{property.property_type}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Listing Type</span>
                          <span className="font-medium capitalize">{property.status}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Bedrooms</span>
                          <span className="font-medium">{property.bedrooms || 0}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Bathrooms</span>
                          <span className="font-medium">{property.bathrooms || 0}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Size</span>
                          <span className="font-medium">{property.square_feet ? property.square_feet.toLocaleString() : 'N/A'} sqft</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Listed</span>
                          <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.features && property.features.length > 0 ? (
                          property.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {feature}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No features listed</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities && property.amenities.length > 0 ? (
                          property.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {amenity}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No amenities listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span>{property.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-600" />
                          <span>{property.city}, {property.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-gray-600" />
                          <span>Ghana</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Agent</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {property.users?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{property.users?.full_name || 'Agent'}</p>
                    <p className="text-sm text-gray-500 capitalize">{property.users?.user_type || 'agent'}</p>
                  </div>
                </div>

                {property.users?.is_verified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Agent</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => window.open(`tel:${property.users?.phone || ''}`, '_self')}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => {
                    const message = `Hi, I'm interested in this property: ${property.title}`;
                    const whatsappUrl = `https://wa.me/${property.users?.phone || ''}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>

            {/* Property Summary */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-primary">{priceDisplay.primary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="property-status-sale">
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {property && (
        <PropertyStickyBar 
          property={{
            id: property.id,
            title: property.title,
            description: property.description,
            price: property.price,
            currency: 'GHS' as const,
            status: property.status as "sold" | "for-sale" | "for-rent" | "short-let" | "rented",
            type: property.property_type,
            location: {
              address: property.address,
              city: property.city,
              region: property.region,
              country: 'Ghana',
              coordinates: {
                lat: 0,
                lng: 0
              }
            },
            specifications: {
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              size: property.square_feet || 0,
              sizeUnit: 'sqft' as const
            },
            images: images,
            features: property.features || [],
            amenities: property.amenities || [],
            seller: {
              id: property.users?.id || '',
              name: property.users?.full_name || 'Agent',
              type: property.users?.user_type || 'agent',
              phone: property.users?.phone || '',
              email: property.users?.email || '',
              isVerified: property.users?.is_verified || false
            },
            verification: {
              isVerified: property.users?.is_verified || false,
              documentsUploaded: false,
              verificationDate: property.created_at
            },
            createdAt: property.created_at,
            updatedAt: property.created_at,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            tier: 'normal' as const,
            diasporaFeatures: {
              multiCurrencyDisplay: true,
              inspectionScheduling: true,
              virtualTourAvailable: false,
              familyRepresentativeContact: property.users?.phone || ''
            }
          }}
        />
      )}
    </div>
  );
}
