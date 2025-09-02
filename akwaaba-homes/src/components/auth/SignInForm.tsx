'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Info, Mail, Lock } from 'lucide-react';
import { FormField, PasswordField } from '@/components/ui/FormField';
import { AuthErrorDisplay } from '@/components/ui/AuthErrorDisplay';
import { parseAuthError, AuthError } from '@/lib/utils/authErrorHandler';
import { useFormValidation } from '@/hooks/useFormValidation';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export default function SignInForm({ onSuccess, onSwitchToSignUp, onForgotPassword }: SignInFormProps) {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // Enhanced form validation
  const { validationState, handleFieldChange, handleFieldBlur, validateForm } = useFormValidation(
    { email: '', password: '' },
    {
      schema: signInSchema,
      validateOnChange: true,
      validateOnBlur: true,
    }
  );

  const watchedValues = watch();

  // Removed the problematic useEffect that was causing infinite loop
  // The form validation will still work through the onBlur handlers

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setAuthError(null);

    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Set a timeout to prevent infinite loading (especially on mobile)
    const timeout = setTimeout(() => {
      console.warn('Login timeout - forcing loading state to false');
      setIsLoading(false);
      setAuthError(parseAuthError({ error: 'Login is taking longer than expected. Please try again.' }));
    }, 15000); // 15 second timeout

    setLoadingTimeout(timeout);

    try {
      const { success, error } = await signIn(data.email, data.password);

      // Clear the timeout since we got a response
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }

      if (error) {
        const parsedError = parseAuthError(error);
        setAuthError(parsedError);
        setIsLoading(false);
      } else if (success) {
        // Don't set loading to false here - let the redirect handle it
        // This prevents the "Signing In..." from disappearing before redirect
        onSuccess?.();
        // Keep loading state true until redirect happens
        return;
      }
    } catch (error) {
      // Clear the timeout since we got an error
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
      
      const parsedError = parseAuthError(error);
      setAuthError(parsedError);
      setIsLoading(false);
    }
    
    // Only set loading to false if we didn't return early (i.e., no success)
    setIsLoading(false);
  };

  const handleRetry = () => {
    setAuthError(null);
    // Retry the last submission
    if (watchedValues.email && watchedValues.password) {
      onSubmit(watchedValues);
    }
  };

  const handleDismissError = () => {
    setAuthError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your Akwaaba Homes account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Display */}
          <AuthErrorDisplay
            error={authError}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
            showTechnical={false}
          />

          {/* Email Field */}
          <FormField
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            required
            validation={validationState.email}
            error={errors.email?.message}
            helperText="We'll never share your email with anyone else"
            onBlur={(e) => handleFieldBlur('email', e.target.value)}
            {...register('email')}
          />

          {/* Password Field */}
          <PasswordField
            label="Password"
            placeholder="Enter your password"
            required
            validation={validationState.password}
            error={errors.password?.message}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onBlur={(e) => handleFieldBlur('password', e.target.value)}
            {...register('password')}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Switch to Sign Up */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need help accessing your account?
              </p>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
