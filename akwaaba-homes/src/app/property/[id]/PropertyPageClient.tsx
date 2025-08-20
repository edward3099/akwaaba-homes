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
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  CheckCircle2,
  Car,
  Wifi,
  Zap,
  Droplets,
  Trees,
  Camera,
  ShieldCheck,
  Eye,
  Clock,
  AlertTriangle,
  Star
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';
import { formatDiasporaPrice } from '@/lib/utils/currency';

interface PropertyPageClientProps {
  property: Property;
}

export function PropertyPageClient({ property }: PropertyPageClientProps) {
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const priceDisplay = formatDiasporaPrice(property.price, currency);

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Property Image Gallery */}
      <PropertyImageGallery images={property.images} title={property.title} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location.address}, {property.location.city}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSave}
                    className={isSaved ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Price and Key Details */}
              <div className="flex flex-wrap items-center gap-4 p-6 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-3xl font-bold text-ghana-gold">
                    {priceDisplay.primary}
                  </div>
                  {priceDisplay.alternatives && priceDisplay.alternatives.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      ≈ {priceDisplay.alternatives[0].formatted}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-6 text-muted-foreground">
                  {property.specifications.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span className="text-sm">{property.specifications.bedrooms} bed</span>
                    </div>
                  )}
                  {property.specifications.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span className="text-sm">{property.specifications.bathrooms} bath</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    <span className="text-sm">
                      {property.specifications.size.toLocaleString()} {property.specifications.sizeUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="bg-ghana-red text-white">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="border-ghana-green text-ghana-green">
                  {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                </Badge>
                {property.verification?.isVerified && (
                  <Badge variant="outline" className="border-verified text-verified">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  <Camera className="w-3 h-3 mr-1" />
                  Virtual Tour
                </Badge>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-verified flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Special Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-ghana-gold" />
                  Special Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Virtual Tour Available</h4>
                    <p className="text-sm text-blue-700">
                      Explore this property from anywhere in the world with our 360° virtual tour.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Local Representative</h4>
                    <p className="text-sm text-green-700">
                      Local contact available for inspections and coordination.
                    </p>
                    <p className="text-sm font-medium text-green-800 mt-1">
                      +233 244 987 654
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyMap 
                  coordinates={property.location.coordinates}
                  address={property.location.address}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full btn-ghana"
                  onClick={() => setShowContactForm(true)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowInspectionForm(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Inspection
                </Button>
                
                <div className="text-xs text-center text-muted-foreground pt-2">
                  Response time: Usually within 2 hours
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">
                    {property.specifications.size.toLocaleString()} {property.specifications.sizeUnit}
                  </span>
                </div>
                {property.specifications.bedrooms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bedrooms</span>
                    <span className="font-medium">{property.specifications.bedrooms}</span>
                  </div>
                )}
                {property.specifications.bathrooms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bathrooms</span>
                    <span className="font-medium">{property.specifications.bathrooms}</span>
                  </div>
                )}
                {property.specifications.parkingSpaces && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parking</span>
                    <span className="font-medium">{property.specifications.parkingSpaces} spaces</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Listed By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="font-medium">{property.seller.name}</div>
                  <div className="text-sm text-muted-foreground">{property.seller.company || (property.seller.type === 'agent' ? 'Real Estate Agent' : 'Property Owner')}</div>
                  <div className="flex items-center justify-center gap-1 text-ghana-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      (4.8)
                    </span>
                  </div>
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
