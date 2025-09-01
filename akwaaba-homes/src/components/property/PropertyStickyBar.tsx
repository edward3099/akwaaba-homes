'use client';

import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import { Property } from '@/lib/types/index';

interface PropertyStickyBarProps {
  property: Property;
}

export default function PropertyStickyBar({ property }: PropertyStickyBarProps) {
  const handleWhatsAppClick = () => {
    // Check if phone number exists
    const phoneNumber = property.seller.phone;
    if (!phoneNumber || phoneNumber.trim() === '') {
      alert('Phone number not available for this property. Please contact the agent through other means.');
      return;
    }

    const message = `Hi! I'm interested in the property "${property.title}" at ${property.location.address}, ${property.location.city}. I found this listing on AkwaabaHomes. Could you please provide more information?`;
    
    // Clean the phone number - remove all non-numeric characters and ensure it starts with country code
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // If phone doesn't start with country code, add Ghana's country code (+233)
    if (!cleanPhone.startsWith('233') && !cleanPhone.startsWith('+233')) {
      // If it's a local number (starts with 0), replace 0 with 233
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '233' + cleanPhone.substring(1);
      } else {
        // If it's a 10-digit number, add 233 prefix
        if (cleanPhone.length === 10) {
          cleanPhone = '233' + cleanPhone;
        }
      }
    }
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    console.log('WhatsApp URL:', whatsappUrl); // Debug log
    window.open(whatsappUrl, '_blank');
  };

  const handleCallClick = () => {
    // Check if phone number exists
    const phoneNumber = property.seller.phone;
    if (!phoneNumber || phoneNumber.trim() === '') {
      alert('Phone number not available for this property. Please contact the agent through other means.');
      return;
    }
    
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg block sm:block">
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
