'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  Shield, 
  Verified 
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types/index';
import { formatCurrency, formatDiasporaPrice } from '@/lib/utils/currency';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
  showCurrency?: CurrencyCode;
  onContact?: (property: Property) => void;
  className?: string;
}

export function PropertyCard({ 
  property, 
  viewMode = 'grid', 
  showCurrency = 'GHS',
  onContact,
  className = ''
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const searchParams = useSearchParams();

  // Ensure images array exists and has valid URLs
  const validImages = property.images && Array.isArray(property.images) && property.images.length > 0 
    ? property.images.filter(img => img && typeof img === 'string' && img.trim() !== '')
    : [];
  
  // Use a fallback image if no valid images are available
  const currentImage = validImages.length > 0 && validImages[currentImageIndex] 
    ? validImages[currentImageIndex] 
    : '/placeholder-property.svg';
  
  // Ensure currentImageIndex doesn't exceed valid images length
  const safeImageIndex = Math.min(currentImageIndex, Math.max(0, validImages.length - 1));

  // Create return URL with current search filters
  const createReturnURL = () => {
    const currentParams = searchParams.toString();
    const returnParams = currentParams ? `?return=${encodeURIComponent(`?${currentParams}`)}` : '';
    return `/property/${property.id}${returnParams}`;
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if seller has a phone number
    if (!property.seller.phone || property.seller.phone.trim() === '') {
      // Show a toast that contact information is not available
      toast.warning('Contact information not available for this property. Please use the inquiry form or contact the agent through the property details page.');
      return;
    }
    
    // Clean the phone number and open phone dialer
    const cleanPhone = property.seller.phone.replace(/[\s\-\(\)]/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if seller has a phone number
    if (!property.seller.phone || property.seller.phone.trim() === '') {
      // Show a toast that contact information is not available
      toast.warning('Contact information not available for this property. Please use the inquiry form or contact the agent through the property details page.');
      return;
    }
    
    // Clean the phone number and create WhatsApp message
    const cleanPhone = property.seller.phone.replace(/[\s\-\(\)]/g, '');
    const message = `Hi! I'm interested in the property "${property.title}" at ${property.location.address}, ${property.location.city}. I found this listing on AkwaabaHomes. Could you please provide more information?`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Format price with diaspora display
  const priceDisplay = formatDiasporaPrice(property.price, showCurrency);

  // Get status badge variant
  const getStatusBadge = () => {
    switch (property.status) {
      case 'for-sale':
        return { text: 'For Sale', className: 'property-status-sale' };
      case 'for-rent':
        return { text: 'For Rent', className: 'property-status-rent' };
      case 'short-let':
        return { text: 'Short Let', className: 'property-status-shortlet' };
      default:
        return { text: property.status, className: 'property-status-default' };
    }
  };

  // Get tier badge
  const getTierBadge = () => {
    if (property.tier === 'premium') {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
          <Star className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return null;
  };

  // List View
  if (viewMode === 'list') {
  return (
      <Card className={`property-card-shadow hover:shadow-lg transition-all duration-300 ${className} ${
        property.tier === 'premium' ? 'premium-card-glow' : ''
      }`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image Section - Clickable Link */}
            <Link href={createReturnURL()} className="block">
              <div className="relative md:w-1/3 md:max-w-80 h-64 md:h-48 flex-shrink-0 overflow-hidden">
                {currentImage ? (
            <Image
                    src={currentImage}
                    alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
                      <p className="text-sm">No Image</p>
                    </div>
            </div>
          )}
          
                {/* Image Navigation */}
                {validImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {validImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
          </div>
            </Link>

            {/* Content Section - Clickable Link */}
            <Link href={createReturnURL()} className="block flex-1">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusBadge() && (
                        <Badge variant="outline" className={getStatusBadge()?.className}>
                          {getStatusBadge()?.text}
                        </Badge>
                      )}
                      {getTierBadge()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {priceDisplay}
                    </div>
          </div>
        </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {property.description}
          </p>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.location.address}, {property.location.city}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  {property.specifications.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.specifications.bedrooms} beds</span>
                    </div>
                  )}
                  {property.specifications.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.specifications.bathrooms} baths</span>
                    </div>
                  )}
                  {property.specifications.size && (
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      <span>{property.specifications.size} sqft</span>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Listed by </span>
                    <span className="font-medium">{property.seller.name}</span>
                    {property.seller.isVerified && (
                      <Verified className="inline w-3 h-3 ml-1 text-verified" />
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Actions - Outside of Link to prevent navigation conflicts */}
            <div className="p-4 pt-0">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleContact}>
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className={`property-card-shadow hover:shadow-lg transition-all duration-300 group overflow-hidden h-full flex flex-col cursor-pointer ${className} ${
      property.tier === 'premium' ? 'premium-card-glow' : ''
    }`}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section - Clickable Link */}
        <Link href={createReturnURL()} className="block">
          <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden flex-shrink-0">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
                  <p className="text-sm">No Image</p>
                </div>
              </div>
            )}
            
            {/* Image Navigation */}
            {validImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Content Section - Clickable Link */}
        <Link href={createReturnURL()} className="block flex-1">
          <div className="p-2 sm:p-3 md:p-4 flex flex-col h-full">
            {/* Price */}
            <div className="mb-1 sm:mb-2">
              <div className="text-lg sm:text-xl font-bold text-primary">
                {priceDisplay}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2">
              <MapPin className="w-3 h-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.location.city}</span>
          </div>
          
          {/* Property Features */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600 mb-2">
              {property.specifications.bedrooms && (
                <div className="flex items-center">
                  <Bed className="w-3 h-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{property.specifications.bedrooms}</span>
                </div>
              )}
              {property.specifications.bathrooms && (
                <div className="flex items-center">
                  <Bath className="w-3 h-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{property.specifications.bathrooms}</span>
                </div>
              )}
              {property.specifications.size && (
                <div className="flex items-center">
                  <Square className="w-3 h-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{property.specifications.size}</span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="pt-2 border-t text-xs sm:text-sm text-muted-foreground mt-auto">
              <div className="flex items-center gap-1">
                <span className="flex-shrink-0">Listed by</span>
                <span className="font-medium truncate">{property.seller.name}</span>
                {property.seller.isVerified && (
                  <Verified className="w-3 h-3 sm:h-4 sm:w-4 text-verified flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Actions - Outside of Link to prevent navigation conflicts */}
        <div className="p-2 sm:p-3 md:p-4 pt-0">
          <div className="flex space-x-1 sm:space-x-2">
            <Button variant="outline" size="sm" onClick={handleContact} className="flex-1 text-xs sm:text-sm h-7 sm:h-8">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Call</span>
              <span className="sm:hidden">Call</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp} className="flex-1 text-xs sm:text-sm h-7 sm:h-8">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

