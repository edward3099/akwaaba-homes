import React from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AdminSystemMonitoring from '@/components/admin/AdminSystemMonitoring';

export default function AdminMonitoringPage() {
  return (
    <AdminDashboardLayout currentTab="monitoring">
      <AdminSystemMonitoring />
    </AdminDashboardLayout>
  );
}
