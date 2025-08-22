'use client';

import { useState } from 'react';
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
  Star,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  isVerified: boolean;
  company: string;
  experience: string;
  specializations: string[];
  bio: string;
  avatar: string;
  coverImage: string;
  stats: {
    totalProperties: number;
    propertiesSold: number;
    propertiesRented: number;
    clientSatisfaction: number;
    responseTime: string;
  };
  contactInfo: {
    address: string;
    workingHours: string;
    languages: string[];
  };
}

interface AgentsPageClientProps {
  agents: Agent[];
}

export default function AgentsPageClient({ agents }: AgentsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Get unique specializations and locations for filters
  const specializations = ['all', ...Array.from(new Set(agents.flatMap(agent => agent.specializations)))];
  const locations = ['all', ...Array.from(new Set(agents.map(agent => agent.contactInfo.address.split(',')[0])))];

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 agent.specializations.includes(selectedSpecialization);
    
    const matchesLocation = selectedLocation === 'all' || 
                           agent.contactInfo.address.split(',')[0] === selectedLocation;

    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Real Estate Agent</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Connect with verified, experienced real estate professionals across Ghana
          </p>
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
                  placeholder="Search agents by name, company, or specialization..."
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

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredAgents.length} of {agents.length} agents
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filtered by: {selectedSpecialization !== 'all' ? selectedSpecialization : 'All'} • {selectedLocation !== 'all' ? selectedLocation : 'All locations'}</span>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Agent Cover Image */}
              <div className="relative h-48">
                <Image
                  src={agent.coverImage}
                  alt={`${agent.name} cover`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Verification Badge */}
                {agent.isVerified && (
                  <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-2">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Agent Info */}
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Image
                      src={agent.avatar}
                      alt={agent.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    {agent.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Name and Company */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{agent.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{agent.company}</p>
                    <Badge variant="secondary" className="text-xs">
                      {agent.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Experience and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{agent.experience}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(agent.stats.clientSatisfaction)}
                    <span className="text-sm text-gray-600 ml-1">
                      {agent.stats.clientSatisfaction}
                    </span>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.specializations.slice(0, 3).map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {agent.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.specializations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-primary">{agent.stats.totalProperties}</div>
                    <div className="text-xs text-gray-600">Properties</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-green-600">{agent.stats.propertiesSold}</div>
                    <div className="text-xs text-gray-600">Sold</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-blue-600">{agent.stats.propertiesRented}</div>
                    <div className="text-xs text-gray-600">Rented</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{agent.contactInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{agent.contactInfo.workingHours}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/agent/${agent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No agents found</h3>
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
