import { Property } from '@/lib/types';
import PropertyPageClient from './PropertyPageClient';

// Mock property data - in production, fetch based on id
const mockProperty: Property = {
  id: '1',
  title: 'Modern 4-Bedroom Villa in East Legon',
  description: 'Stunning contemporary villa featuring spacious living areas, modern kitchen, beautiful garden, and premium finishes throughout. Perfect for families seeking luxury living in one of Accra\'s most prestigious neighborhoods.',
  price: 850000,
  currency: 'GHS',
  status: 'for-sale',
  type: 'house',
  location: {
    address: 'East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    coordinates: {
      lat: 5.6465,
      lng: -0.1414
    }
  },
  specifications: {
    bedrooms: 4,
    bathrooms: 3,
    size: 3200,
    sizeUnit: 'sqft',
    yearBuilt: 2018
  },
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  features: ['Modern Kitchen', 'Garden', 'Parking'],
  amenities: ['Air Conditioning', 'Swimming Pool', 'Garden', 'Parking', 'WiFi', 'Security'],
  seller: {
    id: 'seller1',
    name: 'Kwame Asante',
    type: 'agent',
    phone: '+233 24 123 4567',
    email: 'kwame@akwaabahomes.com',
    isVerified: true
  },
  verification: {
    isVerified: true,
    documentsUploaded: true,
    verificationDate: '2024-01-15'
  },
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15',
  expiresAt: '2024-02-14',
  tier: 'premium',
  diasporaFeatures: {
    multiCurrencyDisplay: true,
    inspectionScheduling: true,
    virtualTourAvailable: true,
    familyRepresentativeContact: '+233244987654'
  }
};

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  
  // In production, fetch property data based on id
  const property = mockProperty;

  return <PropertyPageClient property={property} propertyId={id} />;
}