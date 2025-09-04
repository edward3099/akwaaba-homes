'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Users, 
  ArrowRight,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  type: string;
  isVerified: boolean;
  verification_status?: string;
  bio: string;
  avatar: string;
  coverImage: string;
  specializations: string[];
  experience: string;
  address?: string;
  city?: string;
  region?: string;
  created_at?: string;
  stats?: {
    totalProperties: number;
    propertiesSold: number;
    propertiesRented: number;
    clientSatisfaction: number;
    responseTime: string;
  };
  contactInfo?: {
    address: string;
    workingHours: string;
    languages: string[];
  };
}

interface AgentsResponse {
  agents: Agent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search_metadata: {
    filters_applied: string[];
    sort_by: string;
    sort_order: string;
  };
}

export default function AgentsPageClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/developers/search');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data: AgentsResponse = await response.json();
        
        // Ensure all agents have proper data structure
        const sanitizedAgents = data.agents.map(agent => ({
          ...agent,
          specializations: Array.isArray(agent.specializations) ? agent.specializations : [],
          city: agent.city || '',
          region: agent.region || '',
          address: agent.address || '',
          experience: agent.experience || 'Not specified',
          isVerified: Boolean(agent.isVerified),
          verification_status: agent.verification_status || 'pending'
        }));
        
        setAgents(sanitizedAgents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agents');
        console.error('Error fetching agents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Get unique specializations and locations for filters
  const specializations = ['all', ...Array.from(new Set(agents.flatMap(agent => Array.isArray(agent.specializations) ? agent.specializations : [])))];
  const locations = ['all', ...Array.from(new Set(agents.map(agent => agent.city || agent.region || 'Unknown').filter(Boolean)))];

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (agent.specializations || []).some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 (agent.specializations || []).includes(selectedSpecialization);
    
    const matchesLocation = selectedLocation === 'all' || 
                           (agent.city === selectedLocation || agent.region === selectedLocation);

    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  // Ensure filteredAgents is always an array
  const safeFilteredAgents = Array.isArray(filteredAgents) ? filteredAgents : [];


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading developers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Error loading developers</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Developers</h1>
          <p className="text-gray-600 mt-2">Connect with skilled developers for your projects</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search developers by name, company, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Specialization Filter */}
            <div className="w-32 sm:w-48">
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="w-32 sm:w-48">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {safeFilteredAgents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Agent Cover Image */}
              <div className="relative h-32">
                <Image
                  src={agent.coverImage || '/placeholder-property.svg'}
                  alt={`${agent.name} cover image`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Verification Badge */}
                {agent.isVerified && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1.5">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Agent Info */}
              <CardHeader className="pb-2 px-4">
                <div className="flex items-start gap-2">
                  {/* Avatar */}
                  <div className="relative">
                    <Image
                      src={agent.avatar || '/placeholder-property.svg'}
                      alt={`${agent.name} profile picture`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    {agent.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Name and Company */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 mb-0.5">{agent.name || 'Unnamed Agent'}</h3>
                    <p className="text-xs text-gray-600 mb-1">{agent.company || 'No Company'}</p>
                    <Badge variant="secondary" className="text-xs">
                      {agent.type || 'Agent'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 px-4">
                {/* Specializations */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(agent.specializations) ? agent.specializations : []).slice(0, 2).map((spec, index) => (
                      <Badge key={`${agent.id}-spec-${index}`} variant="outline" className="text-xs px-1.5 py-0.5">
                        {spec}
                      </Badge>
                    ))}
                    {(Array.isArray(agent.specializations) ? agent.specializations : []).length > 2 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        +{(Array.isArray(agent.specializations) ? agent.specializations : []).length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{agent.address || 'Address not provided'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="truncate">Experience: {agent.experience || 'Not specified'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/agent/${agent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                      View Profile
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 w-7 p-0">
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {safeFilteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No developers found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('all');
                setSelectedLocation('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
