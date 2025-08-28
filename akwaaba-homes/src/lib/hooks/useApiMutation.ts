import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiMutationOptions<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

interface UseApiMutationReturn<TData, TError> {
  mutate: (apiCall: () => Promise<TData>) => Promise<void>;
  isLoading: boolean;
  error: TError | null;
  reset: () => void;
}

/**
 * Custom hook for handling API mutations with comprehensive error handling,
 * loading states, and toast notifications using Sonner.
 * 
 * Features:
 * - Automatic loading state management
 * - Promise-based toast notifications
 * - Error handling with customizable messages
 * - Success callbacks
 * - Error callbacks
 * - Reset functionality
 */
export function useApiMutation<TData = any, TError = Error>(
  options: UseApiMutationOptions<TData, TError> = {}
): UseApiMutationReturn<TData, TError> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const {
    onSuccess,
    onError,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred. Please try again.',
    loadingMessage = 'Processing...'
  } = options;

  const mutate = useCallback(async (apiCall: () => Promise<TData>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Show loading toast
      const loadingToast = toast.loading(loadingMessage);

      // Execute the API call
      const data = await apiCall();

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      
      // Use promise-based toast for better UX
      toast.promise(
        Promise.resolve(data),
        {
          loading: loadingMessage,
          success: () => {
            onSuccess?.(data);
            return successMessage;
          },
          error: (err: TError) => {
            onError?.(err);
            setError(err);
            return errorMessage;
          }
        }
      );

    } catch (err) {
      const error = err as TError;
      setError(error);
      
      // Show error toast
      toast.error(errorMessage, {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        action: {
          label: 'Retry',
          onClick: () => mutate(apiCall)
        }
      });

      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, successMessage, errorMessage, loadingMessage]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    reset
  };
}

/**
 * Specialized hook for form submissions with validation support
 */
export function useFormMutation<TData = any, TError = Error>(
  options: UseApiMutationOptions<TData, TError> & {
    validateForm?: () => boolean | string;
  } = {}
) {
  const { validateForm, ...mutationOptions } = options;
  const baseMutation = useApiMutation<TData, TError>(mutationOptions);

  const submitForm = useCallback(async (
    apiCall: () => Promise<TData>,
    formData?: any
  ) => {
    // Validate form if validation function is provided
    if (validateForm) {
      const validationResult = validateForm();
      if (validationResult !== true) {
        const errorMsg = typeof validationResult === 'string' ? validationResult : 'Please check your form inputs';
        toast.error('Validation Error', {
          description: errorMsg
        });
        return;
      }
    }

    // Proceed with API call
    await baseMutation.mutate(apiCall);
  }, [validateForm, baseMutation]);

  return {
    ...baseMutation,
    submitForm
  };
}

/**
 * Hook for handling destructive operations with confirmation
 */
export function useDestructiveMutation<TData = any, TError = Error>(
  options: UseApiMutationOptions<TData, TError> & {
    confirmationMessage?: string;
    confirmationTitle?: string;
  } = {}
) {
  const { confirmationMessage, confirmationTitle, ...mutationOptions } = options;
  const baseMutation = useApiMutation<TData, TError>(mutationOptions);

  const executeWithConfirmation = useCallback(async (
    apiCall: () => Promise<TData>,
    customConfirmationMessage?: string
  ) => {
    const message = customConfirmationMessage || confirmationMessage || 'Are you sure you want to proceed?';
    const title = confirmationTitle || 'Confirm Action';

    // Show confirmation toast with action buttons
    toast(title, {
      description: message,
      action: {
        label: 'Proceed',
        onClick: async () => {
          await baseMutation.mutate(apiCall);
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          toast.dismiss();
        }
      },
      duration: Infinity // Keep until user makes a decision
    });
  }, [confirmationMessage, confirmationTitle, baseMutation]);

  return {
    ...baseMutation,
    executeWithConfirmation
  };
}
