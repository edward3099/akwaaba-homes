import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function PropertiesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
