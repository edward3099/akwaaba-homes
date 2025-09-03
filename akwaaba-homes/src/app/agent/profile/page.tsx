'use client';
// Version: 2025-01-02 - React Dropzone implementation - FORCE DEPLOYMENT

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
import { FileUploadDropzone } from '@/components/ui/file-upload-dropzone';
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

  useEffect(() => {
    fetchProfile();
  }, []);

  // Ensure event handlers are attached as fallback - more aggressive approach
  useEffect(() => {
    const attachEventHandlers = () => {
      const profileInput = document.getElementById('profile-photo-upload') as HTMLInputElement;
      const coverInput = document.getElementById('cover-image-upload') as HTMLInputElement;
      
      console.log('Attempting to attach event handlers...');
      console.log('Profile input found:', !!profileInput);
      console.log('Cover input found:', !!coverInput);
      
      if (profileInput) {
        console.log('Attaching profile image handler');
        profileInput.onchange = async (event) => {
          console.log('Profile image change event triggered!');
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          console.log('File selected:', file);
          
          if (!file) return;
          
          try {
            console.log('Starting profile image upload...');
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await fetch('/api/user/profile/avatar', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            console.log('Profile image upload response:', result);
            
            if (result.success) {
              // Update the profile image display
              const profileImg = document.querySelector('img[alt="Profile"]') as HTMLImageElement;
              if (profileImg) {
                profileImg.src = result.avatarUrl + '?t=' + Date.now();
                console.log('Profile image updated successfully');
              }
              // Also update the React state
              setProfile(prev => prev ? { ...prev, profile_image: result.avatarUrl } : null);
            }
          } catch (error) {
            console.error('Profile image upload error:', error);
          }
        };
      }
      
      if (coverInput) {
        console.log('Attaching cover image handler');
        coverInput.onchange = async (event) => {
          console.log('Cover image change event triggered!');
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          console.log('File selected:', file);
          
          if (!file) return;
          
          try {
            console.log('Starting cover image upload...');
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/user/profile/cover-image', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            console.log('Cover image upload response:', result);
            
            if (result.success) {
              // Update the cover image display
              const coverImg = document.querySelector('img[alt="Cover"]') as HTMLImageElement;
              if (coverImg) {
                coverImg.src = result.coverImageUrl + '?t=' + Date.now();
                console.log('Cover image updated successfully');
              }
              // Also update the React state
              setProfile(prev => prev ? { ...prev, cover_image: result.coverImageUrl } : null);
            }
          } catch (error) {
            console.error('Cover image upload error:', error);
          }
        };
      }
    };
    
    // Try multiple times to ensure handlers are attached
    const timeoutId1 = setTimeout(attachEventHandlers, 100);
    const timeoutId2 = setTimeout(attachEventHandlers, 500);
    const timeoutId3 = setTimeout(attachEventHandlers, 1000);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, []);

  // New handlers for React Dropzone component
  const handleProfileImageChange = async (file: File) => {
    console.log('handleProfileImageChange called with file:', file);
    
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

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Profile image must be less than 5MB.",
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
        throw new Error('Failed to upload profile image');
      }

      const result = await response.json();
      
      // Update the profile state
      setProfile(prev => ({
        ...prev,
        profile_image: result.avatar_url
      }));

      toast({
        title: "Success",
        description: "Profile image updated successfully!",
      });

      // Check completion status
      await checkCompletion();
      
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      const response = await fetch('/api/user/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove profile image');
      }

      setProfile(prev => ({
        ...prev,
        profile_image: ''
      }));

      toast({
        title: "Success",
        description: "Profile image removed successfully!",
      });

      await checkCompletion();
      
    } catch (error) {
      console.error('Error removing profile image:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove profile image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCoverImageChange = async (file: File) => {
    console.log('handleCoverImageChange called with file:', file);
    
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

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Cover image must be less than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingCoverImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/user/profile/cover-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload cover image');
      }

      const result = await response.json();
      
      // Update the profile state
      setProfile(prev => ({
        ...prev,
        cover_image: result.cover_image_url
      }));

      toast({
        title: "Success",
        description: "Cover image updated successfully!",
      });

      // Check completion status
      await checkCompletion();
      
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload cover image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const handleRemoveCoverImage = async () => {
    try {
      const response = await fetch('/api/user/profile/cover-image', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove cover image');
      }

      setProfile(prev => ({
        ...prev,
        cover_image: ''
      }));

      toast({
        title: "Success",
        description: "Cover image removed successfully!",
      });

      await checkCompletion();
      
    } catch (error) {
      console.error('Error removing cover image:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove cover image. Please try again.",
        variant: "destructive"
      });
    }
  };

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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
          {/* Mobile: Stack vertically, Desktop: Horizontal layout - FORCE VERCEL DEPLOYMENT */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Left side: Back button and title */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              {/* Back to Dashboard Button */}
              {profileCompletion?.isComplete && (
                <Link href="/agent-dashboard">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              )}
              
              {/* Title Section */}
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Profile Settings</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  {profileCompletion?.isComplete 
                    ? "Manage your agent profile and preferences"
                    : "Complete your profile to access the agent dashboard"
                  }
                </p>
              </div>
            </div>
            
            {/* Right side: Badge */}
            <div className="flex justify-start sm:justify-end">
              <Badge 
                variant={isVerified ? 'default' : isRejected ? 'destructive' : 'secondary'}
                className="text-xs px-2 py-1 sm:px-3"
              >
                {isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Verified Agent</span>
                    <span className="sm:hidden">Verified</span>
                  </>
                ) : isRejected ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Verification Rejected</span>
                    <span className="sm:hidden">Rejected</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Pending Verification</span>
                    <span className="sm:hidden">Pending</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-8">
        {/* Profile Completion Status */}
        {profileCompletion && (
          <Card className="mb-6 sm:mb-8 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <span className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-base sm:text-lg">Profile Completion</span>
                </span>
                <Badge variant={profileCompletion.isComplete ? "default" : "secondary"} className="w-fit text-xs">
                  {profileCompletion.completionPercentage}% Complete
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
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
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Profile Complete!</span>
                  </div>
                  <Button 
                    onClick={handleGoToDashboard}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Profile Image Section */}
          <FileUploadDropzone
            title="Profile Photo"
            description="Add a professional photo to help clients recognize you"
            currentImageUrl={profile.profile_image}
            onFileSelect={handleProfileImageChange}
            onFileRemove={handleRemoveProfileImage}
            uploadButtonText="Choose Photo"
            removeButtonText="Remove Photo"
            maxSize={5 * 1024 * 1024} // 5MB
            accept={{
              'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
            }}
          />

          {/* Cover Image Section */}
          <FileUploadDropzone
            title="Cover Image"
            description="Add a cover image that will be displayed on your agent profile page"
            currentImageUrl={profile.cover_image}
            onFileSelect={handleCoverImageChange}
            onFileRemove={handleRemoveCoverImage}
            uploadButtonText="Choose Cover Image"
            removeButtonText="Remove Cover Image"
            maxSize={10 * 1024 * 1024} // 10MB
            accept={{
              'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
            }}
          />

          {/* Personal Information */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Your basic personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-slate-50 min-h-[44px]"
                  />
                  <p className="text-xs sm:text-sm text-slate-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-700">Address Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your business address"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm font-medium">Region</Label>
                    <Input
                      id="region"
                      value={formData.region || ''}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      placeholder="Enter your region"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-sm font-medium">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="Enter your postal code"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Professional Information</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Your business details and professional credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-sm font-medium">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter your company name"
                  required
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number" className="text-sm font-medium">License Number *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  placeholder="Enter your real estate license number"
                  required
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years" className="text-sm font-medium">Years of Experience *</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 5"
                  min="0"
                  max="50"
                  required
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell clients about your expertise, achievements, and approach to real estate..."
                  rows={4}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs sm:text-sm text-slate-500">
                  This will be displayed on your public profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Specializations</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Select the areas of real estate you specialize in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs sm:text-sm px-2 py-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="ml-2 hover:text-red-600 text-sm"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add a specialization"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  className="min-h-[44px]"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addSpecialization}
                  disabled={!newSpecialization.trim()}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  Add
                </Button>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-500">
                Examples: Residential, Commercial, Luxury Homes, Investment Properties, First-time Buyers
              </p>
            </CardContent>
          </Card>

          {/* Verification Status */}
          {!isVerified && (
            <Card className={`overflow-hidden ${isRejected ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center space-x-2 text-base sm:text-lg ${isRejected ? 'text-red-800' : 'text-orange-800'}`}>
                  {isRejected ? <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span>
                    {isRejected ? 'Verification Rejected' : 'Verification Pending'}
                  </span>
                </CardTitle>
                <CardDescription className={`text-sm ${isRejected ? 'text-red-700' : 'text-orange-700'}`}>
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
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-4">
            {profileCompletion?.isComplete && (
              <Link href="/agent-dashboard">
                <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <Button type="submit" disabled={saving} className="w-full sm:w-auto min-h-[44px]">
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
