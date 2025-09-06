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
  Home,
  User
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
  const searchParams = useSearchParams();
  const { rates, error, isLoading } = useCurrencyRates();
  
  console.log('PropertyCard (properties/) - rates:', rates, 'error:', error, 'isLoading:', isLoading);

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
      <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden ${className} ${
        property.tier === 'premium' ? 'premium-card-glow' : ''
      }`}>
        <CardContent className="p-0">
          <div className="flex flex-row h-full">
            {/* Image Section - Clickable Link */}
            <Link href={createReturnURL()} className="block group-hover:opacity-95 transition-opacity duration-300">
              <div className="relative w-32 md:w-64 lg:w-72 h-full flex-shrink-0 overflow-hidden rounded-l-lg">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={property.title}
                    fill
                    sizes="(max-width: 1280px) 100vw, 448px"
                    className="property-image object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
                    priority={currentImageIndex === 0}
                    unoptimized
                    onError={(e) => {
                      console.error('Image failed to load:', currentImage);
                      // Hide the image and show fallback
                      const target = e.target as HTMLImageElement;
                      if (target) {
                        target.style.display = 'none';
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center';
                        fallbackDiv.innerHTML = `
                          <div class="text-center text-slate-500">
                            <div class="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                            </div>
                            <p class="text-sm font-medium">Image unavailable</p>
                          </div>
                        `;
                        target.parentNode?.insertBefore(fallbackDiv, target);
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-l-lg">
                    <div className="text-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Home className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-medium">No image available</p>
                    </div>
                  </div>
                )}
                
                {/* Image Navigation - Only show if there are multiple valid images */}
                {validImages.length > 1 && (
                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    {validImages.slice(0, 4).map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          index === safeImageIndex ? 'bg-white shadow-lg' : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                    {validImages.length > 4 && (
                      <span className="text-white text-xs bg-black/60 px-2 py-1 rounded-full font-medium">
                        +{validImages.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${statusBadge.className} text-xs px-4 py-2 font-semibold shadow-lg`}>
                    {statusBadge.text}
                  </Badge>
                </div>

                {/* Premium Badge */}
                  {tierBadge && (
                  <div className="absolute top-4 right-4">
                    <Badge className={`${tierBadge.className} text-xs px-4 py-2 font-semibold shadow-lg`}>
                      <Star className="w-3 h-3 mr-1" />
                      {tierBadge.text}
                    </Badge>
                  </div>
                  )}

                {/* Verification Badge */}
                {property.verification.isVerified && (
                  <div className="absolute bottom-4 right-4">
                    <Badge className="verification-badge shadow-lg">
                      <Shield className="w-3 h-3" />
                    </Badge>
                  </div>
                )}
              </div>
            </Link>

            {/* Content Section */}
            <div className="flex-1 flex flex-col">
              {/* Main Content - Clickable Link */}
            <Link href={createReturnURL()} className="block flex-1">
                <div className="p-2 md:p-4 flex-1 flex flex-col">
                  {/* Header with Title and Price */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div className="flex-1 mb-2 lg:mb-0 lg:mr-4">
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1 line-clamp-2 leading-tight">
                      {property.title}
                    </h3>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-gray-400" />
                        <span className="text-xs md:text-sm font-medium">{property.location.address}, {property.location.city}</span>
                      </div>
                  </div>
                  
                    <div className="text-left sm:text-right">
                      <div className="text-sm md:text-xl font-bold text-gray-900 mb-1">
                      {priceDisplay.primary}
                      {pricingContext && (
                          <span className="text-sm font-normal text-gray-500 ml-1">
                          {pricingContext}
                        </span>
                      )}
                    </div>
                    {priceDisplay.alternatives.length > 0 && (
                        <div className="text-sm text-gray-600 font-medium">
                        {priceDisplay.alternatives[0].formatted}
                      </div>
                    )}
                  </div>
                </div>

                  {/* Property Specifications */}
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {property.specifications.bedrooms && property.specifications.bedrooms > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        <Bed className="w-3 h-3" /> {property.specifications.bedrooms}
                      </Badge>
                    )}
                    {property.specifications.bathrooms && property.specifications.bathrooms > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 text-xs">
                        <Bath className="w-3 h-3" /> {property.specifications.bathrooms}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      <Square className="w-3 h-3" /> {property.specifications.size.toLocaleString()} {property.specifications.sizeUnit}
                    </Badge>
                  </div>

                {/* Seller Info */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <User className="w-3 h-3" />
                    <span>Listed by {property.seller.name}</span>
                    {property.seller.isVerified && (
                      <Verified className="w-3 h-3 text-green-500" />
                    )}
                </div>
              </div>
            </Link>

            {/* Actions - Outside of Link to prevent navigation conflicts */}
              <div className="px-2 md:px-4 pb-2 md:pb-4">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleContact}
                    className="flex-1 hover:bg-primary hover:text-white transition-colors text-xs h-7"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                  <Button 
                    size="sm"
                    onClick={handleWhatsApp}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
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
            
            {/* Image Navigation - Only show if there are multiple valid images */}
            {validImages.length > 1 && (
              <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex space-x-1">
                {validImages.slice(0, 4).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                      index === safeImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
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
            <div className="mb-3 flex-1 min-h-[2.5rem]">
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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