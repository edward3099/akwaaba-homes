'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Bed, 
  Bath, 
  Square, 
  Eye,
  CheckCircle,
  Clock,
  Shield,
  ChevronLeft,
  Star,
  Building,
  Award,
  TrendingUp,
  Users,
  Clock3,
  Globe,
  ArrowRight,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { Property } from '@/lib/types';
import { formatDiasporaPrice } from '@/lib/utils/currency';

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

interface AgentPageClientProps {
  agent: Agent;
  properties: Property[];
  agentId: string;
}

export default function AgentPageClient({ agent, properties }: AgentPageClientProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currency] = useState<'GHS'>('GHS');

  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to property
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Agent Profile
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Agent Profile Header */}
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-48 sm:h-64">
                <Image
                  src={agent.coverImage}
                  alt={`${agent.name} cover image`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Agent Info Overlay */}
              <div className="relative px-4 sm:px-6 pb-6 -mt-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-1 shadow-lg">
                      <Image
                        src={agent.avatar}
                        alt={agent.name}
                        width={128}
                        height={128}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    {agent.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Agent Details */}
                  <div className="flex-1 text-white sm:text-gray-900">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h2 className="text-2xl sm:text-3xl font-bold">{agent.name}</h2>
                      <Badge variant="secondary" className="w-fit">
                        {agent.type}
                      </Badge>
                    </div>
                    <p className="text-white/90 sm:text-gray-600 text-lg sm:text-xl mb-2">
                      {agent.company}
                    </p>
                    <div className="flex items-center gap-4 text-sm sm:text-base">
                      <span className="flex items-center gap-1">
                        <Clock3 className="w-4 h-4" />
                        {agent.experience} experience
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {agent.contactInfo.address}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSaved}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Statistics */}
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Performance Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    {agent.stats.totalProperties}
                  </div>
                  <div className="text-sm text-gray-600">Total Properties</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                    {agent.stats.propertiesSold}
                  </div>
                  <div className="text-sm text-gray-600">Properties Sold</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                    {agent.stats.propertiesRented}
                  </div>
                  <div className="text-sm text-gray-600">Properties Rented</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">
                    {agent.stats.clientSatisfaction}
                  </div>
                  <div className="text-sm text-gray-600">Client Rating</div>
                </div>
              </div>
            </div>

            {/* Agent Bio */}
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">About {agent.name}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {agent.bio}
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Specializations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.contactInfo.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Properties by {agent.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {properties.length} properties available
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {properties.map((property) => (
                      <div key={property.id} className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                        <div className="relative h-48">
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'}>
                              {property.tier}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {property.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {property.specifications.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {property.specifications.bathrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              {property.specifications.size} {property.specifications.sizeUnit}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-primary mb-3">
                            {formatDiasporaPrice(property.price, currency).primary}
                          </div>
                          <Link href={`/property/${property.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <div className="absolute top-1 right-1">
                            <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'} className="text-xs">
                              {property.tier}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {property.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {property.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {property.specifications.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {property.specifications.bathrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              {property.specifications.size} {property.specifications.sizeUnit}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {formatDiasporaPrice(property.price, currency).primary}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <Link href={`/property/${property.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.phone}</p>
                    <p className="text-xs text-gray-600">Phone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.email}</p>
                    <p className="text-xs text-gray-600">Email</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.contactInfo.address}</p>
                    <p className="text-xs text-gray-600">Address</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.contactInfo.workingHours}</p>
                    <p className="text-xs text-gray-600">Working Hours</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>

            {/* Client Satisfaction */}
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Client Satisfaction</h3>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {renderStars(agent.stats.clientSatisfaction)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {agent.stats.clientSatisfaction}/5
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Based on client reviews
                </p>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    <span>Response Time</span>
                    <span className="font-medium">{agent.stats.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Properties Sold</span>
                  <span className="font-bold">{agent.stats.propertiesSold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Properties Rented</span>
                  <span className="font-bold">{agent.stats.propertiesRented}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Properties</span>
                  <span className="font-bold">{agent.stats.totalProperties}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Experience</span>
                  <span className="font-bold">{agent.experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 xl:hidden">
        <div className="flex gap-2 p-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={() => {
              // Open WhatsApp with pre-filled message
              const message = `Hi ${agent.name}, I'm interested in your properties. Can you help me find what I'm looking for?`;
              const whatsappUrl = `https://wa.me/${agent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            size="lg"
            onClick={() => {
              // Open phone dialer
              window.open(`tel:${agent.phone}`, '_self');
            }}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
        </div>
      </div>
    </div>
  );
}
