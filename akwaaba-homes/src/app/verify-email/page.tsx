'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/FormField';
import { AuthErrorDisplay } from '@/components/ui/AuthErrorDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthError, parseAuthError } from '@/lib/utils/authErrorHandler';

function VerifyEmailForm() {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Get email from URL params if available
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendVerification = async () => {
    if (!email || resendCountdown > 0) return;

    setIsResending(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'signup'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Verification email sent',
          description: 'Please check your inbox and spam folder.',
        });
        setResendCountdown(60); // 60 second cooldown
      } else {
        setAuthError(parseAuthError(data));
      }
    } catch (error) {
      setAuthError(parseAuthError(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleRetry = () => {
    setAuthError(null);
    handleResendVerification();
  };

  const handleDismissError = () => {
    setAuthError(null);
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Display */}
          <AuthErrorDisplay
            error={authError}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />

          {/* Email Input */}
          <FormField
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            helperText="We'll send a new verification email to this address"
          />

          {/* Resend Button */}
          <Button
            onClick={handleResendVerification}
            disabled={!email || isResending || resendCountdown > 0}
            className="w-full"
            variant="outline"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCountdown > 0 ? (
              `Resend in ${resendCountdown}s`
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>

          {/* Instructions */}
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Check your inbox:</strong> Look for an email from Akwaaba Homes
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Check spam folder:</strong> Sometimes verification emails end up there
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Click the verification link:</strong> This will activate your account
              </AlertDescription>
            </Alert>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleGoToLogin}
              variant="outline"
              className="flex-1"
            >
              Back to Login
            </Button>
            <Button
              onClick={handleGoToSignup}
              variant="outline"
              className="flex-1"
            >
              Create New Account
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Having trouble? Contact our support team at{' '}
              <a href="mailto:support@akwaabahomes.com" className="text-blue-600 hover:underline">
                support@akwaabahomes.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

