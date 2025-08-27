import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Search, Filter, Grid3X3, List } from 'lucide-react';
import Link from 'next/link';

interface PropertiesLayoutProps {
  children: React.ReactNode;
}

export default function PropertiesLayout({ children }: PropertiesLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your real estate properties, listings, and agent assignments
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/admin/properties/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          <Link 
            href="/admin/properties"
            className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
          >
            <Building2 className="h-4 w-4 mr-2 inline" />
            All Properties
          </Link>
          <Link 
            href="/admin/properties/active"
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Active Listings
          </Link>
          <Link 
            href="/admin/properties/pending"
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Pending
          </Link>
          <Link 
            href="/admin/properties/sold"
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Sold
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
}
