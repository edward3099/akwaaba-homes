import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  const getMessage = () => {
    switch (reason) {
      case 'unverified':
        return 'Your account is not yet verified. Please contact an administrator.';
      case 'insufficient_permissions':
        return 'You do not have sufficient permissions to access this resource.';
      default:
        return 'You are not authorized to access this resource.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getMessage()}
        </p>
        
        {reason === 'unverified' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Verification Required
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your account needs to be verified by an administrator before you can access the admin dashboard.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
          
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Try Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
