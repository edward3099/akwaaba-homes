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
  Bed, 
  Bath, 
  Square, 
  CheckCircle,
  Clock,
  ChevronLeft,
  Award,
  Globe,
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState<'about' | 'properties'>('properties');
  const [currency] = useState<'GHS'>('GHS');

  const toggleSaved = () => {
    setIsSaved(!isSaved);
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
          <div className="xl:col-span-2 space-y-3">
            {/* Agent Profile Header */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="relative h-32 sm:h-40">
                <Image 
                  src={agent.coverImage} 
                  alt={`${agent.name} cover image`} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40"></div>
                
                {/* Agent Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                  <div className="flex items-end gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full p-1.5 shadow-xl">
                        <Image 
                          src={agent.avatar} 
                          alt={agent.name} 
                          width={64} 
                          height={64} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 bg-primary text-white rounded-full p-1 shadow-lg">
                        <CheckCircle className="w-2 h-2" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg break-words">{agent.name}</h2>
                        <Badge variant="secondary" className="text-sm px-3 py-1.5 bg-white text-gray-900 border-white shadow-lg font-semibold flex-shrink-0">agent</Badge>
                      </div>
                      <p className="text-white text-lg mb-3 font-medium drop-shadow-lg break-words">{agent.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-base">
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg flex-shrink-0">
                          <Clock className="w-4 h-4 text-white flex-shrink-0" />
                          <span className="text-white font-medium whitespace-nowrap">{agent.experience}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 flex-shrink-0">
                      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-100 h-10 px-4 text-sm border-white shadow-lg font-semibold text-gray-900 hover:text-gray-700">
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-100 h-10 px-4 text-sm border-white shadow-lg font-semibold text-gray-900 hover:text-gray-700">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'properties'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Properties ({properties.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'about' ? (
                  /* About Tab Content */
                  <div>
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
                ) : (
                  /* Properties Tab Content */
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold">Properties by {agent.name}</h3>
                        <p className="text-gray-600 text-sm">{properties.length} properties available</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {properties.map((property) => (
                          <div key={property.id} className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                            <div className="relative h-24 sm:h-28">
                              <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
                              <div className="absolute top-1 right-1">
                                <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'} className="text-xs">{property.tier}</Badge>
                              </div>
                            </div>
                            <div className="p-2">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-xs">{property.title}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.specifications.bedrooms}</span>
                                <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.specifications.bathrooms}</span>
                                <span className="flex items-center gap-1"><Square className="w-3 h-3" />{property.specifications.size} {property.specifications.sizeUnit}</span>
                              </div>
                              <div className="text-sm font-bold text-primary mb-1">{formatDiasporaPrice(property.price, currency).primary}</div>
                              <Link href={`/property/${property.id}`}>
                                <Button variant="outline" size="sm" className="w-full h-6 text-xs">View Details<ArrowRight className="w-3 h-3 ml-1" /></Button>
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
                              <Image src={property.images[0]} alt={property.title} fill className="object-cover rounded-lg" />
                              <div className="absolute top-1 right-1">
                                <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'} className="text-xs">{property.tier}</Badge>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h4>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.specifications.bedrooms}</span>
                                <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.specifications.bathrooms}</span>
                                <span className="flex items-center gap-1"><Square className="w-4 h-4" />{property.specifications.size} {property.specifications.sizeUnit}</span>
                              </div>
                              <div className="text-lg font-bold text-primary">{formatDiasporaPrice(property.price, currency).primary}</div>
                            </div>
                            <div className="flex flex-col justify-center">
                              <Link href={`/property/${property.id}`}>
                                <Button variant="outline" size="sm">View Details<ArrowRight className="w-4 h-4 ml-2" /></Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-3">
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

            {/* Properties Section */}
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
