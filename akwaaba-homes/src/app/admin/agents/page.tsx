import React from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AgentManagement from '@/components/admin/AgentManagement';

export default function AdminAgentsPage() {
  return (
    <AdminDashboardLayout currentTab="agents">
      <AgentManagement />
    </AdminDashboardLayout>
  );
}