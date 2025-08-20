'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  MapPin, 
  Home, 
  DollarSign,
  Camera,
  Map,
  FileText,
  Save,
  Eye,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Agent, Property } from '@/lib/types';

interface ListingCreatorProps {
  onClose: () => void;
  agent: Agent;
  editingProperty?: Property;
}

export function ListingCreator({ onClose, agent, editingProperty }: ListingCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    title: editingProperty?.title || '',
    description: editingProperty?.description || '',
    price: editingProperty?.price?.toString() || '',
    type: editingProperty?.type || 'house',
    status: editingProperty?.status || 'for-sale',
    
    // Location
    address: editingProperty?.location.address || '',
    city: editingProperty?.location.city || '',
    region: editingProperty?.location.region || 'Greater Accra',
    coordinates: editingProperty?.location.coordinates || { lat: 0, lng: 0 },
    plusCode: editingProperty?.location.plusCode || '',
    
    // Specifications
    bedrooms: editingProperty?.specifications.bedrooms?.toString() || '',
    bathrooms: editingProperty?.specifications.bathrooms?.toString() || '',
    size: editingProperty?.specifications.size?.toString() || '',
    sizeUnit: editingProperty?.specifications.sizeUnit || 'sqft',
    lotSize: editingProperty?.specifications.lotSize?.toString() || '',
    lotSizeUnit: editingProperty?.specifications.lotSizeUnit || 'sqft',
    yearBuilt: editingProperty?.specifications.yearBuilt?.toString() || '',
    parkingSpaces: editingProperty?.specifications.parkingSpaces?.toString() || '',
    
    // Features & Amenities
    features: editingProperty?.features || [],
    amenities: editingProperty?.amenities || [],
    
    // Media
    images: [] as File[],
    videos: [] as File[],
    virtualTour: editingProperty?.virtualTour || '',
    
    // Listing Tier
    tier: editingProperty?.tier || 'standard'
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  const steps = [
    { id: 1, title: 'Basic Info', icon: Home },
    { id: 2, title: 'Location', icon: MapPin },
    { id: 3, title: 'Details', icon: FileText },
    { id: 4, title: 'Media', icon: Camera },
    { id: 5, title: 'Pricing', icon: DollarSign },
  ];

  const regions = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo'
  ];

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condo', label: 'Condo' }
  ];

  const commonFeatures = [
    'Swimming Pool', 'Garden', 'Balcony', 'Terrace', 'Garage',
    'Walk-in Closet', 'Master Suite', 'Guest Room', 'Study Room',
    'Modern Kitchen', 'Dining Area', 'Living Room', 'Family Room'
  ];

  const commonAmenities = [
    '24/7 Security', 'CCTV', 'Generator', 'Water Tank', 'Borehole',
    'Solar Panels', 'Elevator', 'Gym', 'Playground', 'Laundry',
    'Internet Ready', 'Cable Ready', 'Air Conditioning', 'Parking'
  ];

  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      price: 50,
      features: ['3 photos', 'Basic listing', '30 days'],
      description: 'Get started with essential listing features'
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 150,
      features: ['10 photos', 'Higher visibility', 'Email support', '30 days'],
      description: 'More exposure with enhanced features'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 300,
      features: ['Unlimited photos', 'Top placement', 'Priority support', 'Analytics', '30 days'],
      description: 'Maximum visibility and premium features'
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // In production, this would submit to API
    console.log('Submitting listing:', formData);
    onClose();
  };

  const getCurrentStepValidation = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.type;
      case 2:
        return formData.address && formData.city && formData.region;
      case 3:
        return formData.bedrooms && formData.bathrooms && formData.size;
      case 4:
        return true; // Media is optional
      case 5:
        return formData.price && formData.tier;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">
              {editingProperty ? 'Edit Property Listing' : 'Create New Listing'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isActive
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      step.id < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern 3-Bedroom Villa in East Legon"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property, highlighting key features and selling points..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Property Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Listing Type *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for-sale">For Sale</SelectItem>
                        <SelectItem value="for-rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., Plot 123, East Legon Hills"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Accra"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Region *</Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="plusCode">Google Plus Code (Optional)</Label>
                  <Input
                    id="plusCode"
                    placeholder="e.g., 6CQXJ237+8G"
                    value={formData.plusCode}
                    onChange={(e) => handleInputChange('plusCode', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Plus codes help buyers find your property precisely
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Map className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Geo-tagging Required</p>
                      <p>Precise location tagging is mandatory for all listings. This helps build trust and ensures accurate property discovery.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Property Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Specifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms *</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="3"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bathrooms">Bathrooms *</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="2"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="size">Size *</Label>
                      <Input
                        id="size"
                        type="number"
                        placeholder="2000"
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Size Unit</Label>
                      <Select value={formData.sizeUnit} onValueChange={(value) => handleInputChange('sizeUnit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqft">Square Feet</SelectItem>
                          <SelectItem value="sqm">Square Meters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        placeholder="2020"
                        value={formData.yearBuilt}
                        onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="parking">Parking Spaces</Label>
                      <Input
                        id="parking"
                        type="number"
                        placeholder="2"
                        value={formData.parkingSpaces}
                        onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lotSize">Lot Size</Label>
                      <Input
                        id="lotSize"
                        type="number"
                        placeholder="5000"
                        value={formData.lotSize}
                        onChange={(e) => handleInputChange('lotSize', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Lot Unit</Label>
                      <Select value={formData.lotSizeUnit} onValueChange={(value) => handleInputChange('lotSizeUnit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqft">Square Feet</SelectItem>
                          <SelectItem value="sqm">Square Meters</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Features</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature (e.g., Swimming Pool)"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <Button onClick={addFeature} type="button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {commonFeatures.map((feature) => (
                        <Button
                          key={feature}
                          variant={formData.features.includes(feature) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (formData.features.includes(feature)) {
                              removeFeature(feature);
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                features: [...prev.features, feature]
                              }));
                            }
                          }}
                          type="button"
                        >
                          {feature}
                        </Button>
                      ))}
                    </div>

                    {formData.features.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Selected Features:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                              {feature}
                              <button onClick={() => removeFeature(feature)} type="button">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an amenity (e.g., 24/7 Security)"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                      />
                      <Button onClick={addAmenity} type="button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {commonAmenities.map((amenity) => (
                        <Button
                          key={amenity}
                          variant={formData.amenities.includes(amenity) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (formData.amenities.includes(amenity)) {
                              removeAmenity(amenity);
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                amenities: [...prev.amenities, amenity]
                              }));
                            }
                          }}
                          type="button"
                        >
                          {amenity}
                        </Button>
                      ))}
                    </div>

                    {formData.amenities.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Selected Amenities:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                              {amenity}
                              <button onClick={() => removeAmenity(amenity)} type="button">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Media */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Media</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Property Photos (Minimum 3 required)</Label>
                      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop photos here, or click to browse
                        </p>
                        <Button variant="outline" type="button">
                          Choose Photos
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="virtualTour">Virtual Tour URL (Optional)</Label>
                      <Input
                        id="virtualTour"
                        placeholder="https://example.com/virtual-tour"
                        value={formData.virtualTour}
                        onChange={(e) => handleInputChange('virtualTour', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Pricing & Tier */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="price">Price (GHS) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="500000"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    All prices must be in Ghana Cedis (GHS)
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Listing Tier</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tiers.map((tier) => (
                      <Card 
                        key={tier.id}
                        className={`cursor-pointer transition-all ${
                          formData.tier === tier.id 
                            ? 'ring-2 ring-primary border-primary' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('tier', tier.id)}
                      >
                        <CardHeader className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {tier.id === 'premium' && <Star className="w-5 h-5 text-amber-500" />}
                            <CardTitle className="text-lg">{tier.name}</CardTitle>
                          </div>
                          <div className="text-2xl font-bold">
                            ₵{tier.price}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tier.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep === steps.length ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!getCurrentStepValidation()}
                  className="btn-ghana flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingProperty ? 'Update Listing' : 'Create Listing'}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!getCurrentStepValidation()}
                  className="btn-ghana"
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
