import { Property } from '@/lib/types';
import { PropertyPageClient } from './PropertyPageClient';

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
    coordinates: {
      lat: 5.6471,
      lng: -0.1017
    },
    plusCode: '6CQXJWX3+4H'
  },
  specifications: {
    bedrooms: 4,
    bathrooms: 3,
    size: 3500,
    sizeUnit: 'sqft',
    parkingSpaces: 2,
    yearBuilt: 2022
  },
  seller: {
    id: 'agent-1',
    name: 'Kwame Asante',
    type: 'agent',
    phone: '+233244123456',
    email: 'kwame@gpp.com',
    whatsapp: '+233244123456',
    isVerified: true,
    company: 'Ghana Premier Properties',
    licenseNumber: 'GPL-2024-001'
  },
  images: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  ],
  videos: ['https://example.com/tour-video.mp4'],
  amenities: [
    'Swimming Pool',
    'Private Garden',
    'Garage',
    'Security System',
    'Air Conditioning',
    'Modern Kitchen',
    'Walk-in Closets',
    'Balcony'
  ],
  features: [
    'Private Parking (2 spaces)',
    'Private Garden',
    'Swimming Pool',
    'Gated Community Security',
    'Fiber Optic Internet',
    'Backup Generator'
  ],
  verification: {
    isVerified: true,
    documentsUploaded: true,
    verificationDate: '2024-01-15T10:00:00Z',
    adminNotes: 'All documents verified and approved'
  },

  tier: 'premium',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  expiresAt: '2024-07-01T00:00:00Z'
};

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, generate params for known property IDs
  // In production, you'd fetch all property IDs from your API
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // Add more property IDs as needed
  ];
}

export default function PropertyPage() {
  // For now, use mock data. In production, you'd get the ID from params
  // const { id } = await params;
  // const property = await fetchProperty(id);
  const property = mockProperty;

  return <PropertyPageClient property={property} />;
}