'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  ArrowLeft,
  ArrowRight,
  Building,
  Star,
  FileText
} from 'lucide-react';
import { Property, CurrencyCode } from '@/lib/types';
import { formatDiasporaPrice } from '@/lib/utils/currency';
import { InspectionScheduler } from '@/components/property/InspectionScheduler';

interface PropertyPageClientProps {
  property: Property;
  propertyId: string;
}

export default function PropertyPageClient({ property }: PropertyPageClientProps) {
  const [currency] = useState<CurrencyCode>('GHS');
  const [isSaved, setIsSaved] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');

  const priceDisplay = formatDiasporaPrice(property.price, currency);

  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to property list
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {property.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header Info */}
            <div className="bg-white rounded-lg p-6 border">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.specifications.bedrooms} bedroom {property.type.toLowerCase()} for {property.status === 'for-sale' ? 'sale' : 'rent'}
                  </h2>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{property.location.address}, {property.location.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {priceDisplay.primary}
                  </div>
                  <div className="text-sm text-gray-500">
                    {priceDisplay.alternatives.map(alt => alt.formatted).join(' • ')}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm border-t pt-4">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-gray-600" />
                  <span>{property.specifications.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-gray-600" />
                  <span>{property.specifications.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4 text-gray-600" />
                  <span>{property.specifications.size} {property.specifications.sizeUnit}</span>
                </div>
                <Badge variant="outline">{property.type}</Badge>
                <Badge variant={property.status === 'for-sale' ? 'default' : 'secondary'}>
                  {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="relative">
                <div className="relative h-80 sm:h-96">
                  <Image
                    src={property.images[currentImageIndex]}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} of {property.images.length}
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-primary' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Click main picture to view in fullscreen
                  </p>
                </div>
              </div>
            </div>

            {/* Property Actions */}
            <div className="bg-white rounded-lg p-6 border text-center">
              <p className="text-lg font-medium mb-4">Interested in this property?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="flex-1 sm:flex-none">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg border">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('area-guide')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'area-guide'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Area Guide
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Property Description</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {property.description}
                    </p>

                    <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Property Ref:</div>
                        <div className="font-medium">{property.id}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Type:</div>
                        <div className="font-medium">{property.type}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Bedrooms:</div>
                        <div className="font-medium">{property.specifications.bedrooms}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Bathrooms:</div>
                        <div className="font-medium">{property.specifications.bathrooms}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Size:</div>
                        <div className="font-medium">{property.specifications.size} {property.specifications.sizeUnit}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Year Built:</div>
                        <div className="font-medium">{property.specifications.yearBuilt}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'area-guide' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About {property.location.city}</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {property.location.city} is a vibrant area known for its excellent amenities, 
                      convenient transportation, and thriving community. This location offers the perfect 
                      balance of urban convenience and residential tranquility.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Building className="w-5 h-5 text-primary" />
                          Popular Estates
                        </h4>
                        <p className="text-gray-700 text-sm">
                          The area features several prestigious estates and gated communities 
                          offering residents amenities that are both stylish and convenient.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-primary" />
                          Lifestyle
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Residents enjoy access to shopping centers, restaurants, schools, 
                          and recreational facilities, making it an ideal place to call home.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="bg-white rounded-lg p-6 border text-center">
              <p className="text-sm text-gray-600 mb-3">Share this property</p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Marketed by</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="font-medium">{property.seller.name}</p>
                  <p className="text-sm text-gray-600">{property.seller.type}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{property.location.city}, Ghana</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{property.seller.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{property.seller.phone}</span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setShowInspectionForm(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Inspection
                </Button>
              </div>
            </div>

            {/* Save Property */}
            <div className="bg-white rounded-lg border p-6 text-center">
              <Button
                variant="outline"
                className="w-full"
                onClick={toggleSaved}
              >
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save Property'}
              </Button>
            </div>

            {/* Diaspora Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Diaspora Support</h3>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Support Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Virtual Inspection Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Property Listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {showInspectionForm && (
        <InspectionScheduler
          property={property}
          onClose={() => setShowInspectionForm(false)}
        />
      )}
    </div>
  );
}
