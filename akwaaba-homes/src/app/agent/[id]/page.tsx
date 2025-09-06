import { Property } from '@/lib/types/index';
import AgentPageClient from './AgentPageClient';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

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
  avatar: null,
  coverImage: null,
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
      '/placeholder-property.svg'
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
      '/placeholder-property.svg'
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
      '/placeholder-property.svg'
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
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch real agent data from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching agent profile:', profileError);
    notFound();
  }

  // Fetch agent's properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('seller_id', id)
    .in('approval_status', ['approved', 'pending'])
    .order('created_at', { ascending: false });

  if (propertiesError) {
    console.error('Error fetching agent properties:', propertiesError);
  }

  // Transform profile data to match the expected agent interface
  const agent = {
    id: profile.user_id,
    name: profile.full_name || 'Unnamed Agent',
    type: profile.user_role || 'agent',
    phone: profile.phone || '',
    email: profile.email || '',
    isVerified: profile.verification_status === 'verified',
    company: profile.company_name || '',
    experience: profile.experience_years ? `${profile.experience_years}+ years` : '0+ years',
    specializations: profile.specializations || [],
    bio: profile.bio || '',
    avatar: profile.profile_image || '/placeholder-property.svg',
    coverImage: profile.cover_image || '/placeholder-property.jpg',
    stats: {
      totalProperties: properties?.length || 0,
      propertiesSold: 0, // This would need to be calculated from actual sales data
      propertiesRented: 0, // This would need to be calculated from actual rental data
      clientSatisfaction: 4.5, // Default rating
      responseTime: '2 hours' // Default response time
    },
    contactInfo: {
      address: profile.address || '',
      workingHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM', // Default working hours
      languages: ['English'] // Default language
    }
  };

  // Transform properties to match the expected Property interface
  const transformedProperties = properties?.map(property => ({
    id: property.id,
    title: property.title,
    description: property.description || '',
    price: property.price,
    currency: 'GHS' as const,
    status: (property.status === 'active' ? 'for-sale' : property.status) as 'for-sale' | 'for-rent' | 'short-let' | 'sold' | 'rented',
    type: property.property_type as 'house' | 'apartment' | 'land' | 'commercial' | 'townhouse' | 'condo',
    location: {
      address: property.address || '',
      city: property.city || '',
      region: property.region || '',
      country: 'Ghana' as const,
      coordinates: property.latitude && property.longitude ? { lat: property.latitude, lng: property.longitude } : null
    },
    specifications: {
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      size: property.square_feet ? parseFloat(property.square_feet) : 0,
      sizeUnit: 'sqft' as const,
      yearBuilt: property.year_built
    },
    images: property.images || ['/placeholder-property.svg'],
    features: property.features || [],
    amenities: property.amenities || [],
    seller: {
      id: property.seller_id,
      name: agent.name,
      type: agent.type,
      phone: agent.phone,
      email: agent.email,
      isVerified: agent.isVerified
    },
    verification: {
      isVerified: property.approval_status === 'approved',
      documentsUploaded: true,
      verificationDate: property.created_at
    },
    createdAt: property.created_at,
    updatedAt: property.updated_at,
    expiresAt: null,
    tier: (property.is_featured ? 'premium' : 'normal') as 'premium' | 'normal',
    approval_status: property.approval_status,
    diasporaFeatures: {
      multiCurrencyDisplay: true,
      inspectionScheduling: true,
      virtualTourAvailable: false,
      familyRepresentativeContact: agent.phone
    }
  })) || [];

  return <AgentPageClient agent={agent} properties={transformedProperties} agentId={id} />;
}
