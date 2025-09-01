'use client';

import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import { Property } from '@/lib/types/index';

interface PropertyStickyBarProps {
  property: Property;
}

export default function PropertyStickyBar({ property }: PropertyStickyBarProps) {
  const handleWhatsAppClick = () => {
    const message = `Hi! I'm interested in the property "${property.title}" at ${property.location.address}, ${property.location.city}. Could you please provide more information?`;
    const whatsappUrl = `https://wa.me/${property.seller.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallClick = () => {
    window.open(`tel:${property.seller.phone}`, '_self');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            onClick={handleCallClick}
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Now
          </Button>
        </div>
      </div>
    </div>
  );
}
