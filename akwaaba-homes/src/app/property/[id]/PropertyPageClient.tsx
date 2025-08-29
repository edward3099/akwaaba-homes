'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
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
  Mail
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types/index';
import { formatDiasporaPrice } from '@/lib/utils/currency';
import { InspectionScheduler } from '@/components/property/InspectionScheduler';

interface PropertyPageClientProps {
  property: Property;
  propertyId: string;
}

export default function PropertyPageClient({ property }: PropertyPageClientProps) {
  const [currency] = useState<CurrencyCode>('GHS');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');

  const priceDisplay = formatDiasporaPrice(property.price, currency);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
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
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to property list
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {property.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 pb-20 xl:pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Property Header Info */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {property.specifications.bedrooms} bedroom {property.type.toLowerCase()} for {property.status === 'for-sale' ? 'sale' : 'rent'}
                  </h2>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span>{property.location.address}, {property.location.city}</span>
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
                  <span>{property.specifications.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{property.specifications.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{property.specifications.size} {property.specifications.sizeUnit}</span>
                </div>
                <Badge variant="outline" className="text-xs sm:text-sm">{property.type}</Badge>
                <Badge variant={property.status === 'for-sale' ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                  {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="relative">
                <div className="relative h-64 sm:h-80 md:h-96">
                  <Image
                    src={property.images[currentImageIndex]}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 80vw"
                    className="object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all"
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} of {property.images.length}
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                <div className="p-3 sm:p-4 border-t">
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-primary' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
                    Click main picture to view in fullscreen
                  </p>
                </div>
              </div>
            </div>

            {/* Property Actions */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border text-center">
              <p className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Interested in this property?</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button 
                  className="flex-1 sm:flex-none text-sm sm:text-base" 
                  size="sm"
                  onClick={() => {
                    // Open phone dialer
                    window.open(`tel:${property.seller.phone}`, '_self');
                  }}
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Call Now
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none text-sm sm:text-base" 
                  size="sm"
                  onClick={() => {
                    // Open WhatsApp with pre-filled message
                    const message = `Hi, I'm interested in ${property.title} at ${property.location.address}, ${property.location.city}. Can you provide more details?`;
                    const whatsappUrl = `https://wa.me/${property.seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none text-sm sm:text-base" 
                  size="sm"
                  onClick={() => {
                    if (!property.seller.email) {
                      // If no email, open WhatsApp instead
                      const message = `Hi, I'm interested in ${property.title} at ${property.location.address}, ${property.location.city}. Can you provide more details?`;
                      const whatsappUrl = `https://wa.me/${property.seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    } else {
                      // Open email client with pre-filled subject and body
                      const subject = `Inquiry about ${property.title}`;
                      const body = `Hi,\n\nI'm interested in ${property.title} at ${property.location.address}, ${property.location.city}.\n\nCan you provide more details about this property?\n\nThank you.`;
                      const mailtoUrl = `mailto:${property.seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailtoUrl, '_self');
                    }
                  }}
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {property.seller.email ? 'Email' : 'WhatsApp'}
                </Button>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg border">
              <div className="border-b">
                <div className="flex justify-center sm:justify-start overflow-x-auto px-4 sm:px-6 py-2">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors mx-1 sm:mx-2 whitespace-nowrap ${
                      activeTab === 'details'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors mx-1 sm:mx-2 whitespace-nowrap ${
                      activeTab === 'map'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Map className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    View on Map
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`px-4 py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors mx-1 sm:mx-2 whitespace-nowrap ${
                      activeTab === 'report'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Flag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    Report
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Property Description</h3>
                    <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                      {property.description}
                    </p>

                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Property Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Property Ref:</div>
                        <div className="font-medium text-sm sm:text-base">{property.id}</div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Type:</div>
                        <div className="font-medium text-sm sm:text-base">{property.type}</div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Bedrooms:</div>
                        <div className="font-medium text-sm sm:text-base">{property.specifications.bedrooms}</div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Bathrooms:</div>
                        <div className="font-medium text-sm sm:text-base">{property.specifications.bathrooms}</div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Size:</div>
                        <div className="font-medium text-sm sm:text-base">{property.specifications.size} {property.specifications.sizeUnit}</div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Year Built:</div>
                        <div className="font-medium text-sm sm:text-base">{property.specifications.yearBuilt}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'area-guide' && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About {property.location.city}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                      {property.location.city} is a vibrant area known for its excellent amenities, 
                      convenient transportation, and thriving community. This location offers the perfect 
                      balance of urban convenience and residential tranquility.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          Popular Estates
                        </h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          The area features several prestigious estates and gated communities 
                          offering residents amenities that are both stylish and convenient.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          Lifestyle
                        </h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Residents enjoy access to shopping centers, restaurants, schools, 
                          and recreational facilities, making it an ideal place to call home.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'map' && (
                  <div className="h-full">
                    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Location on Map</h3>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">Property Location</h4>
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium">{property.location.address}</p>
                              <p>{property.location.city}, {property.location.region}</p>
                              <p className="text-gray-600">{property.location.country}</p>
                            </div>
                          </div>
                        </div>
                        
                        {property.location.coordinates ? (
                          <div className="bg-white p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">View on Map</h4>
                            <p className="text-gray-700 text-sm mb-3">
                              Click the button below to view this property&apos;s exact location on Google Maps.
                            </p>
                            <Button 
                              variant="outline" 
                              className="text-sm" 
                              onClick={() => {
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${property.location.coordinates.lat},${property.location.coordinates.lng}`;
                                window.open(googleMapsUrl, '_blank');
                              }}
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              View on Google Maps
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Location Search</h4>
                            <p className="text-gray-700 text-sm mb-3">
                              Search for this property&apos;s location on Google Maps using the address.
                            </p>
                            <Button 
                              variant="outline" 
                              className="text-sm" 
                              onClick={() => {
                                const searchQuery = `${property.location.address}, ${property.location.city}, ${property.location.region}, ${property.location.country}`;
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
                                window.open(googleMapsUrl, '_blank');
                              }}
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Search on Google Maps
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Report Property</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      If you believe this property listing is inappropriate or violates our terms of service, please let us know.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full text-sm sm:text-base" 
                      size="sm"
                      onClick={() => {
                        // Open report form or redirect to report page
                        const reportUrl = `/report-property?propertyId=${property.id}&propertyTitle=${encodeURIComponent(property.title)}`;
                        window.open(reportUrl, '_blank');
                      }}
                    >
                      <Flag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Report Property
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Share this property</p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Check out this property: ${property.title}`)}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this property: ${property.title}`)}&url=${encodeURIComponent(window.location.href)}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    const message = `Check out this property: ${property.title}\n\n${property.location.address}, ${property.location.city}\n\nView it here: ${window.location.href}`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Now properly responsive with better spacing */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6 xl:space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg border p-4 sm:p-6 xl:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Marketed by</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <button 
                    onClick={() => {
                      // Navigate to agent profile with a smooth transition
                      const agentUrl = `/agent/${property.seller.id}`;
                      window.location.href = agentUrl;
                    }}
                    className="group w-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 -m-2"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <Building className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors">{property.seller.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-primary/70 transition-colors">{property.seller.type}</p>
                    <p className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View Profile →</p>
                  </button>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700">{property.location.city}, Ghana</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700">{property.seller.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700">{property.seller.phone}</span>
                  </div>
                </div>

                <Button 
                  className="w-full text-sm sm:text-base" 
                  size="sm"
                  onClick={() => setShowInspectionForm(true)}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Schedule Inspection
                </Button>
              </div>
            </div>

            {/* Diaspora Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 xl:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-blue-900">Diaspora Support</h3>
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>24/7 Support Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Virtual Inspection Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Verified Property Listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {showInspectionForm && (
        <InspectionScheduler
          property={property}
          onClose={() => setShowInspectionForm(false)}
        />
      )}

      {/* Sticky Bottom Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 xl:hidden">
        <div className="flex gap-2 p-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={() => {
              // Open WhatsApp with pre-filled message
              const message = `Hi, I'm interested in ${property.title} at ${property.location.address}, ${property.location.city}. Can you provide more details?`;
              const whatsappUrl = `https://wa.me/${property.seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            size="lg"
            onClick={() => {
              // Open phone dialer
              window.open(`tel:${property.seller.phone}`, '_self');
            }}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
        </div>
      </div>
    </div>
  );
}
