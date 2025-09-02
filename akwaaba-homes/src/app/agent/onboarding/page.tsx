'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OnboardingPage() {
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    license_number: '',
    experience_years: '',
    bio: '',
    specializations: [] as string[],
    profile_image: '',
    cover_image: ''
  });
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated first
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          // User not authenticated, redirect to login
          router.push('/login?redirect=/agent/onboarding');
          return;
        }
        
        // User is authenticated, get onboarding data
        const storedData = localStorage.getItem('agentOnboarding');
        if (storedData) {
          const data = JSON.parse(storedData);
          setOnboardingData(data);
          setFormData(prev => ({
            ...prev,
            full_name: data.fullName || '',
            company_name: data.company || '',
            phone: data.phone || ''
          }));
        } else {
          // If no onboarding data, redirect to signup
          router.push('/signup');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login?redirect=/agent/onboarding');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleProfileImageUpload = async (file: File) => {
    setUploadingProfileImage(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/user/profile/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile image');
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, profile_image: data.avatarUrl }));
    } catch (err) {
      setError('Failed to upload profile image. Please try again.');
      console.error('Profile image upload error:', err);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    setUploadingCoverImage(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await fetch('/api/user/profile/cover', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload cover image');
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, cover_image: data.coverUrl }));
    } catch (err) {
      setError('Failed to upload cover image. Please try again.');
      console.error('Cover image upload error:', err);
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        const basicFields = formData.full_name && formData.phone;
        const companyRequired = (onboardingData?.userType === 'agent' || onboardingData?.userType === 'investor');
        return basicFields && (!companyRequired || formData.company_name);
      case 2:
        // Only require license and experience for agents
        if (onboardingData?.userType === 'agent') {
          return formData.license_number && formData.experience_years;
        }
        return true; // Skip step 2 for non-agents
      case 3:
        return formData.bio && formData.specializations.length > 0;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      
      // Skip step 2 for non-agents
      if (currentStep === 1 && onboardingData?.userType !== 'agent') {
        setCurrentStep(3); // Skip to step 3
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handlePreviousStep = () => {
    // Skip step 2 for non-agents when going back
    if (currentStep === 3 && onboardingData?.userType !== 'agent') {
      setCurrentStep(1); // Go back to step 1
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Save the profile data to the database
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          company_name: formData.company_name,
          license_number: formData.license_number,
          experience_years: parseInt(formData.experience_years),
          bio: formData.bio,
          specializations: formData.specializations,
          profile_image: formData.profile_image,
          cover_image: formData.cover_image,
          // Mark as onboarding completed
          onboarding_completed: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save profile data');
      }
      
      setSuccess('Profile setup completed successfully! Please check your email to verify your account, then you can sign in.');
      
      // Clear onboarding data
      localStorage.removeItem('agentOnboarding');
      
      // Redirect to login with a message about email verification
      setTimeout(() => {
        router.push('/login?message=profile-setup-complete&email=' + encodeURIComponent(onboardingData?.email || ''));
      }, 3000);
      
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Profile save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            {(onboardingData?.userType === 'agent' || onboardingData?.userType === 'investor') && (
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                type="text"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                placeholder="Enter your real estate license number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience *</Label>
              <Select
                value={formData.experience_years}
                onValueChange={(value) => handleInputChange('experience_years', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select years of experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Less than 1 year</SelectItem>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="4">4 years</SelectItem>
                  <SelectItem value="5">5 years</SelectItem>
                  <SelectItem value="6">6-10 years</SelectItem>
                  <SelectItem value="11">11-15 years</SelectItem>
                  <SelectItem value="16">16-20 years</SelectItem>
                  <SelectItem value="21">More than 20 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {formData.profile_image ? (
                    <img 
                      src={formData.profile_image} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleProfileImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="profile-upload"
                    disabled={uploadingProfileImage}
                  />
                  <label
                    htmlFor="profile-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                      uploadingProfileImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingProfileImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Profile Photo'
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Photo Upload */}
            <div className="space-y-2">
              <Label>Cover Photo</Label>
              <div className="space-y-2">
                <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {formData.cover_image ? (
                    <img 
                      src={formData.cover_image} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">🏠</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCoverImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="cover-upload"
                    disabled={uploadingCoverImage}
                  />
                  <label
                    htmlFor="cover-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                      uploadingCoverImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingCoverImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Cover Photo'
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x400px or similar wide format
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your experience and expertise in real estate..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Specializations *</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Residential Sales',
                  'Commercial Real Estate',
                  'Property Management',
                  'Real Estate Investment',
                  'Luxury Properties',
                  'First-time Buyers',
                  'Property Development',
                  'Real Estate Consulting'
                ].map((specialization) => (
                  <label key={specialization} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(specialization)}
                      onChange={() => handleSpecializationChange(specialization)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{specialization}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">🏠</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-gray-600">
            Step {onboardingData?.userType === 'agent' ? currentStep : (currentStep === 3 ? 2 : currentStep)} of {onboardingData?.userType === 'agent' ? 3 : 2}: Set up your professional profile
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {(onboardingData?.userType === 'agent' ? [1, 2, 3] : [1, 2]).map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSteps.includes(step)
                      ? 'bg-green-600 text-white'
                      : currentStep === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {completedSteps.includes(step) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Basic Info</span>
              {onboardingData?.userType === 'agent' ? <span>Credentials</span> : <span>Specializations</span>}
              {onboardingData?.userType === 'agent' && <span>Specializations</span>}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {renderStepContent()}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1 || isLoading}
            >
              Previous
            </Button>
            
            {(onboardingData?.userType === 'agent' ? currentStep < 3 : currentStep < 3) ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Setup...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
