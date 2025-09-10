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

  // Function to handle return navigation
  const handleReturn = () => {
    if (returnParams) {
      try {
        const decodedParams = decodeURIComponent(returnParams);
        // Check if it's an agent page
        if (decodedParams.startsWith('/agent/')) {
          router.push(decodedParams);
        } else if (decodedParams === '/agents') {
          // Navigate directly to agents page
          router.push('/agents');
        } else if (decodedParams === '/developers') {
          // Navigate directly to developers page
          router.push('/developers');
        } else {
          // Navigate to homepage with preserved search filters in URL
          // This allows users to see filtered results on the homepage
          const cleanParams = decodedParams.startsWith('?') ? decodedParams.substring(1) : decodedParams;
          router.push(`/?${cleanParams}`);
        }
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
      handleReturn();
    }
  }, [returnParams, showButton]);

  if (!showButton) {
    return null;
  }

  // Determine button text based on return destination
  const getButtonText = () => {
    if (returnParams) {
      try {
        const decodedParams = decodeURIComponent(returnParams);
        if (decodedParams.startsWith('/agent/')) {
          return 'Back to Agent';
        } else if (decodedParams === '/agents') {
          return 'Back to Agents';
        } else if (decodedParams === '/developers') {
          return 'Back to Developers';
        }
      } catch (error) {
        // Fallback to default text
      }
    }
    return 'Back to Home';
  };

  return (
    <Button
      variant="outline"
      onClick={handleReturn}
      className={`flex items-center space-x-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{getButtonText()}</span>
    </Button>
  );
}
