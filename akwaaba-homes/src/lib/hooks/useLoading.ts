import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  startTime: number | null;
  estimatedTime: number | null;
  error: string | null;
}

// Loading operation configuration
export interface LoadingConfig {
  showProgress?: boolean;
  showToast?: boolean;
  toastMessage?: string;
  estimatedDuration?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// Global loading state manager
class LoadingManager {
  private static instance: LoadingManager;
  private loadingStates: Map<string, LoadingState> = new Map();
  private listeners: Set<(key: string, state: LoadingState) => void> = new Set();

  private constructor() {}

  public static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  // Start loading operation
  start(key: string, message: string = 'Loading...', config: LoadingConfig = {}): void {
    const state: LoadingState = {
      isLoading: true,
      progress: 0,
      message,
      startTime: Date.now(),
      estimatedTime: config.estimatedDuration || null,
      error: null,
    };

    this.loadingStates.set(key, state);
    this.notifyListeners(key, state);
  }

  // Update loading progress
  update(key: string, progress: number, message?: string): void {
    const state = this.loadingStates.get(key);
    if (state && state.isLoading) {
      state.progress = Math.min(100, Math.max(0, progress));
      if (message) state.message = message;
      this.notifyListeners(key, state);
    }
  }

  // Complete loading operation
  complete(key: string, message?: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      state.isLoading = false;
      state.progress = 100;
      if (message) state.message = message;
      this.notifyListeners(key, state);
    }
  }

  // Set error state
  error(key: string, error: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      state.isLoading = false;
      state.error = error;
      this.notifyListeners(key, state);
    }
  }

  // Stop loading operation
  stop(key: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      state.isLoading = false;
      this.notifyListeners(key, state);
    }
  }

  // Get loading state
  getState(key: string): LoadingState | undefined {
    return this.loadingStates.get(key);
  }

  // Check if any operation is loading
  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(state => state.isLoading);
  }

  // Get all loading states
  getAllStates(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  // Clear completed states
  clearCompleted(): void {
    for (const [key, state] of this.loadingStates.entries()) {
      if (!state.isLoading && !state.error) {
        this.loadingStates.delete(key);
      }
    }
  }

  // Add listener
  addListener(listener: (key: string, state: LoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners
  private notifyListeners(key: string, state: LoadingState): void {
    this.listeners.forEach(listener => {
      try {
        listener(key, state);
      } catch (error) {
        console.error('Error in loading listener:', error);
      }
    });
  }
}

// Global loading manager instance
const loadingManager = LoadingManager.getInstance();

// Hook for managing loading states
export const useLoading = (key?: string) => {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const { toast } = useToast();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update local state when global state changes
  useEffect(() => {
    const unsubscribe = loadingManager.addListener((key, state) => {
      setLoadingStates(prev => new Map(prev.set(key, state)));
    });

    // Initialize with current states
    setLoadingStates(loadingManager.getAllStates());

    return unsubscribe;
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Start loading operation
  const start = useCallback((
    operationKey: string,
    message: string = 'Loading...',
    config: LoadingConfig = {}
  ): void => {
    loadingManager.start(operationKey, message, config);

    // Show toast if configured
    if (config.showToast) {
      const toastMessage = config.toastMessage || message;
      toast({
        title: "Loading",
        description: toastMessage,
        duration: config.estimatedDuration || 3000,
      });
    }

    // Auto-hide if configured
    if (config.autoHide && config.estimatedDuration) {
      const timeout = setTimeout(() => {
        loadingManager.stop(operationKey);
        if (config.onComplete) {
          config.onComplete();
        }
      }, config.estimatedDuration);

      timeoutRefs.current.set(operationKey, timeout);
    }
  }, [toast]);

  // Update loading progress
  const update = useCallback((operationKey: string, progress: number, message?: string): void => {
    loadingManager.update(operationKey, progress, message);
  }, []);

  // Complete loading operation
  const complete = useCallback((
    operationKey: string,
    message?: string,
    config: LoadingConfig = {}
  ): void => {
    loadingManager.complete(operationKey, message);

    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(operationKey);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(operationKey);
    }

    // Show completion toast if configured
    if (config.showToast) {
      const toastMessage = config.toastMessage || message || 'Operation completed';
      toast({
        title: "Success",
        description: toastMessage,
        variant: "default",
      });
    }

    // Call completion callback
    if (config.onComplete) {
      config.onComplete();
    }

    // Auto-hide after delay if configured
    if (config.autoHide && config.autoHideDelay) {
      setTimeout(() => {
        loadingManager.stop(operationKey);
      }, config.autoHideDelay);
    }
  }, [toast]);

  // Set error state
  const error = useCallback((
    operationKey: string,
    errorMessage: string,
    config: LoadingConfig = {}
  ): void => {
    loadingManager.error(operationKey, errorMessage);

    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(operationKey);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(operationKey);
    }

    // Show error toast if configured
    if (config.showToast) {
      const toastMessage = config.toastMessage || errorMessage;
      toast({
        title: "Error",
        description: toastMessage,
        variant: "destructive",
      });
    }

    // Call error callback
    if (config.onError) {
      config.onError(new Error(errorMessage));
    }
  }, [toast]);

  // Stop loading operation
  const stop = useCallback((operationKey: string): void => {
    loadingManager.stop(operationKey);

    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(operationKey);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(operationKey);
    }
  }, []);

  // Check if specific operation is loading
  const isLoading = useCallback((operationKey: string): boolean => {
    return loadingStates.get(operationKey)?.isLoading || false;
  }, [loadingStates]);

  // Get loading state for specific operation
  const getState = useCallback((operationKey: string): LoadingState | undefined => {
    return loadingStates.get(operationKey);
  }, [loadingStates]);

  // Check if any operation is loading
  const isAnyLoading = useCallback((): boolean => {
    return loadingManager.isAnyLoading();
  }, []);

  // Get progress for specific operation
  const getProgress = useCallback((operationKey: string): number => {
    return loadingStates.get(operationKey)?.progress || 0;
  }, [loadingStates]);

  // Get message for specific operation
  const getMessage = useCallback((operationKey: string): string => {
    return loadingStates.get(operationKey)?.message || '';
  }, [loadingStates]);

  // Get error for specific operation
  const getError = useCallback((operationKey: string): string | null => {
    return loadingStates.get(operationKey)?.error || null;
  }, [loadingStates]);

  // Get estimated time remaining
  const getEstimatedTimeRemaining = useCallback((operationKey: string): number | null => {
    const state = loadingStates.get(operationKey);
    if (!state || !state.startTime || !state.estimatedTime) return null;

    const elapsed = Date.now() - state.startTime;
    const remaining = state.estimatedTime - elapsed;
    return Math.max(0, remaining);
  }, [loadingStates]);

  // Wrapper for async operations with loading state
  const withLoading = useCallback(async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    message: string = 'Loading...',
    config: LoadingConfig = {}
  ): Promise<T> => {
    try {
      start(operationKey, message, config);
      
      const result = await operation();
      
      complete(operationKey, 'Operation completed successfully', config);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      error(operationKey, errorMessage, config);
      throw err;
    }
  }, [start, complete, error]);

  // Wrapper for operations with progress tracking
  const withProgress = useCallback(async <T>(
    operationKey: string,
    operation: (progressCallback: (progress: number, message?: string) => void) => Promise<T>,
    message: string = 'Loading...',
    config: LoadingConfig = {}
  ): Promise<T> => {
    try {
      start(operationKey, message, config);
      
      const progressCallback = (progress: number, message?: string) => {
        update(operationKey, progress, message);
      };
      
      const result = await operation(progressCallback);
      
      complete(operationKey, 'Operation completed successfully', config);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      error(operationKey, errorMessage, config);
      throw err;
    }
  }, [start, update, complete, error]);

  // Batch loading operations
  const withBatchLoading = useCallback(async <T>(
    operationKey: string,
    operations: Array<() => Promise<any>>,
    message: string = 'Processing...',
    config: LoadingConfig = {}
  ): Promise<T[]> => {
    try {
      start(operationKey, message, config);
      
      const results: T[] = [];
      const totalOperations = operations.length;
      
      for (let i = 0; i < totalOperations; i++) {
        const progress = ((i + 1) / totalOperations) * 100;
        const operationMessage = `${message} (${i + 1}/${totalOperations})`;
        
        update(operationKey, progress, operationMessage);
        
        const result = await operations[i]();
        results.push(result);
      }
      
      complete(operationKey, 'All operations completed successfully', config);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch operation failed';
      error(operationKey, errorMessage, config);
      throw err;
    }
  }, [start, update, complete, error]);

  // Clear all loading states
  const clearAll = useCallback((): void => {
    loadingManager.clearCompleted();
  }, []);

  // If a specific key is provided, return focused loading state
  if (key) {
    const state = loadingStates.get(key);
    return {
      isLoading: state?.isLoading || false,
      progress: state?.progress || 0,
      message: state?.message || '',
      error: state?.error || null,
      estimatedTimeRemaining: getEstimatedTimeRemaining(key),
      start: (message?: string, config?: LoadingConfig) => start(key, message, config),
      update: (progress: number, message?: string) => update(key, progress, message),
      complete: (message?: string, config?: LoadingConfig) => complete(key, message, config),
      setError: (errorMessage: string, config?: LoadingConfig) => error(key, errorMessage, config),
      stop: () => stop(key),
      withLoading: <T>(operation: () => Promise<T>, message?: string, config?: LoadingConfig) =>
        withLoading(key, operation, message, config),
      withProgress: <T>(operation: (progressCallback: (progress: number, message?: string) => void) => Promise<T>, message?: string, config?: LoadingConfig) =>
        withProgress(key, operation, message, config),
    };
  }

  // Return full loading management interface
  return {
    // State
    loadingStates,
    isAnyLoading,
    
    // Operations
    start,
    update,
    complete,
    error,
    stop,
    
    // Utilities
    isLoading,
    getState,
    getProgress,
    getMessage,
    getError,
    getEstimatedTimeRemaining,
    
    // Wrappers
    withLoading,
    withProgress,
    withBatchLoading,
    
    // Management
    clearAll,
  };
};

// Hook for simple loading state
export const useSimpleLoading = (key: string) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);

  const start = useCallback((msg: string = 'Loading...') => {
    setIsLoading(true);
    setProgress(0);
    setMessage(msg);
    setError(null);
  }, []);

  const update = useCallback((prog: number, msg?: string) => {
    setProgress(prog);
    if (msg) setMessage(msg);
  }, []);

  const complete = useCallback((msg?: string) => {
    setIsLoading(false);
    setProgress(100);
    if (msg) setMessage(msg);
    
    toast({
      title: "Success",
      description: msg || "Operation completed successfully",
      variant: "default",
    });
  }, [toast]);

  const setErrorState = useCallback((errorMsg: string) => {
    setIsLoading(false);
    setError(errorMsg);
    
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive",
    });
  }, [toast]);

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    try {
      start(message);
      const result = await operation();
      complete('Operation completed successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setErrorState(errorMessage);
      throw err;
    }
  }, [start, complete, setErrorState]);

  return {
    isLoading,
    progress,
    message,
    error,
    start,
    update,
    complete,
    setError: setErrorState,
    stop,
    withLoading,
  };
};

// Export the global loading manager for direct access
export { loadingManager };
export default useLoading;
