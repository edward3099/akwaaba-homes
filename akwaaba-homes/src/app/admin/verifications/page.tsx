'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Clock, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = React.useState<any>({ agents: [], properties: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch verifications on component mount
  React.useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/verifications', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch verifications: ${response.status}`);
      }
      
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, type: string) => {
    // TODO: Implement review functionality - could open a modal with details
    console.log('Review requested for:', { id, type });
  };

  const handleApprove = async (id: string, type: string) => {
    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          verificationId: id,
          verificationType: type,
          action: 'approve'
        })
      });

      if (response.ok) {
        toast.success(`${type} approved successfully!`);
        // Refresh the data
        fetchVerifications();
      } else {
        const error = await response.json();
        toast.error(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      alert(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReject = async (id: string, type: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          verificationId: id,
          verificationType: type,
          action: 'reject',
          reason
        })
      });

      if (response.ok) {
        toast.success(`${type} rejected successfully!`);
        // Refresh the data
        fetchVerifications();
      } else {
        const error = await response.json();
        toast.error(`Failed to reject: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent':
        return <User className="w-5 h-5" />;
      case 'property':
        return <Building2 className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading verifications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Verification Management</h1>
          <p className="text-muted-foreground">Review and manage pending verifications for agents and properties</p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Verifications</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchVerifications} variant="outline" size="sm">
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Verification Management</h1>
        <p className="text-muted-foreground">Review and manage pending verifications for agents and properties</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.agents.length + verifications.properties.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agent Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.agents.length}</div>
            <p className="text-xs text-muted-foreground">Pending agent approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Property Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.properties.length}</div>
            <p className="text-xs text-muted-foreground">Pending property approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>Review and approve or reject verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...verifications.agents.map(agent => ({ ...agent, type: 'agent' })), ...verifications.properties.map(property => ({ ...property, type: 'property' }))].map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon(verification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">
                          {verification.type === 'agent' ? verification.name : verification.title}
                        </h3>
                        {getStatusBadge(verification.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {verification.type === 'agent' ? (
                          <>
                            <p>Company: {verification.company}</p>
                            <p>Documents: {verification.documents.join(', ')}</p>
                          </>
                        ) : (
                          <>
                            <p>Agent: {verification.agent}</p>
                            <p>Documents: {verification.documents.join(', ')}</p>
                          </>
                        )}
                        <p>Submitted: {formatDate(verification.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(verification.id, verification.type)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(verification.id, verification.type)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(verification.id, verification.type)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {verifications.agents.length === 0 && verifications.properties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium">No pending verifications</p>
                <p className="text-sm">All verification requests have been processed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
