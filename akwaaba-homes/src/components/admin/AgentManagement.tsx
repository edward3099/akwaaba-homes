'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Agent {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  user_role: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  properties_count?: number;
  last_active?: string;
  city?: string;
  region?: string;
}

interface AgentStats {
  total: number;
  verified: number;
  pending: number;
  active: number;
  inactive: number;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<AgentStats>({
    total: 0,
    verified: 0,
    pending: 0,
    active: 0,
    inactive: 0
  });
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { toast } = useToast();

  // Fetch agents from database
  const fetchAgents = async () => {
    try {
      setLoading(true);
      console.log('Fetching agents...');
      
      // Get all users with agent role
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          user_role,
          created_at,
          updated_at,
          is_verified,
          city,
          region
        `)
        .in('user_role', ['agent'])
        .order('created_at', { ascending: false });

      console.log('Profiles query result:', { profiles, error });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      // Get properties count for each agent
      const agentsWithCounts = await Promise.all(
        (profiles || []).map(async (agent) => {
          const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agent.id);

          return {
            ...agent,
            properties_count: count || 0,
            last_active: agent.updated_at // Using updated_at as last_active for now
          };
        })
      );

      setAgents(agentsWithCounts);
      setFilteredAgents(agentsWithCounts);
      
      // Calculate stats
      const newStats = {
        total: agentsWithCounts.length,
        verified: agentsWithCounts.filter(a => a.is_verified).length,
        pending: agentsWithCounts.filter(a => !a.is_verified).length,
        active: agentsWithCounts.filter(a => a.is_verified).length, // Assuming verified = active
        inactive: agentsWithCounts.filter(a => !a.is_verified).length
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter agents based on search and filters
  useEffect(() => {
    let filtered = agents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phone?.includes(searchTerm)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(agent => agent.user_role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'verified') {
        filtered = filtered.filter(agent => agent.is_verified);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(agent => !agent.is_verified);
      }
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, filterRole, filterStatus]);

  // Load agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Delete agent
  const handleDeleteAgent = async (agentId: string) => {
    try {
      setDeleting(true);
      console.log('Deleting agent:', agentId);
      
      // Delete from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agentId)
        .select();

      console.log('Profile deletion result:', { profileData, profileError });

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        throw profileError;
      }

      // Also delete from auth.users (this might require admin privileges)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(agentId);
        
        if (authError) {
          console.warn('Could not delete from auth.users:', authError);
          // Continue anyway as the profile is deleted
        } else {
          console.log('User deleted from auth successfully');
        }
      } catch (authError) {
        console.warn('Auth deletion failed:', authError);
        // Continue anyway as the profile is deleted
      }

      console.log('Agent deleted successfully');
      
      // Refresh the list first
      console.log('Refreshing agent list...');
      await fetchAgents();
      console.log('Agent list refreshed');
      
      // Close dialog
      setShowDeleteDialog(false);
      setSelectedAgent(null);
      
      // Show success message
      alert('Agent has been deleted successfully!');
      
      toast({
        title: "Success",
        description: "Agent has been deleted successfully.",
      });

    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: `Failed to delete agent: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle agent verification
  const handleToggleVerification = async (agentId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling verification for agent:', agentId, 'from', currentStatus, 'to', !currentStatus);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Verification updated successfully');
      
      // Show success message
      alert(`Agent ${!currentStatus ? 'verified' : 'unverified'} successfully!`);
      
      toast({
        title: "Success",
        description: `Agent ${!currentStatus ? 'verified' : 'unverified'} successfully.`,
      });

      // Refresh the list
      await fetchAgents();

    } catch (error) {
      console.error('Error updating agent verification:', error);
      toast({
        title: "Error",
        description: `Failed to update agent verification: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (agent: Agent) => {
    if (agent.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'agent': 'bg-blue-100 text-blue-800',
      'moderator': 'bg-green-100 text-green-800',
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
      'seller': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
            <p className="text-gray-600">Manage and monitor all agents on the platform</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading agents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600">Manage and monitor all agents on the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search agents by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="agent">Agent</option>
                <option value="moderator">Moderator</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>Agents ({filteredAgents.length})</CardTitle>
          <CardDescription>
            Manage all agents registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{agent.full_name || 'N/A'}</h3>
                        <p className="text-sm text-gray-500">ID: {agent.id.slice(0, 8)}...</p>
                      </div>
                      <div className="flex gap-2">
                        {getRoleBadge(agent.user_role)}
                        {getStatusBadge(agent)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {agent.email}
                        </div>
                        {agent.phone && (
                          <div className="flex items-center text-gray-500">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {agent.phone}
                          </div>
                        )}
                        {(agent.city || agent.region) && (
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {[agent.city, agent.region].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-gray-600">
                          <span className="font-medium">{agent.properties_count || 0}</span> properties
                        </div>
                        <div className="text-gray-500">
                          Joined: {new Date(agent.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVerification(agent.id, agent.is_verified)}
                        >
                          {agent.is_verified ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setSelectedAgent(agent)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Agent</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {selectedAgent?.full_name || selectedAgent?.email}? 
                                This action cannot be undone and will remove all associated data.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => selectedAgent && handleDeleteAgent(selectedAgent.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleting}
                              >
                                {deleting ? 'Deleting...' : 'Delete Agent'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAgents.length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'No agents have registered on the platform yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
