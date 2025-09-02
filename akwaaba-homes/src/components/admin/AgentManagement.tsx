'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// Removed missing imports - using available components instead
import { Eye, Trash2, User, Mail, Phone, Calendar, Shield, Building, Award, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_role: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  bio?: string;
  business_type?: string;
  company_name?: string;
  experience_years?: number;
  license_number?: string;
  email_verified?: boolean;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    try {
      setDeleteLoading(agentId);
      const response = await fetch(`/api/admin/agents?id=${agentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      
      toast.success(`Agent ${agentName} deleted successfully`);
      setAgents(agents.filter(agent => agent.id !== agentId));
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Management</h2>
          <p className="text-gray-600">Manage agents on the platform</p>
        </div>
        <Button onClick={fetchAgents} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Agents ({agents.length})
          </CardTitle>
          <CardDescription>
            View and manage all registered agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600">No agents have registered on the platform yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{agent.first_name} {agent.last_name}</h3>
                        {getVerificationBadge(agent.verification_status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {agent.email}
                          {agent.email_verified && (
                            <Shield className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {agent.phone || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {agent.company_name || 'Not provided'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(agent.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAgent(agent)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Agent Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {agent.first_name} {agent.last_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAgent && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                                  <p className="text-sm text-gray-900">{selectedAgent.first_name} {selectedAgent.last_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Email</label>
                                  <p className="text-sm text-gray-900 flex items-center gap-2">
                                    {selectedAgent.email}
                                    {selectedAgent.email_verified && (
                                      <Shield className="h-4 w-4 text-green-500" />
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Phone</label>
                                  <p className="text-sm text-gray-900">{selectedAgent.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Company</label>
                                  <p className="text-sm text-gray-900">{selectedAgent.company_name || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Business Type</label>
                                  <p className="text-sm text-gray-900">{selectedAgent.business_type || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Experience</label>
                                  <p className="text-sm text-gray-900 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-gray-400" />
                                    {selectedAgent.experience_years ? `${selectedAgent.experience_years} years` : 'Not provided'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">License Number</label>
                                  <p className="text-sm text-gray-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    {selectedAgent.license_number || 'Not provided'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Verification Status</label>
                                  <div className="mt-1">
                                    {getVerificationBadge(selectedAgent.verification_status)}
                                  </div>
                                </div>
                              </div>
                              
                              {selectedAgent.bio && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Bio</label>
                                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                                    {selectedAgent.bio}
                                  </p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Joined</label>
                                  <p className="text-sm text-gray-900">{formatDate(selectedAgent.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                  <p className="text-sm text-gray-900">{formatDate(selectedAgent.updated_at)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${agent.first_name} ${agent.last_name}? This action cannot be undone.`)) {
                            handleDeleteAgent(agent.id, `${agent.first_name} ${agent.last_name}`);
                          }
                        }}
                        disabled={deleteLoading === agent.id}
                      >
                        {deleteLoading === agent.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}