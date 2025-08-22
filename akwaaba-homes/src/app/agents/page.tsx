import { Property } from '@/lib/types';
import AgentsPageClient from './AgentsPageClient';

// Mock agents data - in production, fetch from API
const mockAgents = [
  {
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
  },
  {
    id: 'seller2',
    name: 'Ama Osei',
    type: 'agent',
    phone: '+233 26 987 6543',
    email: 'ama@akwaabahomes.com',
    isVerified: true,
    company: 'Premium Properties Ghana',
    experience: '5+ years',
    specializations: ['Luxury Homes', 'Investment Properties', 'Short-term Rentals'],
    bio: 'Ama Osei specializes in luxury properties and investment opportunities in Ghana. With a focus on high-end residential and commercial properties, Ama has built a reputation for finding exceptional properties for discerning clients.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    stats: {
      totalProperties: 32,
      propertiesSold: 18,
      propertiesRented: 12,
      clientSatisfaction: 4.9,
      responseTime: '1 hour'
    },
    contactInfo: {
      address: 'West Legon, Accra',
      workingHours: 'Mon-Fri: 9AM-7PM, Sat: 10AM-4PM',
      languages: ['English', 'Twi', 'Ewe']
    }
  },
  {
    id: 'seller3',
    name: 'Kofi Mensah',
    type: 'agent',
    phone: '+233 20 456 7890',
    email: 'kofi@akwaabahomes.com',
    isVerified: true,
    company: 'Kumasi Real Estate Solutions',
    experience: '12+ years',
    specializations: ['Commercial Real Estate', 'Land Development', 'Property Management'],
    bio: 'Kofi Mensah is a veteran real estate professional with over 12 years of experience. Based in Kumasi, Kofi specializes in commercial properties and land development projects, helping businesses and investors find the perfect locations.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    stats: {
      totalProperties: 65,
      propertiesSold: 41,
      propertiesRented: 20,
      clientSatisfaction: 4.7,
      responseTime: '3 hours'
    },
    contactInfo: {
      address: 'Central Kumasi',
      workingHours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-2PM',
      languages: ['English', 'Twi', 'Dagbani']
    }
  },
  {
    id: 'seller4',
    name: 'Efua Addo',
    type: 'agent',
    phone: '+233 54 321 0987',
    email: 'efua@akwaabahomes.com',
    isVerified: true,
    company: 'Accra Property Partners',
    experience: '6+ years',
    specializations: ['First-time Buyers', 'Family Homes', 'Rental Properties'],
    bio: 'Efua Addo focuses on helping first-time homebuyers and families find their perfect homes in Accra. With a patient approach and deep understanding of the local market, Efua makes the home-buying process smooth and enjoyable.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    stats: {
      totalProperties: 28,
      propertiesSold: 15,
      propertiesRented: 10,
      clientSatisfaction: 4.8,
      responseTime: '2 hours'
    },
    contactInfo: {
      address: 'Tema, Accra',
      workingHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM',
      languages: ['English', 'Twi', 'Ga']
    }
  }
];

export default function AgentsPage() {
  return <AgentsPageClient agents={mockAgents} />;
}
