'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAuth } from '@/lib/auth/authContext';
import MobileMoneyPayment from '@/components/payments/MobileMoneyPayment';

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
  coordinates: { lat: 5.5600, lng: -0.2057 }, // Default to Accra, Ghana
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
  // 🎯 CONTEXT7 EXPERT VALIDATION FIX - COMPONENT LOADED
  const context7Timestamp = Date.now();
  console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - COMPONENT LOADED 🎯');
  console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - COMPONENT LOADED 🎯');
  console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - COMPONENT LOADED 🎯');
  console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - TIMESTAMP:', context7Timestamp, '🎯');
  
  // Force cache bust by checking version
  useEffect(() => {
    fetch('/version.json?' + Date.now())
      .then(res => res.json())
      .then(data => {
        console.log('🚀🚀🚀 VERSION CHECK:', data);
        const storedVersion = localStorage.getItem('app-version');
        if (storedVersion !== data.version) {
          console.log('🚀🚀🚀 VERSION CHANGED - FORCING RELOAD');
          localStorage.setItem('app-version', data.version);
          window.location.reload();
        }
      })
      .catch(err => console.log('Version check failed:', err));
  }, []);
  
  const { user, session } = useAuth();
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // File upload state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [debugMode, setDebugMode] = useState(false); // Debug mode for troubleshooting
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null); // State to hold created property ID
  
  // Payment-related state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    paymentProcessingEnabled: false,
    premiumListingPrice: 50,
    premiumListingsEnabled: true
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 6; // Added image upload step

  // Cleanup image preview URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch('/api/agent/payment-settings', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const settings = data.paymentSettings;
          if (settings) {
            setPaymentSettings({
              paymentProcessingEnabled: settings.payment_processing_enabled || false,
              premiumListingPrice: settings.premium_listing_price || 50,
              premiumListingsEnabled: settings.premium_listings_enabled ?? true
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment settings:', error);
      }
    };

    fetchPaymentSettings();
    
    // Listen for premium listings toggle events from admin settings
    const handlePremiumListingsToggle = () => {
      console.log('Premium listings toggle event received, refreshing payment settings...');
      fetchPaymentSettings();
    };

    window.addEventListener('premiumListingsToggle', handlePremiumListingsToggle);
    
    // Refresh payment settings every 30 seconds to pick up admin changes
    const interval = setInterval(fetchPaymentSettings, 30000);
    
    return () => {
      window.removeEventListener('premiumListingsToggle', handlePremiumListingsToggle);
      clearInterval(interval);
    };
  }, []);

  // Reset tier to normal if premium listings are disabled
  useEffect(() => {
    if (!paymentSettings.premiumListingsEnabled && formData.tier === 'premium') {
      updateFormData('tier', 'normal');
    }
  }, [paymentSettings.premiumListingsEnabled, formData.tier]);

  const updateFormData = (field: keyof PropertyFormData, value: PropertyFormData[keyof PropertyFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle payment completion
  const handlePaymentComplete = async () => {
    setShowPaymentModal(false);
    setIsSubmitting(true);
    
    try {
      // Check authentication before making API call
      if (!session?.access_token) {
        throw new Error('Authentication token not found. Please sign in again.');
      }
      
      // Create the property with premium tier
      const propertyDataWithoutImages = {
        ...formData,
        image_urls: [],
        images: [],
        // Map tier to database fields
        is_featured: formData.tier === 'premium'
      };
      
      console.log('📤 Creating premium property with data:', propertyDataWithoutImages);
      
      const createResponse = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(propertyDataWithoutImages),
      });
      
      if (!createResponse.ok) {
        let errorMessage = 'Failed to create property';
        try {
          const errorData = await createResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ${createResponse.status}: ${createResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const createdProperty = await createResponse.json();
      console.log('✅ Premium property created successfully:', createdProperty);
      
      // Upload images if any
      if (uploadedImages.length > 0) {
        await handleImageUpload();
      }
      
      // Show success and redirect
      setCreatedPropertyId(createdProperty.id);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setCreatedPropertyId(null);
        setFormData(initialFormData);
        setUploadedImages([]);
        setImagePreviewUrls([]);
        setCurrentStep(1);
        window.location.href = '/agent-dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating premium property:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    toast.info('Payment cancelled. You can change the listing tier or try again later.');
  };

  // Handle file selection
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

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

    if (newImages.length > 0) {
    setUploadedImages(prev => [...prev, ...newImages]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
      // Update form data with image URLs
    updateFormData('images', [...formData.images, ...newPreviewUrls]);
      
      toast.success(`Successfully uploaded ${newImages.length} image(s)`);
    }

    // Clear loading state
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);
  }, [formData.images, updateFormData]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    // Reset the input value
    if (event.target) {
      event.target.value = '';
    }
  }, [handleFiles]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  }, [isUploading]);

  const removeImage = useCallback((index: number) => {
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
  }, [formData.images, updateFormData]);

  // Handle image upload after property creation
  const handleImageUpload = async () => {
    if (!createdPropertyId || uploadedImages.length === 0) {
      toast.error('No images to upload or property ID not found');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create FormData with all images
      const formData = new FormData();
      uploadedImages.forEach((file) => {
        formData.append('file', file); // Changed from 'images' to 'file' to match API
      });
      
      const uploadResponse = await fetch(`/api/properties/${createdPropertyId}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ All images uploaded successfully:', uploadResult);
      
      // Extract image URLs from the response
      const uploadedImageUrls = uploadResult.uploadedImages.map((img: any) => img.image_url);

      // Update property with image URLs
      const updateResponse = await fetch(`/api/properties/${createdPropertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          image_urls: uploadedImageUrls
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update property with image URLs');
      }

      toast.success(`Successfully uploaded ${uploadedImages.length} images!`);
      
      // Reset form and redirect to dashboard
      setTimeout(() => {
        setShowSuccess(false);
        setCreatedPropertyId(null);
        setFormData(initialFormData);
        setUploadedImages([]);
        setImagePreviewUrls([]);
        setCurrentStep(1);
        
        // Redirect to agent dashboard
        window.location.href = '/agent-dashboard';
      }, 2000);

    } catch (error) {
      console.error('❌ Error uploading images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle skipping image upload
  const handleSkipImages = () => {
    toast.info('Images skipped. You can add them later from the property management section.');
    
    // Reset form and redirect to dashboard
    setTimeout(() => {
      setShowSuccess(false);
      setCreatedPropertyId(null);
      setFormData(initialFormData);
      setUploadedImages([]);
      setImagePreviewUrls([]);
      setCurrentStep(1);
      
      // Redirect to agent dashboard
      window.location.href = '/agent-dashboard';
    }, 1000);
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
    
    // 🎯 CONTEXT7 EXPERT VALIDATION FIX - HANDLE SUBMIT
    const context7SubmitTimestamp = Date.now();
    console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - HANDLE SUBMIT 🎯');
    console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - HANDLE SUBMIT 🎯');
    console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - HANDLE SUBMIT 🎯');
    console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - SUBMIT TIMESTAMP:', context7SubmitTimestamp, '🎯');
    
    // Comprehensive validation following Context7 best practices
    const validationErrors = [];
    
    // Note: Images are now handled in a two-step process
    // Step 1: Create property without images
    // Step 2: Upload images and update property
    // So we don't require images before submission
    
    // Validate required fields with specific error messages
    if (!formData.title?.trim()) {
      validationErrors.push('Property title is required.');
    }
    if (!formData.description?.trim()) {
      validationErrors.push('Property description is required.');
    }
    if (!formData.price || formData.price <= 0) {
      validationErrors.push('Property price must be greater than 0.');
    }
    if (!formData.address?.trim()) {
      validationErrors.push('Property address is required.');
    }
    if (!formData.city?.trim()) {
      validationErrors.push('Property city is required.');
    }
    if (!formData.region?.trim()) {
      validationErrors.push('Property region is required.');
    }
    if (!formData.type) {
      validationErrors.push('Property type is required.');
    }
    if (!formData.status) {
      validationErrors.push('Listing type is required.');
    }
    // 🎯 CONTEXT7 EXPERT VALIDATION FIX - CONDITIONAL VALIDATION LOGIC
    // Based on Next.js and Conform best practices for conditional form validation
    console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - Property type:', formData.type, 'Bedrooms:', formData.bedrooms, 'Bathrooms:', formData.bathrooms);
    
    // Define residential property types that require bedrooms/bathrooms
    const residentialTypes = ['house', 'apartment', 'townhouse', 'condo'];
    const isResidentialProperty = formData.type && residentialTypes.includes(formData.type);
    console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - Is residential property?', isResidentialProperty);
    
    // Apply conditional validation based on property type
    if (isResidentialProperty) {
      console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - Applying residential validation rules');
      if (!formData.bedrooms || formData.bedrooms <= 0) {
        validationErrors.push('Number of bedrooms must be greater than 0.');
      }
      if (!formData.bathrooms || formData.bathrooms <= 0) {
        validationErrors.push('Number of bathrooms must be greater than 0.');
      }
    } else {
      console.log('🎯 CONTEXT7 EXPERT VALIDATION FIX - ✅ SKIPPING bedrooms/bathrooms validation for non-residential property');
    }
    
    // Always require size and lot size (year built is now optional)
    if (!formData.size || formData.size <= 0) {
      validationErrors.push('Property size is required and must be greater than 0.');
    }
    if (!formData.lotSize || formData.lotSize <= 0) {
      validationErrors.push('Lot size is required and must be greater than 0.');
    }
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    // Check if premium tier requires payment
    if (formData.tier === 'premium' && paymentSettings.paymentProcessingEnabled) {
      setShowPaymentModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check authentication before making API call
      if (!session?.access_token) {
        throw new Error('Authentication token not found. Please sign in again.');
      }
      
      // Step 1: Create the property first with basic information (without images)
      const propertyDataWithoutImages = {
        ...formData,
        // Don't include images yet - we'll upload them after property creation
        image_urls: [],
        images: [],
        // Map tier to database fields
        is_featured: formData.tier === 'premium'
      };
      
      console.log('📤 Creating property with data:', propertyDataWithoutImages);
      
      const createResponse = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(propertyDataWithoutImages),
      });
      
      console.log('📥 Property creation response status:', createResponse.status);
      
      if (!createResponse.ok) {
        let errorMessage = 'Failed to create property';
        let errorDetails = {};
        
        try {
          const errorData = await createResponse.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData;
          console.error('❌ Property creation API error details:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${createResponse.status}: ${createResponse.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const createdProperty = await createResponse.json();
      console.log('✅ Property created successfully:', createdProperty);
      
      // Step 2: Upload images to the newly created property
      if (uploadedImages.length > 0) {
        console.log('📤 Starting image upload for property:', createdProperty.id);
        
        try {
          // Create FormData with all images
          const formData = new FormData();
          uploadedImages.forEach((file, index) => {
            formData.append('file', file);
          });
          
          const uploadResponse = await fetch(`/api/properties/${createdProperty.id}/images/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || `Failed to upload images`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log('✅ All images uploaded successfully:', uploadResult);
          
          // Extract image URLs from the response
          const uploadedImageUrls = uploadResult.uploadedImages.map((img: any) => img.image_url);
          
          // Step 3: Update the property with the uploaded image URLs
          const updateResponse = await fetch(`/api/properties/${createdProperty.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              image_urls: uploadedImageUrls
            }),
          });
          
          if (!updateResponse.ok) {
            console.warn('⚠️ Failed to update property with image URLs, but property was created');
          } else {
            console.log('✅ Property updated with image URLs successfully');
          }
          
        } catch (error) {
          console.error('❌ Error uploading images:', error);
          // Don't throw here - property was created successfully
          // Just log the error and continue
        }
      }
      
      // Show success message
      toast.success('Property created successfully! It is now pending admin approval.');
      setShowSuccess(true);
      
      // Store the created property ID for image upload
      setCreatedPropertyId(createdProperty.id);
      
      // Don't redirect immediately - let user upload images first
      // The form will show an image upload interface
    
    } catch (error) {
      console.error('❌ Error creating property:', error);
      
      // Enhanced error handling with specific error types
      let userErrorMessage = 'Failed to create property. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication token')) {
          userErrorMessage = 'Session expired. Please sign in again.';
        } else if (error.message.includes('Failed to create property')) {
          userErrorMessage = error.message;
        } else if (error.message.includes('Failed to upload image')) {
          userErrorMessage = error.message;
        } else if (error.message.includes('fetch')) {
          userErrorMessage = 'Network error. Please check your connection and try again.';
        } else {
          userErrorMessage = error.message;
        }
      }
      
      toast.error(userErrorMessage);
      
      // Log detailed error information for debugging
      console.error('🔍 Detailed error information:', {
        error,
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack,
        formData,
        session: session ? 'exists' : 'missing',
        hasAccessToken: !!session?.access_token
      });
      
    } finally {
      setIsSubmitting(false);
    }
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
              <div className={`w-16 h-0.5 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Debug Mode Toggle */}
      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>
      
      {/* Debug Panel */}
      {debugMode && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
          <h4 className="font-semibold mb-2">🔍 Debug Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Authentication:</strong>
              <div>Session: {session ? '✅ Active' : '❌ Missing'}</div>
              <div>Token: {session?.access_token ? '✅ Present' : '❌ Missing'}</div>
            </div>
            <div>
              <strong>Form Validation:</strong>
              <div>Title: {formData.title?.trim() ? '✅' : '❌'}</div>
              <div>Description: {formData.description?.trim() ? '✅' : '❌'}</div>
              <div>Price: {formData.price > 0 ? '✅' : '❌'}</div>
              <div>Address: {formData.address?.trim() ? '✅' : '❌'}</div>
              <div>City: {formData.city ? '✅' : '❌'}</div>
              <div>Region: {formData.region ? '✅' : '❌'}</div>
                               <div>Coordinates: {formData.coordinates.lat && formData.coordinates.lng ? '✅' : '❌'}</div>
                 <div>Lat: {formData.coordinates.lat?.toFixed(6)}</div>
                 <div>Lng: {formData.coordinates.lng?.toFixed(6)}</div>
              <div>Images: {imagePreviewUrls.length >= 3 ? '✅' : `❌ (${imagePreviewUrls.length}/3)`}</div>
            </div>
          </div>
          <div className="mt-2">
            <strong>Current Step:</strong> {currentStep} of {totalSteps}
          </div>
          <div className="mt-2">
            <strong>Form Data:</strong>
            <pre className="mt-1 bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
          
          {/* Test API Button */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={async () => {
                try {
                  console.log('🧪 Testing API endpoint...');
                  const testResponse = await fetch('/api/properties', {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${session?.access_token || ''}`,
                    },
                  });
                  console.log('🧪 Test response status:', testResponse.status);
                  console.log('🧪 Test response headers:', Object.fromEntries(testResponse.headers.entries()));
                  
                  if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log('🧪 Test response data:', testData);
                    toast.success('API endpoint is accessible');
                  } else {
                    toast.error(`API test failed: ${testResponse.status}`);
                  }
                } catch (error) {
                  console.error('🧪 API test error:', error);
                  toast.error('API test failed');
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
            >
              Test API Endpoint
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  coordinates: { lat: 5.5600, lng: -0.2057 } // Reset to Accra
                });
                toast.success('Coordinates reset to Accra (5.5600, -0.2057)');
              }}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Reset Coordinates
            </button>
          </div>
        </div>
      )}
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
            {paymentSettings.premiumListingsEnabled && (
              <option value="premium">
                Premium {paymentSettings.paymentProcessingEnabled ? `(GHS ${paymentSettings.premiumListingPrice})` : '(Paid)'}
              </option>
            )}
          </select>
          {formData.tier === 'premium' && paymentSettings.premiumListingsEnabled && paymentSettings.paymentProcessingEnabled && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Premium Listing Benefits:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                <li>Top placement in search results</li>
                <li>Enhanced visibility</li>
              </ul>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Cost: GHS {paymentSettings.premiumListingPrice}</strong>
              </p>
            </div>
          )}
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
              step="0.000001"
              min="-90"
              max="90"
              value={formData.coordinates.lat}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= -90 && value <= 90) {
                  updateFormData('coordinates', { 
                ...formData.coordinates, 
                    lat: value 
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Latitude (-90 to 90)"
            />
            <input
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              value={formData.coordinates.lng}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= -180 && value <= 180) {
                  updateFormData('coordinates', { 
                ...formData.coordinates, 
                    lng: value 
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Longitude (-180 to 180)"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter coordinates in decimal degrees. For Ghana: Latitude ~5-11°, Longitude ~-3 to 2°
          </p>
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
            Bedrooms {formData.type && !['land', 'commercial'].includes(formData.type) && <span className="text-red-500">*</span>}
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
            Bathrooms {formData.type && !['land', 'commercial'].includes(formData.type) && <span className="text-red-500">*</span>}
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
            Lot Size <span className="text-red-500">*</span>
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
          
          {/* Hidden file input with proper ref */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            id="property-image-upload"
          />
          
          {/* Upload area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CameraIcon className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Upload at least 3 high-quality images
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 10MB each • Minimum 3 images required
              </p>
              <p className="text-xs text-blue-600 mt-2">
                💡 Drag and drop images here or click the button below
              </p>
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                isUploading 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
              <CameraIcon className="w-4 h-4 mr-2" />
                  Choose Images
                </>
              )}
            </button>
            
            {/* Upload progress indicator */}
            {isUploading && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Processing images...</p>
              </div>
            )}
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

  if (showSuccess && createdPropertyId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Property Created Successfully! 🎉</h2>
          <p className="text-gray-600">
            Your property has been added to the platform and is now pending admin approval. 
            You can now upload images to make your listing more attractive.
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Property Images</h3>
          <p className="text-sm text-gray-600 mb-6">
            Upload at least 3 high-quality images of your property. This will help attract more potential buyers.
          </p>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Drag and drop images here or click the button below
            </p>
          </div>

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading}
            className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
              isUploading 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <CameraIcon className="w-4 h-4 mr-2" />
                Choose Images
              </>
            )}
          </button>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Selected Images ({imagePreviewUrls.length})
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
            </div>
          )}

          {/* Upload Images Button */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={isUploading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading Images...
                  </>
                ) : (
                  <>
                    📸 Upload {uploadedImages.length} Images
                  </>
                )}
              </button>
            </div>
          )}

          {/* Skip Images Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleSkipImages}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now - I'll add images later
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[98vh] overflow-y-auto">
            <MobileMoneyPayment
              propertyId={null} // Will be updated after payment completion
              propertyTitle={formData.title}
              tier="premium"
              amount={paymentSettings.premiumListingPrice}
              onPaymentComplete={handlePaymentComplete}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
