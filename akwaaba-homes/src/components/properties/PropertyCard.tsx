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
  Verified,
  Heart
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types/index';
import { formatCurrency, formatDiasporaPrice } from '@/lib/utils/currency';
import { useCurrencyRates } from '@/lib/hooks/useCurrencyRates';
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
  const [isSaved, setIsSaved] = useState(false);
  const searchParams = useSearchParams();
  const { rates, error, isLoading } = useCurrencyRates();
  
  console.log('PropertyCard (properties/) - rates:', rates, 'error:', error, 'isLoading:', isLoading);

  // Handle save property
  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Property removed from saved' : 'Property saved successfully');
  };

  // Ensure images array exists and has valid URLs
  const validImages = property.images && Array.isArray(property.images) && property.images.length > 0 
    ? property.images.filter(img => img && typeof img === 'string' && img.trim() !== '')
    : [];
  
  // Use the first valid image or null if no images available
  const currentImage = validImages.length > 0 && validImages[currentImageIndex] 
    ? validImages[currentImageIndex] 
    : null;
  
  // Ensure currentImageIndex doesn't exceed valid images length
  const safeImageIndex = Math.min(currentImageIndex, Math.max(0, validImages.length - 1));

  // Create return URL with current search filters
  const createReturnURL = () => {
    const currentParams = searchParams.toString();
    const returnParams = currentParams ? `?return=${encodeURIComponent(`?${currentParams}`)}` : '';
    return `/properties/${property.id}${returnParams}`;
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if seller has a phone number
    if (!property.seller.phone || property.seller.phone.trim() === '') {
      // Show a toast that contact information is not available
      toast.warning('Contact information not available for this property. Please use the inquiry form or contact the agent through the property details page.');
      return;
    }
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = property.seller.phone.replace(/[\s\-\(\)]/g, '');
    
    // Open phone dialer
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
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = property.seller.phone.replace(/[\s\-\(\)]/g, '');
    
    const message = `Hi! I'm interested in the property "${property.title}" at ${property.location.address}, ${property.location.city}. I found this listing on AkwaabaHomes. Could you please provide more information?`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Format price with diaspora display using admin-configured rates
  const priceDisplay = formatDiasporaPrice(property.price, showCurrency, rates);

  // Get status badge variant
  const getStatusBadge = () => {
    switch (property.status) {
      case 'for-sale':
        return { text: 'For Sale', className: 'property-status-sale' };
      case 'for-rent':
        return { text: 'For Rent', className: 'property-status-rent' };
      case 'short-let':
        return { text: 'Short Let', className: 'property-status-short-let' };
      case 'sold':
        return { text: 'Sold', className: 'bg-muted text-muted-foreground' };
      case 'rented':
        return { text: 'Rented', className: 'bg-muted text-muted-foreground' };
      default:
        return { text: 'Available', className: 'property-status-sale' };
    }
  };

  const statusBadge = getStatusBadge();

  // Get pricing context based on property status
  const getPricingContext = () => {
    switch (property.status) {
      case 'for-rent':
        return 'per year';
      case 'short-let':
        return 'per night';
      default:
        return null;
    }
  };

  const pricingContext = getPricingContext();

  // Get tier badge
  const getTierBadge = () => {
    switch (property.tier) {
      case 'premium':
        return { text: 'Premium', className: 'bg-purple-600 text-white' };
      case 'normal':
        return null; // No badge for normal tier
      default:
        return null;
    }
  };

  const tierBadge = getTierBadge();

  if (viewMode === 'list') {
    return (
      <Card className={`property-card-shadow hover:shadow-lg transition-all duration-300 ${className} ${
        property.tier === 'premium' ? 'premium-card-glow' : ''
      }`}>
        <CardContent className="p-0">
          {/* Mobile: Compact Horizontal Layout */}
          <div className="flex md:hidden">
            {/* Image Section */}
            <Link href={createReturnURL()} className="block">
              <div className="relative w-32 h-36 flex-shrink-0 overflow-hidden">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={property.title}
                    fill
                    sizes="128px"
                    className="property-image object-cover"
                    style={{ objectPosition: 'center' }}
                    priority={currentImageIndex === 0}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <div className="text-center text-slate-600">
                      <svg className="w-4 h-4 mx-auto mb-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <p className="text-[10px]">No image</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-0.5 left-0.5">
                  <Badge className={`${statusBadge.className} text-[8px] px-1 py-0.5`}>
                    {statusBadge.text}
                  </Badge>
                </div>

                {/* Verification Badge */}
                {property.verification.isVerified && (
                  <div className="absolute bottom-0.5 right-0.5">
                    <Badge className="verification-badge text-[8px] px-1 py-0.5">
                      <Shield className="w-2 h-2" />
                    </Badge>
                  </div>
                )}
              </div>
            </Link>

            {/* Content Section */}
            <Link href={createReturnURL()} className="block flex-1 min-w-0">
              <div className="p-3 flex flex-col h-36 overflow-hidden">
                {/* Header */}
                <div className="mb-0.5">
                  <h3 className="text-xs font-semibold text-foreground hover:text-primary transition-colors mb-0.5 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-0.5">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {property.location.city}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {priceDisplay.primary}
                  </div>
                  {priceDisplay.alternatives.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {priceDisplay.alternatives[0].formatted}
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-0.5">
                  {property.specifications.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-3 w-3 mr-0.5" />
                      <span>{property.specifications.bedrooms}</span>
                    </div>
                  )}
                  {property.specifications.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-3 w-3 mr-0.5" />
                      <span>{property.specifications.bathrooms}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Square className="h-3 w-3 mr-0.5" />
                    <span className="truncate">
                      {property.specifications.size.toLocaleString()}{property.specifications.sizeUnit}
                    </span>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs">
                    <span className="text-muted-foreground">
                      by <span className="font-medium truncate">{property.seller.name}</span>
                    </span>
                    {property.seller.isVerified && (
                      <Verified className="inline w-2 h-2 ml-1 text-verified flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Actions */}
            <div className="p-2 flex flex-col justify-center space-y-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleContact} 
                className="text-xs h-6 px-2 w-8"
              >
                <Phone className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleWhatsApp} 
                className="text-xs h-6 px-2 w-8"
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Desktop: Original Layout */}
          <div className="hidden md:flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative md:w-1/3 md:max-w-80 h-64 md:h-48 flex-shrink-0">
              <Image
                src={currentImage || '/placeholder-property.jpg'}
                alt={property.title}
                fill
                className="property-image rounded-t-lg md:rounded-l-lg md:rounded-t-none object-cover"
              />
              
              {/* Image Navigation */}
              {validImages.length > 1 && (
                <div className="absolute bottom-2 left-2 flex space-x-1">
                  {validImages.slice(0, 4).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === safeImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                  {validImages.length > 4 && (
                    <span className="text-white text-xs bg-black/50 px-1 rounded">
                      +{validImages.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <Badge className={statusBadge.className}>
                  {statusBadge.text}
                </Badge>
                {tierBadge && (
                  <Badge className={tierBadge.className}>
                    <Star className="w-3 h-3 mr-1" />
                    {tierBadge.text}
                  </Badge>
                )}
              </div>


              {/* Verification Badge */}
              {property.verification.isVerified && (
                <div className="absolute bottom-2 right-2">
                  <Badge className="verification-badge text-xs px-2 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    <Link href={createReturnURL()}>
                      {property.title}
                    </Link>
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location.address}, {property.location.city}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {priceDisplay.primary}
                    {pricingContext && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {pricingContext}
                      </span>
                    )}
                  </div>
                  {priceDisplay.alternatives.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {priceDisplay.alternatives[0].formatted}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                {property.specifications.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.specifications.bedrooms} bed
                  </div>
                )}
                {property.specifications.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.specifications.bathrooms} bath
                  </div>
                )}
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {property.specifications.size.toLocaleString()} {property.specifications.sizeUnit}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {property.description}
              </p>

              {/* Seller Info & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Listed by </span>
                    <span className="font-medium">{property.seller.name}</span>
                    {property.seller.isVerified && (
                      <Verified className="inline w-3 h-3 ml-1 text-verified" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
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
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="property-image rounded-t-lg object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ objectFit: 'cover' }}
                unoptimized
                onError={(e) => {
                  console.error('Image failed to load:', currentImage);
                  // Hide the image and show fallback
                  const target = e.target as HTMLImageElement;
                  if (target) {
                    target.style.display = 'none';
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center rounded-t-lg';
                    fallbackDiv.innerHTML = `
                      <div class="text-center text-slate-600">
                        <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                        <p class="text-sm">Image unavailable</p>
                      </div>
                    `;
                    target.parentNode?.insertBefore(fallbackDiv, target);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center rounded-t-lg">
                <div className="text-center text-slate-600">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  <p className="text-sm">No image available</p>
                </div>
              </div>
            )}
            

            {/* Badges */}
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1">
              <Badge className={`${statusBadge.className} text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}>
                {statusBadge.text}
              </Badge>
              {tierBadge && (
                <Badge className={`${tierBadge.className} text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}>
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  {tierBadge.text}
                </Badge>
              )}
            </div>

            {/* Save Button */}
            {/* Removed Save Button */}

            {/* Verification Badge */}
            {property.verification.isVerified && (
              <div className="absolute bottom-2 right-2">
                <Badge className="verification-badge">
                  <Shield className="w-3 h-3" />
                </Badge>
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
                {priceDisplay.primary}
                {pricingContext && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {pricingContext}
                  </span>
                )}
              </div>
              {priceDisplay.alternatives.length > 0 && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {priceDisplay.alternatives[0].formatted}
                </div>
              )}
            </div>

            {/* Title & Location */}
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors mb-1 overflow-hidden min-h-[2.5rem] sm:min-h-[2rem] md:min-h-[1.5rem]">
              <span className="block text-foreground hover:text-primary">
                <span className="block overflow-hidden leading-tight" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {property.title}
                </span>
              </span>
            </h3>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {property.location.address}, {property.location.city}
              </span>
            </div>

            {/* Description */}
            <div className="mb-1 flex-1 min-h-[1.5rem]">
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-muted-foreground mb-3">
              {property.specifications.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  {property.specifications.bedrooms}
                </div>
              )}
              {property.specifications.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  {property.specifications.bathrooms}
                </div>
              )}
              <div className="flex items-center">
                <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {property.specifications.size.toLocaleString()} {property.specifications.sizeUnit}
                </span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="pt-2 border-t text-xs sm:text-sm text-muted-foreground mt-auto">
              <div className="flex items-center gap-1">
                <span className="flex-shrink-0">Listed by</span>
                <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                  {property.seller.name}
                </span>
                {property.seller.isVerified && (
                  <Verified className="inline w-3 h-3 ml-1 text-verified flex-shrink-0" />
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