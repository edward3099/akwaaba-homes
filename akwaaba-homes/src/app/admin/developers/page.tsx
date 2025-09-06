import React from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import DeveloperManagement from '@/components/admin/DeveloperManagement';

export default function AdminDevelopersPage() {
  return (
    <AdminDashboardLayout currentTab="developers">
      <DeveloperManagement />
    </AdminDashboardLayout>
  );
}
