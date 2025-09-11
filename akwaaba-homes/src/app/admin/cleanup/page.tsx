'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrashIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/authContext';

interface PlaceholderProperty {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  reason: string;
}

export default function DataCleanupPage() {
  const { session } = useAuth();
  const [placeholderProperties, setPlaceholderProperties] = useState<PlaceholderProperty[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [cleanupComplete, setCleanupComplete] = useState(false);

  const scanForPlaceholders = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setCleanupComplete(false);

    try {
      const response = await fetch('/api/admin/scan-placeholders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to scan for placeholder data');
      }

      const data = await response.json();
      setPlaceholderProperties(data.placeholderProperties || []);
      setScanComplete(true);
    } catch (error) {
      console.error('Error scanning for placeholders:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const cleanPlaceholders = async () => {
    setIsCleaning(true);
    setCleanupComplete(false);

    try {
      const response = await fetch('/api/admin/clean-placeholders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clean placeholder data');
      }

      const data = await response.json();
      setPlaceholderProperties([]);
      setCleanupComplete(true);
    } catch (error) {
      console.error('Error cleaning placeholders:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes('placeholder') || reason.includes('test')) return 'text-red-600';
    if (reason.includes('price')) return 'text-orange-600';
    if (reason.includes('bedrooms') || reason.includes('bathrooms')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Cleanup</h1>
          <p className="text-gray-600">
            Scan for and remove placeholder data from the properties database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                Scan for Placeholders
              </CardTitle>
              <CardDescription>
                Scan the database for properties with placeholder data, test entries, or invalid information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={scanForPlaceholders}
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? 'Scanning...' : 'Scan Database'}
              </Button>
              {scanComplete && (
                <Alert className="mt-4">
                  <CheckCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Scan complete! Found {placeholderProperties.length} properties with placeholder data.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrashIcon className="h-5 w-5 text-red-500" />
                Clean Placeholders
              </CardTitle>
              <CardDescription>
                Remove all detected placeholder properties from the database. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={cleanPlaceholders}
                disabled={isCleaning || placeholderProperties.length === 0}
                variant="destructive"
                className="w-full"
              >
                {isCleaning ? 'Cleaning...' : `Remove ${placeholderProperties.length} Properties`}
              </Button>
              {cleanupComplete && (
                <Alert className="mt-4">
                  <CheckCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Cleanup complete! All placeholder properties have been removed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {placeholderProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detected Placeholder Properties</CardTitle>
              <CardDescription>
                The following properties contain placeholder data and will be removed during cleanup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {placeholderProperties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{property.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📍 {property.address}, {property.city}</span>
                          <span>💰 ₵{property.price}</span>
                          <span>🛏️ {property.bedrooms} bed</span>
                          <span>🚿 {property.bathrooms} bath</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-red-100 ${getReasonColor(property.reason)}`}>
                          {property.reason}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {placeholderProperties.length === 0 && scanComplete && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Placeholder Data Found</h3>
              <p className="text-gray-600">
                Great! The database is clean and contains no placeholder or test data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
