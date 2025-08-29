'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CameraIcon, 
  TagIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface PropertyFormData {
  // Basic Information
  title: string;
  description: string;
  price: number;
  status: 'for-sale' | 'for-rent' | 'short-let';
  type: 'house' | 'apartment' | 'land' | 'commercial' | 'townhouse' | 'condo';
  tier: 'normal' | 'premium';
  
  // Location
  address: string;
  city: string;
  region: string;
  coordinates: { lat: number; lng: number };
  
  // Specifications
  bedrooms?: number;
  bathrooms?: number;
  size: number;
  sizeUnit: 'sqft' | 'sqm';
  lotSize?: number;
  lotSizeUnit?: 'sqft' | 'sqm' | 'acres';
  yearBuilt?: number;
  parkingSpaces?: number;
  
  // Features & Amenities
  features: string[];
  amenities: string[];
  
  // Media
  images: string[];
  videos: string[];
  virtualTour: string;
}

const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  price: 0,
  status: 'for-sale',
  type: 'house',
  tier: 'normal',
  address: '',
  city: '',
  region: '',
  coordinates: { lat: 0, lng: 0 },
  bedrooms: 0,
  bathrooms: 0,
  size: 0,
  sizeUnit: 'sqft',
  lotSize: 0,
  lotSizeUnit: 'sqft',
  yearBuilt: 0,
  parkingSpaces: 0,
  features: [],
  amenities: [],
  images: [],
  videos: [],
  virtualTour: '',
};

const cities = [
  'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Ashaiman', 
  'Cape Coast', 'Obuasi', 'Tema', 'Teshi', 'Ho'
];

const regions = [
  'Greater Accra', 'Ashanti', 'Northern', 'Western', 'Central', 
  'Eastern', 'Volta', 'Upper East', 'Upper West', 'Bono', 'Ahafo'
];

const propertyTypes = [
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'land', label: 'Land', icon: '🌍' },
  { value: 'commercial', label: 'Commercial', icon: '🏪' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
  { value: 'condo', label: 'Condo', icon: '🏬' }
];

const commonFeatures = [
  'Modern Kitchen', 'Garden', 'Parking', 'Balcony', 'Terrace', 
  'Swimming Pool', 'Gym', 'Security', 'Air Conditioning', 'WiFi'
];

const commonAmenities = [
  'Air Conditioning', 'Swimming Pool', 'Garden', 'Parking', 
  'WiFi', 'Security', 'Gym', 'Playground', '24/7 Security', 'CCTV'
];

export default function PropertyListingForm() {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const totalSteps = 5;

  // Cleanup image preview URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const updateFormData = (field: keyof PropertyFormData, value: PropertyFormData[keyof PropertyFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image. Please select only image files.`);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      newImages.push(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls.push(previewUrl);
    });

    setUploadedImages(prev => [...prev, ...newImages]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Update form data with image URLs (for now, just store the count)
    updateFormData('images', [...formData.images, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the old URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
    
    // Update form data
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateFormData('images', newImages);
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum image requirement
    if (imagePreviewUrls.length < 3) {
      toast.error('Please upload at least 3 images before submitting the form.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData(initialFormData);
      setUploadedImages([]);
      setImagePreviewUrls([]);
      setCurrentStep(1);
    }, 3000);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              index + 1 < currentStep 
                ? 'bg-green-500 border-green-500 text-white' 
                : index + 1 === currentStep 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-gray-200 border-gray-300 text-gray-500'
            }`}>
              {index + 1 < currentStep ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Property Information</h3>
        <p className="text-sm text-gray-600">Provide the essential details about your property</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Modern 4-Bedroom Villa in East Legon"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => updateFormData('type', e.target.value as 'house' | 'apartment' | 'land' | 'commercial' | 'townhouse' | 'condo')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => updateFormData('status', e.target.value as 'for-sale' | 'for-rent' | 'short-let')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="for-sale">For Sale</option>
            <option value="for-rent">For Rent</option>
            <option value="short-let">Short Let</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Tier *
          </label>
          <select
            value={formData.tier}
            onChange={(e) => updateFormData('tier', e.target.value as 'normal' | 'premium')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="normal">Normal (Free)</option>
            <option value="premium">Premium (Paid)</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your property in detail..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (GHS) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Address</h3>
        <p className="text-sm text-gray-600">Specify the exact location of your property</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 123 East Legon Street"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <select
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region *
          </label>
          <select
            value={formData.region}
            onChange={(e) => updateFormData('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coordinates (Optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              value={formData.coordinates.lat}
              onChange={(e) => updateFormData('coordinates', { 
                ...formData.coordinates, 
                lat: parseFloat(e.target.value) || 0 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Latitude"
            />
            <input
              type="number"
              step="any"
              value={formData.coordinates.lng}
              onChange={(e) => updateFormData('coordinates', { 
                ...formData.coordinates, 
                lng: parseFloat(e.target.value) || 0 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Longitude"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpecifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Specifications</h3>
        <p className="text-sm text-gray-600">Provide detailed specifications about your property</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <input
            type="number"
            value={formData.bedrooms || ''}
            onChange={(e) => updateFormData('bedrooms', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <input
            type="number"
            value={formData.bathrooms || ''}
            onChange={(e) => updateFormData('bathrooms', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size *
          </label>
          <div className="flex">
            <input
              type="number"
              value={formData.size || ''}
              onChange={(e) => updateFormData('size', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              required
            />
            <select
              value={formData.sizeUnit}
              onChange={(e) => updateFormData('sizeUnit', e.target.value as 'sqft' | 'sqm')}
              className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sqft">sq ft</option>
              <option value="sqm">sq m</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lot Size
          </label>
          <div className="flex">
            <input
              type="number"
              value={formData.lotSize || ''}
              onChange={(e) => updateFormData('lotSize', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
            <select
              value={formData.lotSizeUnit}
              onChange={(e) => updateFormData('lotSizeUnit', e.target.value as 'sqft' | 'sqm' | 'acres')}
              className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sqft">sq ft</option>
              <option value="sqm">sq m</option>
              <option value="acres">acres</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year Built
          </label>
          <input
            type="number"
            value={formData.yearBuilt || ''}
            onChange={(e) => updateFormData('yearBuilt', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2020"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parking Spaces
          </label>
          <input
            type="number"
            value={formData.parkingSpaces || ''}
            onChange={(e) => updateFormData('parkingSpaces', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Features & Amenities</h3>
        <p className="text-sm text-gray-600">Select the features and amenities your property offers</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonFeatures.map(feature => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData('features', [...formData.features, feature]);
                    } else {
                      updateFormData('features', formData.features.filter(f => f !== feature));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonAmenities.map(amenity => (
              <label key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData('amenities', [...formData.amenities, amenity]);
                    } else {
                      updateFormData('amenities', formData.amenities.filter(a => a !== amenity));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Media & Visual Content</h3>
        <p className="text-sm text-gray-600">Upload images and videos to showcase your property</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Images *
          </label>
          
          {/* Hidden file input */}
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {/* Upload area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Upload at least 3 high-quality images
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 10MB each • Minimum 3 images required
              </p>
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <CameraIcon className="w-4 h-4 mr-2" />
              Upload Images
            </button>
          </div>

          {/* Image previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Images ({imagePreviewUrls.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Image count warning */}
              {imagePreviewUrls.length < 3 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You need at least 3 images. Please upload {3 - imagePreviewUrls.length} more image(s).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Virtual Tour URL
          </label>
          <input
            type="url"
            value={formData.virtualTour}
            onChange={(e) => updateFormData('virtualTour', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderLocation();
      case 3: return renderSpecifications();
      case 4: return renderFeatures();
      case 5: return renderMedia();
      default: return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Property Listed Successfully!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Your property has been added to the platform and is now visible to potential buyers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">List New Property</h2>
        <p className="text-gray-600">Fill out the form below to add your property to the platform</p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStepContent()}

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Listing Property...' : 'List Property'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
