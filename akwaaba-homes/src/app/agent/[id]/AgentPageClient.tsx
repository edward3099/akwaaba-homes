'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  CheckCircle, 
  Share2, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Eye, 
  Star, 
  ArrowRight,
  Award,
  Globe,
  Bed,
  Bath,
  Square,
  Clock,
  MessageCircle,
  Grid3X3,
  List
} from 'lucide-react';
import { Property } from '@/lib/types/index';
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
  const [activeTab, setActiveTab] = useState<'about' | 'properties'>('properties');
  const [currency] = useState<'GHS'>('GHS');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

  // Calculate pagination
  const totalPages = Math.ceil(properties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  // Reset to page 1 when switching tabs
  const handleTabChange = (tab: 'about' | 'properties') => {
    setActiveTab(tab);
    if (tab === 'properties') {
      setCurrentPage(1);
    }
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
                {agent.coverImage ? (
                  <Image 
                    src={agent.coverImage} 
                    alt={`${agent.name} cover image`} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 80vw"
                    className="object-cover"
                    unoptimized={agent.coverImage.includes('supabase.co')}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40"></div>
                
                {/* Agent Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                  <div className="flex items-end gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full p-1.5 shadow-xl">
                        {agent.avatar ? (
                          <Image 
                            src={agent.avatar} 
                            alt={agent.name} 
                            width={64} 
                            height={64} 
                            className="w-full h-full rounded-full object-cover"
                            unoptimized={agent.avatar.includes('supabase.co')}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 bg-primary text-white rounded-full p-1 shadow-lg">
                        <CheckCircle className="w-2 h-2" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Agent name and badge removed for cleaner design */}
                    </div>
                    
                    <div className="flex gap-3 flex-shrink-0">
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
                  onClick={() => handleTabChange('about')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => handleTabChange('properties')}
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {currentProperties.map((property) => {
                        // Ensure images array exists and has valid URLs
                        const validImages = property.images && Array.isArray(property.images) && property.images.length > 0 
                          ? property.images.filter(img => img && typeof img === 'string' && img.trim() !== '' && img !== null)
                          : [];
                        
                        // Use a fallback image if no valid images are available
                        const propertyImage = validImages.length > 0 ? validImages[0] : '/placeholder-property.svg';
                        
                        return (
                          <div key={property.id} className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                            <div className="relative h-24 sm:h-28">
                              <Image 
                                src={propertyImage} 
                                alt={property.title} 
                                fill 
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                className="object-cover"
                                unoptimized={propertyImage.includes('supabase.co')}
                                onError={(e) => {
                                  console.error('Image failed to load:', propertyImage);
                                  // Fallback to placeholder if image fails
                                  const target = e.target as HTMLImageElement;
                                  if (target) {
                                    // Try to set placeholder, but if that also fails, create a simple fallback
                                    target.onerror = null; // Prevent infinite loop
                                    target.src = '/placeholder-property.svg';
                                    
                                    // If placeholder also fails, create a simple colored div as fallback
                                    target.onerror = () => {
                                      target.style.display = 'none';
                                      const fallbackDiv = document.createElement('div');
                                      fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center';
                                      fallbackDiv.innerHTML = `
                                        <div class="text-center text-slate-600">
                                          <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                          </svg>
                                          <p class="text-sm">Image unavailable</p>
                                        </div>
                                      `;
                                      target.parentNode?.insertBefore(fallbackDiv, target);
                                    };
                                  }
                                }}
                              />
                              <div className="absolute top-1 right-1 flex flex-col gap-1">
                                <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'} className="text-xs">{property.tier}</Badge>
                                {property.approval_status === 'pending' && (
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
                                )}
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
                              <Link href={`/properties/${property.id}`}>
                                <Button variant="outline" size="sm" className="w-full h-6 text-xs">View Details<ArrowRight className="w-3 h-3 ml-1" /></Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Showing {startIndex + 1} to {Math.min(endIndex, properties.length)} of {properties.length} properties
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm border rounded-md ${
                                  currentPage === page
                                    ? 'bg-primary text-white border-primary'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
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
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    // Check if phone number exists
                    if (!agent.phone || agent.phone.trim() === '') {
                      alert('Phone number not available for this agent. Please contact them through other means.');
                      return;
                    }
                    // Open phone dialer
                    window.open(`tel:${agent.phone}`, '_self');
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    // Check if phone number exists
                    if (!agent.phone || agent.phone.trim() === '') {
                      alert('Phone number not available for this agent. Please contact them through other means.');
                      return;
                    }
                    
                    // Create WhatsApp message
                    const message = `Hi ${agent.name}, I'm interested in your properties. Can you help me find what I'm looking for?`;
                    
                    // Clean the phone number - remove all non-numeric characters
                    let cleanPhone = agent.phone.replace(/[^0-9]/g, '');
                    
                    // Ensure it starts with country code (Ghana is +233)
                    if (cleanPhone.startsWith('0')) {
                      cleanPhone = '233' + cleanPhone.substring(1);
                    } else if (!cleanPhone.startsWith('233')) {
                      cleanPhone = '233' + cleanPhone;
                    }
                    
                    // Open WhatsApp
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    // Check if email exists
                    if (!agent.email || agent.email.trim() === '') {
                      alert('Email not available for this agent. Please contact them through other means.');
                      return;
                    }
                    // Open email client
                    window.open(`mailto:${agent.email}?subject=Property Inquiry from AkwaabaHomes&body=Hi ${agent.name},%0D%0A%0D%0AI'm interested in your properties. Can you help me find what I'm looking for?%0D%0A%0D%0AThank you!`, '_blank');
                  }}
                >
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
