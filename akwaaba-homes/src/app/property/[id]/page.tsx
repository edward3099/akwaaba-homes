'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyImageGallery } from '@/components/property/PropertyImageGallery';
import { PropertyMap } from '@/components/property/PropertyMap';
import { ContactSellerForm } from '@/components/property/ContactSellerForm';
import { InspectionScheduler } from '@/components/property/InspectionScheduler';
import { formatDate } from '@/lib/utils/dates';
import { 
  ArrowLeft,
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Shield,
  Star,
  Verified,
  Car,
  Wifi,
  Zap,
  Droplets,
  Trees,
  Camera,
  Video,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';
import { formatDiasporaPrice } from '@/lib/utils/currency';

// Mock property data - in production this would be fetched based on the ID
const mockProperty: Property = {
  id: '1',
  title: 'Luxury 4-Bedroom Villa in East Legon',
  description: 'Stunning modern villa with panoramic city views, private pool, and premium finishes throughout. This exceptional property features contemporary architecture with traditional Ghanaian touches, making it perfect for both local and diaspora buyers seeking luxury living in Accra\'s most prestigious neighborhood.',
  price: 850000,
  currency: 'GHS',
  status: 'for-sale',
  type: 'house',
  location: {
    address: '123 East Legon Hills, Plot 45',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    coordinates: { lat: 5.6037, lng: -0.1870 },
    plusCode: '6CQXJ237+8G'
  },
  specifications: {
    bedrooms: 4,
    bathrooms: 3,
    size: 3200,
    sizeUnit: 'sqft',
    lotSize: 5000,
    lotSizeUnit: 'sqft',
    yearBuilt: 2023,
    parkingSpaces: 2,
  },
  images: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
  videos: ['https://example.com/virtual-tour-video.mp4'],
  virtualTour: 'https://example.com/360-tour',
  features: [
    'Swimming Pool',
    'Private Garden',
    'Security System',
    'Covered Parking',
    'Modern Kitchen',
    'Master Suite',
    'Guest Quarters',
    'Rooftop Terrace'
  ],
  amenities: [
    '24/7 Security',
    'Backup Generator',
    'Borehole Water',
    'CCTV Surveillance',
    'Landscaped Garden',
    'High-Speed Internet Ready',
    'Solar Panel Ready',
    'Servant Quarters'
  ],
  seller: {
    id: 'seller1',
    name: 'Kwame Asante',
    type: 'agent',
    phone: '+233244123456',
    whatsapp: '+233244123456',
    email: 'kwame@premiumestates.com.gh',
    isVerified: true,
    company: 'Premium Estates Ghana',
    licenseNumber: 'REA-GH-2024-001'
  },
  verification: {
    isVerified: true,
    documentsUploaded: true,
    verificationDate: '2024-01-15',
    adminNotes: 'All documents verified. Property inspected on 2024-01-12.'
  },
  createdAt: '2024-01-10',
  updatedAt: '2024-01-15',
  expiresAt: '2024-02-10',
  tier: 'premium',
  diasporaFeatures: {
    multiCurrencyDisplay: true,
    inspectionScheduling: true,
    virtualTourAvailable: true,
    familyRepresentativeContact: '+233244987654'
  }
};

interface PropertyPageProps {
  params: { id: string };
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  // In production, fetch property data based on params.id
  const property = mockProperty;
  const priceDisplay = formatDiasporaPrice(property.price, currency);

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in this property: ${property.title} - ${priceDisplay.primary}. Property ID: ${property.id}`;
    const whatsappUrl = `https://wa.me/${property.seller.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${property.seller.phone}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <PropertyImageGallery images={property.images} title={property.title} />

            {/* Property Header */}
            <div className="space-y-6">
              {/* Status & Tier Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="property-status-sale">
                  For Sale
                </Badge>
                {property.tier === 'premium' && (
                  <Badge className="bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium Listing
                  </Badge>
                )}
                {property.verification.isVerified && (
                  <Badge className="verification-badge">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {property.diasporaFeatures?.virtualTourAvailable && (
                  <Badge variant="outline" className="border-primary text-primary">
                    <Video className="w-3 h-3 mr-1" />
                    Virtual Tour
                  </Badge>
                )}
              </div>

              {/* Title & Location */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{property.location.address}, {property.location.city}</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-muted/50 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      {priceDisplay.primary}
                    </div>
                    {priceDisplay.alternatives.length > 0 && (
                      <div className="space-y-1">
                        {priceDisplay.alternatives.map((alt) => (
                          <div key={alt.currency} className="text-muted-foreground">
                            {alt.formatted}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border text-center">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{property.specifications.bedrooms}</div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="bg-white rounded-lg p-4 border text-center">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{property.specifications.bathrooms}</div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
                <div className="bg-white rounded-lg p-4 border text-center">
                  <Square className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{property.specifications.size.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{property.specifications.sizeUnit}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border text-center">
                  <Car className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{property.specifications.parkingSpaces}</div>
                  <div className="text-sm text-muted-foreground">Parking</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Property Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Property Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {property.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-verified" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location & Neighborhood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyMap 
                  coordinates={property.location.coordinates}
                  address={property.location.address}
                />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    <strong>Plus Code:</strong> {property.location.plusCode}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <strong>Region:</strong> {property.location.region}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleCall}
                    className="w-full btn-ghana flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </Button>
                  <Button 
                    onClick={handleWhatsApp}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => setShowContactForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Verified className="w-5 h-5 text-verified" />
                  Listed By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {property.seller.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{property.seller.name}</div>
                      <div className="text-sm text-muted-foreground">{property.seller.company}</div>
                    </div>
                  </div>
                  
                  {property.seller.isVerified && (
                    <div className="flex items-center gap-2 text-sm text-verified">
                      <Shield className="w-4 h-4" />
                      <span>Verified Agent</span>
                    </div>
                  )}
                  
                  {property.seller.licenseNumber && (
                    <div className="text-xs text-muted-foreground">
                      License: {property.seller.licenseNumber}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Diaspora Services */}
            {property.diasporaFeatures && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Diaspora Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.diasporaFeatures.virtualTourAvailable && (
                    <Button 
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => window.open(property.virtualTour, '_blank')}
                    >
                      <Video className="w-4 h-4" />
                      Virtual Tour
                    </Button>
                  )}
                  
                  {property.diasporaFeatures.inspectionScheduling && (
                    <Button 
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => setShowInspectionForm(true)}
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Inspection
                    </Button>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    <strong>Family Representative:</strong> Available for property inspection assistance
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property ID</span>
                  <span className="font-mono">{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year Built</span>
                  <span>{property.specifications.yearBuilt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lot Size</span>
                  <span>{property.specifications.lotSize?.toLocaleString()} {property.specifications.lotSizeUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span>{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDate(property.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactSellerForm
          property={property}
          onClose={() => setShowContactForm(false)}
        />
      )}

      {/* Inspection Scheduler Modal */}
      {showInspectionForm && (
        <InspectionScheduler
          property={property}
          onClose={() => setShowInspectionForm(false)}
        />
      )}
    </div>
  );
}
