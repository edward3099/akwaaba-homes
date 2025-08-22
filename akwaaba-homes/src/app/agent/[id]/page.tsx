import { Property } from '@/lib/types';
import AgentPageClient from './AgentPageClient';

// Mock agent data - in production, fetch based on id
const mockAgent = {
  id: 'seller1',
  name: 'Kwame Asante',
  type: 'agent',
  phone: '+233 24 123 4567',
  email: 'kwame@akwaabahomes.com',
  isVerified: true,
  company: 'AkwaabaHomes Real Estate',
  experience: '8+ years',
  specializations: ['Residential', 'Commercial', 'Luxury Properties'],
  bio: 'Kwame Asante is a seasoned real estate professional with over 8 years of experience in the Ghanaian property market. Specializing in residential and commercial properties, Kwame has helped hundreds of families find their dream homes and investors secure profitable real estate opportunities.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  stats: {
    totalProperties: 47,
    propertiesSold: 23,
    propertiesRented: 18,
    clientSatisfaction: 4.8,
    responseTime: '2 hours'
  },
  contactInfo: {
    address: 'East Legon, Accra',
    workingHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM',
    languages: ['English', 'Twi', 'Ga']
  }
};

// Mock properties for this agent
const mockAgentProperties: Property[] = [
  {
    id: '1',
    title: 'Modern 4-Bedroom Villa in East Legon',
    description: 'Stunning contemporary villa featuring spacious living areas, modern kitchen, beautiful garden, and premium finishes throughout.',
    price: 850000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'house',
    location: {
      address: 'East Legon',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6465, lng: -0.1414 }
    },
    specifications: {
      bedrooms: 4,
      bathrooms: 3,
      size: 3200,
      sizeUnit: 'sqft',
      yearBuilt: 2018
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
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
  },
  {
    id: '2',
    title: 'Luxury 3-Bedroom Apartment in Airport Residential',
    description: 'Elegant apartment with modern amenities, stunning city views, and premium finishes in one of Accra\'s most prestigious neighborhoods.',
    price: 450000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'apartment',
    location: {
      address: 'Airport Residential',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6011, lng: -0.1869 }
    },
    specifications: {
      bedrooms: 3,
      bathrooms: 2,
      size: 1800,
      sizeUnit: 'sqft',
      yearBuilt: 2020
    },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    features: ['City View', 'Balcony', 'Modern Kitchen'],
    amenities: ['Air Conditioning', 'Gym', 'Pool', 'Security', 'WiFi'],
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
      verificationDate: '2024-01-10'
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    expiresAt: '2024-02-09',
    tier: 'premium',
    diasporaFeatures: {
      multiCurrencyDisplay: true,
      inspectionScheduling: true,
      virtualTourAvailable: true,
      familyRepresentativeContact: '+233244987654'
    }
  },
  {
    id: '3',
    title: 'Spacious 5-Bedroom Family Home in Trasacco Valley',
    description: 'Beautiful family home with large garden, modern amenities, and plenty of space for growing families.',
    price: 1200000,
    currency: 'GHS',
    status: 'for-sale',
    type: 'house',
    location: {
      address: 'Trasacco Valley',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      coordinates: { lat: 5.6234, lng: -0.1567 }
    },
    specifications: {
      bedrooms: 5,
      bathrooms: 4,
      size: 4500,
      sizeUnit: 'sqft',
      yearBuilt: 2019
    },
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    features: ['Large Garden', 'Family Room', 'Modern Kitchen'],
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
      verificationDate: '2024-01-05'
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    expiresAt: '2024-02-04',
    tier: 'normal',
    diasporaFeatures: {
      multiCurrencyDisplay: true,
      inspectionScheduling: true,
      virtualTourAvailable: false,
      familyRepresentativeContact: '+233244987654'
    }
  }
];

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;
  
  // In production, fetch agent data and properties based on id
  const agent = mockAgent;
  const properties = mockAgentProperties;

  return <AgentPageClient agent={agent} properties={properties} agentId={id} />;
}
