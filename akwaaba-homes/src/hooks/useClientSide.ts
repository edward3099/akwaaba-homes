'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to safely detect when we're running on the client side.
 * Prevents hydration mismatches by returning false on first render (server-side).
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
