'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Clock, Building2, MapPin, Bed, Bath, Square, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPropertyApprovalsPage() {
  const [properties, setProperties] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch pending properties on component mount
  React.useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/properties/approvals', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending properties: ${response.status}`);
      }
      
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch pending properties');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string) => {
    // TODO: Implement review functionality - could open a modal with details
    console.log('Review requested for property:', id);
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/admin/properties/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: id,
          action: 'approve'
        })
      });

      if (response.ok) {
        toast.success('Property approved successfully!');
        // Refresh the data
        fetchPendingProperties();
      } else {
        const error = await response.json();
        toast.error(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving property:', error);
      alert(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch('/api/admin/properties/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: id,
          action: 'reject',
          reason
        })
      });

      if (response.ok) {
        toast.success('Property rejected successfully!');
        // Refresh the data
        fetchPendingProperties();
      } else {
        const error = await response.json();
        toast.error(`Failed to reject: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      alert(`Failed to reject: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading pending properties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Property Approvals</h1>
          <p className="text-muted-foreground">Review and manage pending property listing approvals</p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Properties</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPendingProperties} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Property Approvals</h1>
        <p className="text-muted-foreground">Review and manage pending property listing approvals</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(properties.reduce((sum, p) => sum + (p.price || 0), 0))}</div>
            <p className="text-xs text-muted-foreground">Combined property value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(properties.map(p => p.profiles?.full_name || 'Unknown')).size}</div>
            <p className="text-xs text-muted-foreground">Unique agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Property Approvals</CardTitle>
          <CardDescription>Review and approve or reject property listing requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {properties.map((property) => (
              <div key={property.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{property.title}</h3>
                        {getStatusBadge(property.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>Agent: {property.agent}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>Company: {property.company}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{property.location}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {property.bedrooms > 0 && (
                            <div className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              {property.bedrooms} bed
                            </div>
                          )}
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {property.bathrooms} bath
                          </div>
                          <div className="flex items-center">
                            <Square className="w-4 h-4 mr-1" />
                            {property.size} m²
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Submitted: {formatDate(property.submittedAt)}</p>
                      <p>Images: {property.images.length} photos</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(property.id)}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(property.id)}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(property.id)}
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium">No pending property approvals</p>
                <p className="text-sm">All property listing requests have been processed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
