import React from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AdminSettings from '@/components/admin/AdminSettings';

export default function AdminSettingsPage() {
  return (
    <AdminDashboardLayout currentTab="settings">
      <AdminSettings />
    </AdminDashboardLayout>
  );
}
