import { ReactNode } from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';

export default function PropertiesLayout({ children }: { children: ReactNode }) {
  return (
    <AdminDashboardLayout currentTab="properties">
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </AdminDashboardLayout>
  );
}
