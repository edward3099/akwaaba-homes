'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { AuthErrorDisplay } from '@/components/ui/AuthErrorDisplay';
import { parseAuthError, AuthError } from '@/lib/utils/authErrorHandler';
import { useFormValidation } from '@/hooks/useFormValidation';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToSignIn?: () => void;
}

export default function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Enhanced form validation
  const { validationState, handleFieldChange, handleFieldBlur } = useFormValidation(
    { email: '' },
    {
      schema: forgotPasswordSchema,
      validateOnChange: true,
      validateOnBlur: true,
    }
  );

  const watchedValues = watch();

  // Update validation state when form values change
  React.useEffect(() => {
    Object.keys(watchedValues).forEach(fieldName => {
      if (watchedValues[fieldName as keyof ForgotPasswordFormData] !== undefined) {
        handleFieldChange(fieldName, watchedValues[fieldName as keyof ForgotPasswordFormData]);
      }
    });
  }, [watchedValues, handleFieldChange]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        const parsedError = parseAuthError(error);
        setAuthError(parsedError);
      } else {
        setSuccessMessage('Password reset email sent! Please check your email for further instructions.');
      }
    } catch (error) {
      const parsedError = parseAuthError(error);
      setAuthError(parsedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthError(null);
    // Retry the last submission
    if (watchedValues.email) {
      onSubmit(watchedValues);
    }
  };

  const handleDismissError = () => {
    setAuthError(null);
  };

  const handleDismissSuccess = () => {
    setSuccessMessage(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you a link to reset your password
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

          {/* Success Message */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDismissSuccess}
                className="ml-auto text-green-800 hover:text-green-900"
              >
                Dismiss
              </Button>
            </Alert>
          )}

          {/* Email Field */}
          <FormField
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            required
            validation={validationState.email}
            error={errors.email?.message}
            helperText="We'll send a password reset link to this email"
            onBlur={(e) => handleFieldBlur('email', e.target.value)}
            {...register('email')}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Email
              </>
            )}
          </Button>

          {/* Back to Sign In */}
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToSignIn}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Sign In
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Having trouble? Here are some things to check:
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Make sure you&apos;re using the email address you signed up with</p>
                <p>• Check your spam or junk folder</p>
                <p>• Wait a few minutes for the email to arrive</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
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
