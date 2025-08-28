'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Clock, User, Building2 } from 'lucide-react';

export default function AdminVerificationsPage() {
  // Mock data - replace with actual API calls
  const pendingVerifications = [
    {
      id: '1',
      type: 'agent',
      name: 'Kwame Asante',
      company: 'Asante Real Estate',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      documents: ['license', 'id_card', 'business_registration']
    },
    {
      id: '2',
      type: 'property',
      title: 'Luxury Villa in East Legon',
      agent: 'Sarah Mensah',
      submittedAt: '2024-01-15T09:15:00Z',
      status: 'pending',
      documents: ['property_deed', 'photos', 'specifications']
    },
    {
      id: '3',
      type: 'agent',
      name: 'Michael Osei',
      company: 'Osei Properties',
      submittedAt: '2024-01-14T16:45:00Z',
      status: 'pending',
      documents: ['license', 'id_card', 'references']
    }
  ];

  const handleReview = async (id: string, type: string) => {
    // TODO: Implement review functionality
  };

  const handleApprove = async (id: string, type: string) => {
    // TODO: Implement approval functionality
  };

  const handleReject = async (id: string, type: string) => {
    // TODO: Implement rejection functionality
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
            <div className="text-2xl font-bold">{pendingVerifications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agent Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerifications.filter(v => v.type === 'agent').length}</div>
            <p className="text-xs text-muted-foreground">Pending agent approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Property Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerifications.filter(v => v.type === 'property').length}</div>
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
            {pendingVerifications.map((verification) => (
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

            {pendingVerifications.length === 0 && (
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
