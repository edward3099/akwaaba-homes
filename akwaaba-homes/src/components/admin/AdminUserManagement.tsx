'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Mail, 
  Phone, 
  Building2,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  user_role: string;
  verification_status: string;
  is_verified: boolean;
  phone?: string;
  company_name?: string;
  business_type?: string;
  license_number?: string;
  experience_years?: number;
  bio?: string;
  created_at: string;
  last_login?: string;
}

interface CreateAdminForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  business_type: string;
  license_number: string;
  experience_years: number;
  bio: string;
  permissions: string[];
}

interface EditAdminForm extends Partial<CreateAdminForm> {
  id: string;
  user_role: string;
  verification_status: string;
  is_verified: boolean;
}

export default function AdminUserManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [createForm, setCreateForm] = useState<CreateAdminForm>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    business_type: '',
    license_number: '',
    experience_years: 0,
    bio: '',
    permissions: ['read', 'write']
  });

  const [editForm, setEditForm] = useState<EditAdminForm>({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    business_type: '',
    license_number: '',
    experience_years: 0,
    bio: '',
    user_role: 'admin',
    verification_status: 'pending',
    is_verified: false,
    permissions: ['read', 'write']
  });

  const { toast } = useToast();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access admin features.",
          variant: "destructive"
        });
        return;
      }

      // Fetch admin users from the API
      const response = await fetch('/api/admin/create-admin', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.admins || []);
      } else {
        throw new Error('Failed to fetch admin users');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new admin
  const handleCreateAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access admin features.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          first_name: createForm.first_name,
          last_name: createForm.last_name,
          phone: createForm.phone,
          company_name: createForm.company_name,
          business_type: createForm.business_type,
          license_number: createForm.license_number,
          experience_years: createForm.experience_years,
          bio: createForm.bio
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin account created successfully.",
        });
        setIsCreateModalOpen(false);
        setCreateForm({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          phone: '',
          company_name: '',
          business_type: '',
          license_number: '',
          experience_years: 0,
          bio: '',
          permissions: ['read', 'write']
        });
        fetchAdminUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create admin account. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update admin
  const handleUpdateAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access admin features.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/create-admin/${editForm.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          company_name: editForm.company_name,
          business_type: editForm.business_type,
          license_number: editForm.license_number,
          experience_years: editForm.experience_years,
          bio: editForm.bio,
          user_role: editForm.user_role,
          verification_status: editForm.verification_status,
          is_verified: editForm.is_verified
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin account updated successfully.",
        });
        setIsEditModalOpen(false);
        fetchAdminUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin account');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update admin account. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete admin
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access admin features.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/create-admin/${selectedAdmin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin account deleted successfully.",
        });
        setIsDeleteModalOpen(false);
        setSelectedAdmin(null);
        fetchAdminUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete admin account');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete admin account. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Open edit modal
  const openEditModal = (admin: AdminUser) => {
    setEditForm({
      id: admin.id,
      email: admin.email,
      first_name: admin.full_name.split(' ')[0] || '',
      last_name: admin.full_name.split(' ').slice(1).join(' ') || '',
      phone: admin.phone || '',
      company_name: admin.company_name || '',
      business_type: admin.business_type || '',
      license_number: admin.license_number || '',
      experience_years: admin.experience_years || 0,
      bio: admin.bio || '',
      user_role: admin.user_role,
      verification_status: admin.verification_status,
      is_verified: admin.is_verified,
      permissions: ['read', 'write']
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // Filter and sort admin users
  const filteredAndSortedAdmins = adminUsers
    .filter(admin => {
      const matchesSearch = admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || admin.user_role === filterRole;
      const matchesStatus = filterStatus === 'all' || admin.verification_status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof AdminUser];
      let bValue: any = b[sortBy as keyof AdminUser];
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Admin</Badge>;
      case 'super_admin':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Super Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600">Manage admin accounts and permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="full_name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="user_role">Role</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full sm:w-auto"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.full_name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                          {admin.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(admin.user_role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(admin.verification_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.company_name || '-'}</div>
                      {admin.business_type && (
                        <div className="text-sm text-gray-500">{admin.business_type}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(admin)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedAdmins.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No admin users found</div>
              <div className="text-sm text-gray-400 mt-1">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first admin user'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Admin Account</DialogTitle>
            <DialogDescription>
              Create a new admin account with appropriate permissions and verification status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-password">Password *</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-first-name">First Name *</Label>
              <Input
                id="create-first-name"
                value={createForm.first_name}
                onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-last-name">Last Name *</Label>
              <Input
                id="create-last-name"
                value={createForm.last_name}
                onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-phone">Phone *</Label>
              <Input
                id="create-phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+233 XX XXX XXXX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-company">Company Name *</Label>
              <Input
                id="create-company"
                value={createForm.company_name}
                onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                placeholder="Company Ltd."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-business-type">Business Type *</Label>
              <Input
                id="create-business-type"
                value={createForm.business_type}
                onChange={(e) => setCreateForm({ ...createForm, business_type: e.target.value })}
                placeholder="Real Estate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-license">License Number *</Label>
              <Input
                id="create-license"
                value={createForm.license_number}
                onChange={(e) => setCreateForm({ ...createForm, license_number: e.target.value })}
                placeholder="RE123456"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-experience">Years of Experience *</Label>
              <Input
                id="create-experience"
                type="number"
                value={createForm.experience_years}
                onChange={(e) => setCreateForm({ ...createForm, experience_years: parseInt(e.target.value) || 0 })}
                placeholder="5"
                min="0"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="create-bio">Bio *</Label>
            <Textarea
              id="create-bio"
              value={createForm.bio}
              onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
              placeholder="Tell us about your experience and expertise..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin}>
              Create Admin
            </Button>
          </DialogFooter>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-first-name">First Name *</Label>
              <Input
                id="edit-first-name"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-last-name">Last Name *</Label>
              <Input
                id="edit-last-name"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+233 XX XXX XXXX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company Name *</Label>
              <Input
                id="edit-company"
                value={editForm.company_name}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                placeholder="Company Ltd."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-business-type">Business Type *</Label>
              <Input
                id="edit-business-type"
                value={editForm.business_type}
                onChange={(e) => setEditForm({ ...editForm, business_type: e.target.value })}
                placeholder="Real Estate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-license">License Number *</Label>
              <Input
                id="edit-license"
                value={editForm.license_number}
                onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                placeholder="RE123456"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-experience">Years of Experience *</Label>
              <Input
                id="edit-experience"
                type="number"
                value={editForm.experience_years}
                onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })}
                placeholder="5"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">User Role</Label>
              <Select value={editForm.user_role} onValueChange={(value) => setEditForm({ ...editForm, user_role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Verification Status</Label>
              <Select value={editForm.verification_status} onValueChange={(value) => setEditForm({ ...editForm, verification_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio *</Label>
            <Textarea
              id="edit-bio"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Tell us about your experience and expertise..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-verified"
              checked={editForm.is_verified || false}
              onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="edit-verified">Mark as verified</Label>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAdmin}>
              Update Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this admin account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmin && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to delete the admin account for <strong>{selectedAdmin.full_name}</strong> ({selectedAdmin.email}).
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
