'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Star,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

interface Developer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  bio?: string;
  location?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  cover_image_url?: string;
  properties_count?: number;
  last_active?: string;
}

interface DeveloperStats {
  total: number;
  verified: number;
  pending: number;
  active: number;
}

export default function DeveloperManagement() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [stats, setStats] = useState<DeveloperStats>({
    total: 0,
    verified: 0,
    pending: 0,
    active: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    bio: '',
    location: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [developers, searchTerm, filterStatus]);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/developers');
      if (!response.ok) throw new Error('Failed to fetch developers');
      
      const data = await response.json();
      setDevelopers(data.developers || []);
      
      // Calculate stats
      const total = data.developers?.length || 0;
      const verified = data.developers?.filter((d: Developer) => d.is_verified).length || 0;
      const pending = data.developers?.filter((d: Developer) => !d.is_verified).length || 0;
      const active = data.developers?.filter((d: Developer) => {
        const lastActive = new Date(d.last_active || d.updated_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      }).length || 0;
      
      setStats({ total, verified, pending, active });
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    let filtered = developers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dev => 
        dev.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(dev => {
        switch (filterStatus) {
          case 'verified':
            return dev.is_verified;
          case 'pending':
          case 'unverified':
            return !dev.is_verified;
          default:
            return true;
        }
      });
    }

    setFilteredDevelopers(filtered);
  };

  const handleViewDetails = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setShowDetailsDialog(true);
  };

  const handleEditDeveloper = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setEditForm({
      full_name: developer.full_name || '',
      phone: developer.phone || '',
      company_name: developer.company_name || '',
      bio: developer.bio || '',
      location: developer.location || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateDeveloper = async () => {
    if (!selectedDeveloper) return;

    try {
      const response = await fetch(`/api/admin/developers/${selectedDeveloper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Failed to update developer');

      await fetchDevelopers();
      setShowEditDialog(false);
      setSelectedDeveloper(null);
    } catch (error) {
      console.error('Error updating developer:', error);
    }
  };

  const handleToggleVerification = async (developer: Developer) => {
    try {
      const response = await fetch(`/api/admin/developers/${developer.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !developer.is_verified })
      });

      if (!response.ok) throw new Error('Failed to toggle verification');

      await fetchDevelopers();
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const handleDeleteDeveloper = async () => {
    if (!selectedDeveloper) return;

    try {
      const response = await fetch(`/api/admin/developers/${selectedDeveloper.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete developer');

      await fetchDevelopers();
      setShowDeleteDialog(false);
      setSelectedDeveloper(null);
    } catch (error) {
      console.error('Error deleting developer:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (developer: Developer) => {
    if (developer.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Management</h1>
          <p className="text-gray-600">Manage and monitor developer accounts</p>
        </div>
        <Button onClick={fetchDevelopers} variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Developers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'verified' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('verified')}
                size="sm"
              >
                Verified
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developers List */}
      <Card>
        <CardHeader>
          <CardTitle>Developers ({filteredDevelopers.length})</CardTitle>
          <CardDescription>
            Manage developer accounts and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDevelopers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No developers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevelopers.map((developer) => (
                <div
                  key={developer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {developer.avatar_url ? (
                        <img
                          src={developer.avatar_url}
                          alt={developer.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {developer.full_name}
                        </p>
                        {getStatusBadge(developer)}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{developer.email}</p>
                      {developer.company_name && (
                        <p className="text-sm text-gray-500 truncate">
                          {developer.company_name}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Joined {formatDate(developer.created_at)}</span>
                        {developer.properties_count !== undefined && (
                          <span>{developer.properties_count} properties</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(developer)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDeveloper(developer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleVerification(developer)}
                        >
                          {developer.is_verified ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Verify
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDeveloper(developer);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Developer Details</DialogTitle>
            <DialogDescription>
              View detailed information about this developer
            </DialogDescription>
          </DialogHeader>
          {selectedDeveloper && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedDeveloper.avatar_url ? (
                    <img
                      src={selectedDeveloper.avatar_url}
                      alt={selectedDeveloper.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDeveloper.full_name}</h3>
                  <p className="text-gray-500">{selectedDeveloper.email}</p>
                  {getStatusBadge(selectedDeveloper)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDeveloper.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedDeveloper.phone}</span>
                  </div>
                )}
                {selectedDeveloper.company_name && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedDeveloper.company_name}</span>
                  </div>
                )}
                {selectedDeveloper.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedDeveloper.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Joined {formatDate(selectedDeveloper.created_at)}</span>
                </div>
              </div>

              {selectedDeveloper.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm text-gray-600">{selectedDeveloper.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Properties:</span> {selectedDeveloper.properties_count || 0}
                </div>
                <div>
                  <span className="font-medium">Last Active:</span> {formatDate(selectedDeveloper.last_active || selectedDeveloper.updated_at)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Developer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Developer</DialogTitle>
            <DialogDescription>
              Update developer information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={editForm.company_name}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDeveloper}>
              Update Developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Developer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this developer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDeveloper && (
            <div className="py-4">
              <p className="font-medium">{selectedDeveloper.full_name}</p>
              <p className="text-sm text-gray-500">{selectedDeveloper.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeveloper}>
              Delete Developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
