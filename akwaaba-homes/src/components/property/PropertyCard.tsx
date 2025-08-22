'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Phone, 
  MessageCircle,
  Shield,
  Calendar,
  TrendingDown,
  Star,
  Verified
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';
import { formatCurrency, formatDiasporaPrice } from '@/lib/utils/currency';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
  showCurrency?: CurrencyCode;
  onSave?: (propertyId: string) => void;
  onContact?: (property: Property) => void;
  className?: string;
}

export function PropertyCard({ 
  property, 
  viewMode = 'grid', 
  showCurrency = 'GHS',
  onSave,
  onContact,
  className = ''
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(property.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(property);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hi, I'm interested in this property: ${property.title} - ${formatCurrency(property.price, showCurrency)}`;
    const whatsappUrl = `https://wa.me/${property.seller.whatsapp || property.seller.phone}?text=${encodeURIComponent(message)}`;
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
      case 'standard':
        return null; // Remove Featured badge for standard tier
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
          <Link href={`/property/${property.id}`} className="block">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative md:w-1/3 md:max-w-80 h-64 md:h-48 flex-shrink-0">
                <Image
                  src={property.images[currentImageIndex] || '/placeholder-property.jpg'}
                  alt={property.title}
                  fill
                  className="property-image rounded-t-lg md:rounded-l-lg md:rounded-t-none object-cover"
                />
                
                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-2 left-2 flex space-x-1">
                    {property.images.slice(0, 4).map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                    {property.images.length > 4 && (
                      <span className="text-white text-xs bg-black/50 px-1 rounded">
                        +{property.images.length - 4}
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

                {/* Save Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-white/80 hover:bg-white h-6 w-6 sm:h-8 sm:w-8 p-0"
                >
                  <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>

                {/* Verification Badge */}
                {property.verification.isVerified && (
                  <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
                    <Badge className="verification-badge text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                      <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
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
                      {property.title}
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
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className={`property-card-shadow hover:shadow-lg transition-all duration-300 group overflow-hidden ${className} ${
      property.tier === 'premium' ? 'premium-card-glow' : ''
    }`}>
      <CardContent className="p-0">
        <Link href={`/property/${property.id}`} className="block">
          {/* Image Section */}
          <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
            <Image
              src={property.images[currentImageIndex] || '/placeholder-property.jpg'}
              alt={property.title}
              fill
              className="property-image rounded-t-lg object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex space-x-1">
                {property.images.slice(0, 4).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>

            {/* Verification Badge */}
            {property.verification.isVerified && (
              <div className="absolute bottom-2 right-2">
                <Badge className="verification-badge">
                  <Shield className="w-3 h-3" />
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-2 sm:p-3 md:p-4 flex flex-col h-48 sm:h-52 md:h-56">
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

            {/* Actions */}
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

            {/* Seller Info */}
            <div className="mt-auto pt-2 border-t text-xs sm:text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
