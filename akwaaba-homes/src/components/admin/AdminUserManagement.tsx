'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useApiMutation, useFormMutation, useDestructiveMutation } from '@/lib/hooks/useApiMutation';
import { adminValidationSchema, type AdminFormData } from '@/lib/utils/formValidation';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone,
  Building,
  Award,
  Calendar
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  business_type: string;
  license_number: string;
  experience_years: number;
  bio: string;
  user_role: string;
  created_at: string;
  last_sign_in_at?: string;
  is_verified: boolean;
}

export default function AdminUserManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  // Form setup with React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch
  } = useForm<AdminFormData>({
    resolver: async (data) => {
      try {
        const validatedData = adminValidationSchema.parse(data);
        return {
          values: validatedData,
          errors: {},
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            values: {},
            errors: {
              root: {
                type: 'manual',
                message: error.message,
              },
            },
          };
        }
        return {
          values: {},
          errors: {
            root: {
              type: 'manual',
              message: 'Validation failed',
            },
          },
        };
      }
    }
  });

  // API mutation hooks
  const createAdminMutation = useFormMutation({
    successMessage: 'Admin account created successfully',
    errorMessage: 'Failed to create admin account',
    loadingMessage: 'Creating admin account...',
    onSuccess: () => {
      setIsCreateModalOpen(false);
      reset();
      fetchAdminUsers();
    }
  });

  const updateAdminMutation = useFormMutation({
    successMessage: 'Admin account updated successfully',
    errorMessage: 'Failed to update admin account',
    loadingMessage: 'Updating admin account...',
    onSuccess: () => {
      setIsEditModalOpen(false);
      setEditingUser(null);
      reset();
      fetchAdminUsers();
    }
  });

  const deleteAdminMutation = useDestructiveMutation({
    successMessage: 'Admin account deleted successfully',
    errorMessage: 'Failed to delete admin account',
    loadingMessage: 'Deleting admin account...',
    confirmationMessage: 'Are you sure you want to delete this admin account? This action cannot be undone.',
    confirmationTitle: 'Delete Admin Account',
    onSuccess: () => {
      fetchAdminUsers();
    }
  });

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication Error', {
          description: 'Please log in to access admin features.',
        });
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const users = await response.json();
        setAdminUsers(users);
      } else {
        throw new Error('Failed to fetch admin users');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Error', {
        description: 'Failed to fetch admin users. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Handle create admin
  const onSubmitCreate = async (data: AdminFormData) => {
    await createAdminMutation.submitForm(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to access admin features.');
      }

      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin account');
      }

      return await response.json();
    });
  };

  // Handle update admin
  const onSubmitUpdate = async (data: AdminFormData) => {
    if (!editingUser) return;

    await updateAdminMutation.submitForm(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to access admin features.');
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin account');
      }

      return await response.json();
    });
  };

  // Handle delete admin
  const handleDeleteAdmin = async (userId: string) => {
    await deleteAdminMutation.executeWithConfirmation(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to access admin features.');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete admin account');
      }

      return await response.json();
    });
  };

  // Open edit modal
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setValue('email', user.email);
    setValue('first_name', user.first_name);
    setValue('last_name', user.last_name);
    setValue('phone', user.phone);
    setValue('company_name', user.company_name);
    setValue('business_type', user.business_type);
    setValue('license_number', user.license_number);
    setValue('experience_years', user.experience_years);
    setValue('bio', user.bio);
    setValue('permissions', ['read', 'write']);
    setValue('role', 'admin');
    setIsEditModalOpen(true);
  };

  // Filter and search users
  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || user.user_role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  // Reset form when modal closes
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    reset();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600">Manage admin accounts and permissions</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-ghana-green hover:bg-ghana-green-dark text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Admin
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}+${user.last_name}`} />
                      <AvatarFallback className="bg-ghana-green text-white">
                        {user.first_name[0]}{user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.first_name} {user.last_name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.user_role === 'super_admin' ? 'destructive' : 'default'}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.user_role.replace('_', ' ')}
                    </Badge>
                    {user.is_verified && (
                      <Badge variant="secondary" className="bg-ghana-gold text-ghana-red">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-3 h-3 mr-2" />
                  {user.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-3 h-3 mr-2" />
                  {user.company_name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-3 h-3 mr-2" />
                  {user.business_type}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-3 h-3 mr-2" />
                  {user.experience_years} years experience
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(user)}
                    className="border-ghana-gold text-ghana-gold hover:bg-ghana-gold hover:text-white"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAdmin(user.id)}
                    className="border-ghana-red text-ghana-red hover:bg-ghana-red hover:text-white"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Admin Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Admin Account</DialogTitle>
            <DialogDescription>
              Create a new admin account with appropriate permissions and verification status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  {...register('email')}
                  placeholder="admin@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-first-name">First Name *</Label>
                <Input
                  id="create-first-name"
                  {...register('first_name')}
                  placeholder="John"
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-last-name">Last Name *</Label>
                <Input
                  id="create-last-name"
                  {...register('last_name')}
                  placeholder="Doe"
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-phone">Phone *</Label>
                <Input
                  id="create-phone"
                  {...register('phone')}
                  placeholder="+233 20 123 4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-company-name">Company Name *</Label>
                <Input
                  id="create-company-name"
                  {...register('company_name')}
                  placeholder="Company Ltd."
                  className={errors.company_name ? 'border-red-500' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-red-500">{errors.company_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-business-type">Business Type *</Label>
                <Select onValueChange={(value) => setValue('business_type', value)}>
                  <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="property_development">Property Development</SelectItem>
                    <SelectItem value="property_management">Property Management</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="legal">Legal Services</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.business_type && (
                  <p className="text-sm text-red-500">{errors.business_type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-license-number">License Number *</Label>
                <Input
                  id="create-license-number"
                  {...register('license_number')}
                  placeholder="GH123456"
                  className={errors.license_number ? 'border-red-500' : ''}
                />
                {errors.license_number && (
                  <p className="text-sm text-red-500">{errors.license_number.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-experience-years">Experience (Years)</Label>
                <Input
                  id="create-experience-years"
                  type="number"
                  {...register('experience_years', { valueAsNumber: true })}
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-bio">Bio *</Label>
              <Textarea
                id="create-bio"
                {...register('bio')}
                placeholder="Tell us about your experience and expertise..."
                rows={3}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseCreateModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createAdminMutation.isLoading}
                className="bg-ghana-green hover:bg-ghana-green-dark text-white"
              >
                {createAdminMutation.isLoading ? 'Creating...' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin Account</DialogTitle>
            <DialogDescription>
              Update admin account information and permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
            {/* Same form fields as create modal, but with edit values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name *</Label>
                <Input
                  id="edit-first-name"
                  {...register('first_name')}
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name *</Label>
                <Input
                  id="edit-last-name"
                  {...register('last_name')}
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-company-name">Company Name *</Label>
                <Input
                  id="edit-company-name"
                  {...register('company_name')}
                  className={errors.company_name ? 'border-red-500' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-red-500">{errors.company_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-business-type">Business Type *</Label>
                <Select onValueChange={(value) => setValue('business_type', value)}>
                  <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="property_development">Property Development</SelectItem>
                    <SelectItem value="property_management">Property Management</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="legal">Legal Services</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.business_type && (
                  <p className="text-sm text-red-500">{errors.business_type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-license-number">License Number *</Label>
                <Input
                  id="edit-license-number"
                  {...register('license_number')}
                  className={errors.license_number ? 'border-red-500' : ''}
                />
                {errors.license_number && (
                  <p className="text-sm text-red-500">{errors.license_number.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-experience-years">Experience (Years)</Label>
                <Input
                  id="edit-experience-years"
                  type="number"
                  {...register('experience_years', { valueAsNumber: true })}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio *</Label>
              <Textarea
                id="edit-bio"
                {...register('bio')}
                rows={3}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseEditModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || updateAdminMutation.isLoading}
                className="bg-ghana-green hover:bg-ghana-green-dark text-white"
              >
                {updateAdminMutation.isLoading ? 'Updating...' : 'Update Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
