'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  MessageCircle, 
  Car, 
  MapPin, 
  Calendar, 
  Bed, 
  Bath, 
  Square, 
  Wifi,
  Zap,
  Droplets,
  Trees,
  Camera,
  Video,
  Eye,
  Home,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';
import { formatDiasporaPrice } from '@/lib/utils/currency';
import { InspectionScheduler } from '@/components/property/InspectionScheduler';

interface PropertyPageClientProps {
  property: Property;
  propertyId: string;
}

export default function PropertyPageClient({ property, propertyId }: PropertyPageClientProps) {
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  const priceDisplay = formatDiasporaPrice(property.price, currency);

  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };

  const amenityIcons = {
    'Air Conditioning': Zap,
    'Swimming Pool': Droplets,
    'Garden': Trees,
    'Parking': Car,
    'WiFi': Wifi,
    'Security': Shield
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image Section */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleSaved}
            className={`backdrop-blur-sm ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90'}`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="secondary" size="icon" className="backdrop-blur-sm bg-white/90">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Virtual Tour Badge */}
        {property.diasporaFeatures?.virtualTourAvailable && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="backdrop-blur-sm bg-blue-600 text-white">
              <Video className="w-3 h-3 mr-1" />
              Virtual Tour Available
            </Badge>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.location.address}, {property.location.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {priceDisplay.primary}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {priceDisplay.alternatives.map(alt => alt.formatted).join(' • ')}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.specifications.bedrooms} beds</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.specifications.bathrooms} baths</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  <span>{property.specifications.size} {property.specifications.sizeUnit}</span>
                </div>
                <Badge variant="outline">
                  {property.type}
                </Badge>
                <Badge variant={property.status === 'for-sale' ? 'default' : 'secondary'}>
                  {property.status}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Diaspora Services */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Diaspora Services</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Virtual Property Inspection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Family Representative Contact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Multi-Currency Pricing</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Legal Documentation Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Remote Transaction Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Property Management Services</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Home;
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Property Images Grid */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Property Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.slice(1, 7).map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Property view ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                {property.images.length > 7 && (
                  <Button variant="outline" className="w-full mt-4">
                    <Camera className="w-4 h-4 mr-2" />
                    View All {property.images.length} Photos
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
                
                <div className="space-y-3 mb-6">
                  <Button className="w-full" size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>

                <hr className="my-4" />

                {/* Family Representative */}
                <div className="text-sm text-muted-foreground mb-4">
                  <p className="font-medium text-foreground mb-2">Family Representative in Ghana</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{property.diasporaFeatures?.familyRepresentativeContact}</span>
                  </div>
                </div>

                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setShowInspectionForm(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Inspection
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{property.specifications.size} {property.specifications.sizeUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year Built</span>
                    <span className="font-medium">{property.specifications.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={property.status === 'for-sale' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diaspora Support */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Diaspora Support</h3>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>24/7 Support Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>Virtual Inspection Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified Property Listings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}
