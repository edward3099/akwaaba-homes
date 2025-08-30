'use client';

import { useState } from 'react';

export interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export function useLoadingState(): LoadingState {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return {
    isLoading,
    setLoading,
  };
}

// Also export as default for compatibility
export default useLoadingState;
