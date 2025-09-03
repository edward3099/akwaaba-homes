'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  User,
  Building2,
  Phone,
  Mail,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  ArrowRight,
  Home,
  Upload
} from 'lucide-react';
import { markProfileAsCompleted, getFieldDisplayName } from '@/lib/utils/profileCompletion';

interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

interface AgentProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company_name: string;
  license_number: string;
  specializations: string[];
  experience_years: number;
  bio: string;
  profile_image: string;
  cover_image: string;
  user_role: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ProfileFormData {
  full_name: string;
  phone: string;
  company_name: string;
  license_number: string;
  specializations: string[];
  experience_years: number;
  bio: string;
  cover_image: string;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
}

export default function AgentProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionStatus | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    company_name: '',
    license_number: '',
    specializations: [],
    experience_years: 0,
    bio: '',
    cover_image: '',
    address: '',
    city: '',
    region: '',
    postal_code: ''
  });
  const [newSpecialization, setNewSpecialization] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Callback refs to ensure event handlers are attached
  const setProfileImageRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      profileImageInputRef.current = node;
      console.log('Setting profile image ref and attaching handler');
      node.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const mockEvent = {
          target: {
            files: target.files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleImageUpload(mockEvent);
      };
    }
  }, []);

  const setCoverImageRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      coverImageInputRef.current = node;
      console.log('Setting cover image ref and attaching handler');
      node.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const mockEvent = {
          target: {
            files: target.files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleCoverImageUpload(mockEvent);
      };
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Ensure file input event handlers are properly attached
  useEffect(() => {
    const attachEventHandlers = () => {
      const profileInput = document.getElementById('profile-photo-upload') as HTMLInputElement;
      const coverInput = document.getElementById('cover-image-upload') as HTMLInputElement;
      
      if (profileInput && !profileInput.onchange) {
        console.log('Attaching profile image upload handler');
        profileInput.onchange = (event) => {
          console.log('Profile image change event triggered!');
          const target = event.target as HTMLInputElement;
          const mockEvent = {
            target: {
              files: target.files
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleImageUpload(mockEvent);
        };
      }
      
      if (coverInput && !coverInput.onchange) {
        console.log('Attaching cover image upload handler');
        coverInput.onchange = (event) => {
          console.log('Cover image change event triggered!');
          const target = event.target as HTMLInputElement;
          const mockEvent = {
            target: {
              files: target.files
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleCoverImageUpload(mockEvent);
        };
      }
    };
    
    // Attach handlers immediately
    attachEventHandlers();
    
    // Also attach after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(attachEventHandlers, 100);
    
    // Use MutationObserver to watch for DOM changes and re-attach handlers
    const observer = new MutationObserver(() => {
      attachEventHandlers();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  const checkCompletion = async () => {
    try {
      const response = await fetch('/api/user/profile/completion');
      
      if (!response.ok) {
        throw new Error('Failed to check profile completion');
      }

      const completion: ProfileCompletionStatus = await response.json();
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Populate form data
      setFormData({
        full_name: data.profile.full_name || '',
        phone: data.profile.phone || '',
        company_name: data.profile.company_name || '',
        license_number: data.profile.license_number || '',
        specializations: data.profile.specializations || [],
        experience_years: data.profile.experience_years || 0,
        bio: data.profile.bio || '',
        cover_image: data.profile.cover_image || '',
        address: data.profile.address || '',
        city: data.profile.city || '',
        region: data.profile.region || '',
        postal_code: data.profile.postal_code || ''
      });

      // Check profile completion after profile is loaded
      setTimeout(async () => {
        await checkCompletion();
      }, 100);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile data');
      toast({
        title: "Error",
        description: "Failed to load your profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[] | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      handleInputChange('specializations', [...formData.specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    handleInputChange('specializations', formData.specializations.filter(s => s !== spec));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called with event:', event);
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only JPEG, PNG, and WebP images are allowed.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      console.log('Avatar upload response:', data);
      
      // Update the profile state with the new image URL
      setProfile(prev => {
        if (!prev) return null;
        const updated = { ...prev, profile_image: data.avatarUrl };
        console.log('Updated profile state:', updated);
        return updated;
      });
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only JPEG, PNG, and WebP images are allowed.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB for cover images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Cover image size cannot exceed 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingCoverImage(true);
    const formData = new FormData();
    formData.append('cover_image', file);

    try {
      const response = await fetch('/api/user/profile/cover-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload cover image');
      }

      const result = await response.json();
      
      console.log('Cover image upload response:', result);
      
      // Update the profile state with the new cover image URL
      setProfile(prev => {
        if (!prev) return null;
        const updated = { ...prev, cover_image: result.publicUrl };
        console.log('Updated profile state with cover image:', updated);
        return updated;
      });
      
      // Also refresh the profile data to ensure UI is updated
      await fetchProfile();
      
      toast({
        title: "Success",
        description: "Cover image uploaded successfully!",
      });
      handleInputChange('cover_image', result.publicUrl);
    } catch (error) {
      console.error('Cover image upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload cover image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingCoverImage(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Check completion after saving
      await checkCompletion();
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGoToDashboard = async () => {
    if (!profile?.id) return;

    try {
      // Mark profile as completed
      await markProfileAsCompleted(profile.id);
      
      toast({
        title: "Profile Complete!",
        description: "Welcome to your agent dashboard!",
      });

      // Redirect to main dashboard
      router.push('/agent-dashboard');
    } catch (error) {
      console.error('Error marking profile as completed:', error);
      toast({
        title: "Error",
        description: "Failed to complete profile setup. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Error Loading Profile</CardTitle>
            <CardDescription>
              {error || 'Unable to load your profile data'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={fetchProfile} className="mb-3">
              Try Again
            </Button>
            <div className="text-sm text-slate-600">
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in again
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVerified = profile.verification_status === 'verified';
  const isPending = profile.verification_status === 'pending';
  const isRejected = profile.verification_status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {profileCompletion?.isComplete && (
                <Link href="/agent-dashboard">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 mt-1">
                  {profileCompletion?.isComplete 
                    ? "Manage your agent profile and preferences"
                    : "Complete your profile to access the agent dashboard"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isVerified ? 'default' : isRejected ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Agent
                  </>
                ) : isRejected ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Verification Rejected
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Verification
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Completion Status */}
        {profileCompletion && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Profile Completion</span>
                </span>
                <Badge variant={profileCompletion.isComplete ? "default" : "secondary"}>
                  {profileCompletion.completionPercentage}% Complete
                </Badge>
              </CardTitle>
              <CardDescription>
                Complete all required fields to access your agent dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={profileCompletion.completionPercentage} className="w-full" />
              
              {!profileCompletion.isComplete && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Missing required fields:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileCompletion.missingFields.map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {getFieldDisplayName(field)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profileCompletion.isComplete && (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Profile Complete!</span>
                  </div>
                  <Button 
                    onClick={handleGoToDashboard}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Profile Photo</span>
              </CardTitle>
              <CardDescription>
                Add a professional photo to help clients recognize you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile.profile_image ? (
                    <img 
                      key={profile.profile_image}
                      src={profile.profile_image} 
                      alt="Profile" 
                      className="w-24 h-24 object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <div className="w-full sm:w-auto text-center sm:text-left">
                  <input
                    ref={setProfileImageRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingImage}
                    id="profile-photo-upload"
                    data-testid="profile-photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full sm:w-auto"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">
                    {uploadingImage ? 'Uploading your photo...' : 'Tap the button above to select a professional photo (max 5MB)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Cover Image</span>
              </CardTitle>
              <CardDescription>
                Add a cover image that will be displayed on your agent profile page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full h-48 sm:h-64 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 relative">
                  {profile.cover_image ? (
                    <div className="w-full h-full relative">
                      <img 
                        key={profile.cover_image}
                        src={profile.cover_image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <Camera className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                      <p className="text-sm sm:text-base">No cover image uploaded</p>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <input
                    ref={setCoverImageRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingCoverImage}
                    id="cover-image-upload"
                    data-testid="cover-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverImageInputRef.current?.click()}
                    disabled={uploadingCoverImage}
                    className="w-full sm:w-auto"
                  >
                    {uploadingCoverImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">
                    {uploadingCoverImage ? 'Uploading your cover image...' : 'Tap the button above to select a cover image (max 10MB)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Your basic personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-sm text-slate-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-700">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your business address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region || ''}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      placeholder="Enter your region"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="Enter your postal code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Professional Information</span>
              </CardTitle>
              <CardDescription>
                Your business details and professional credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  placeholder="Enter your real estate license number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience *</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 5"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell clients about your expertise, achievements, and approach to real estate..."
                  rows={4}
                />
                <p className="text-sm text-slate-500">
                  This will be displayed on your public profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Specializations</span>
              </CardTitle>
              <CardDescription>
                Select the areas of real estate you specialize in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add a specialization"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addSpecialization}
                  disabled={!newSpecialization.trim()}
                >
                  Add
                </Button>
              </div>
              
              <p className="text-sm text-slate-500">
                Examples: Residential, Commercial, Luxury Homes, Investment Properties, First-time Buyers
              </p>
            </CardContent>
          </Card>

          {/* Verification Status */}
          {!isVerified && (
            <Card className={`${isRejected ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isRejected ? 'text-red-800' : 'text-orange-800'}`}>
                  {isRejected ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  <span>
                    {isRejected ? 'Verification Rejected' : 'Verification Pending'}
                  </span>
                </CardTitle>
                <CardDescription className={isRejected ? 'text-red-700' : 'text-orange-700'}>
                  {isRejected 
                    ? 'Your agent application was not approved. Please contact support for more information.'
                    : 'Your agent application is currently under review. This process typically takes 2-3 business days.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isRejected && (
                  <Link href="/contact">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                      Contact Support
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {profileCompletion?.isComplete && (
              <Link href="/agent-dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
