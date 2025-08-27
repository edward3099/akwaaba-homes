import React from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AdminOverview from '@/components/admin/AdminOverview';

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout currentTab="overview">
      <AdminOverview />
    </AdminDashboardLayout>
  );
}
