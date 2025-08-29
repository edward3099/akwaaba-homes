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
  Camera,
  Home,
  Settings
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  user_role: 'customer' | 'agent' | 'admin';
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileFormData {
  full_name: string;
  phone: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to appropriate login based on intended destination
          window.location.href = '/auth';
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Populate form data
      setFormData({
        full_name: data.profile.full_name || '',
        phone: data.profile.phone || ''
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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'customer':
        return 'Customer';
      case 'agent':
        return 'Real Estate Agent';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'agent':
        return 'default';
      case 'customer':
        return 'secondary';
      default:
        return 'outline';
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
              <Link href="/auth" className="text-blue-600 hover:underline">
                Sign in again
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 mt-1">
                  Manage your account profile and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getRoleBadgeVariant(profile.user_role)} className="text-xs">
                {getRoleDisplayName(profile.user_role)}
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
                Add a profile photo to personalize your account
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

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and role information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(profile.user_role)}>
                      {getRoleDisplayName(profile.user_role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Your account role and permissions
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <Input
                    value={new Date(profile.created_at).toLocaleDateString()}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Actions */}
          {profile.user_role === 'agent' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Agent Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Access your agent-specific features and tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Link href="/agent-dashboard">
                    <Button variant="outline" className="w-full">
                      Go to Agent Dashboard
                    </Button>
                  </Link>
                  <Link href="/agent/profile">
                    <Button variant="outline">
                      <User className="w-4 h-4 mr-2" />
                      Agent Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {profile.user_role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Admin Panel</span>
                </CardTitle>
                <CardDescription>
                  Access administrative tools and system management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/">
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
