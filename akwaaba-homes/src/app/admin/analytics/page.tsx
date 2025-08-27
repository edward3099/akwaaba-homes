import React from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

export default function AdminAnalyticsPage() {
  return (
    <AdminDashboardLayout currentTab="analytics">
      <AdminAnalytics />
    </AdminDashboardLayout>
  );
}
