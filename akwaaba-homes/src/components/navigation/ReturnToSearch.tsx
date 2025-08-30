'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ReturnToSearchProps {
  className?: string;
  showButton?: boolean;
}

export function ReturnToSearch({ className = '', showButton = true }: ReturnToSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we have return parameters
  const returnParams = searchParams.get('return');

  // Function to handle return to homepage with filters applied
  const handleReturnToHomepage = () => {
    if (returnParams) {
      // Navigate to homepage with preserved search filters in URL
      // This allows users to see filtered results on the homepage
      try {
        const decodedParams = decodeURIComponent(returnParams);
        // Remove the leading '?' if it exists
        const cleanParams = decodedParams.startsWith('?') ? decodedParams.substring(1) : decodedParams;
        router.push(`/?${cleanParams}`);
      } catch (error) {
        console.error('Failed to decode return parameters:', error);
        // Fallback to homepage without filters
        router.push('/');
      }
    } else {
      // No return params, go to homepage
      router.push('/');
    }
  };

  // Auto-return if return params exist and no button is shown
  useEffect(() => {
    if (!showButton && returnParams) {
      handleReturnToHomepage();
    }
  }, [returnParams, showButton]);

  if (!showButton) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleReturnToHomepage}
      className={`flex items-center space-x-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to Home</span>
    </Button>
  );
}
