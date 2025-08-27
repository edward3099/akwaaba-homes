'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
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
  Camera
} from 'lucide-react';

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
}

export default function AgentProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    company_name: '',
    license_number: '',
    specializations: [],
    experience_years: 0,
    bio: ''
  });
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

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
        bio: data.profile.bio || ''
      });
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
              <Link href="/agent/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 mt-1">
                  Manage your agent profile and preferences
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
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profile_image ? (
                    <img 
                      src={profile.profile_image} 
                      alt="Profile" 
                      className="w-24 h-24 object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <div>
                  <Button variant="outline" disabled>
                    Upload Photo
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">
                    Photo upload functionality coming soon
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
            <Link href="/agent/dashboard">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
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
