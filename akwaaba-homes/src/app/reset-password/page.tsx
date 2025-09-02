'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/FormField';
import { AuthErrorDisplay } from '@/components/ui/AuthErrorDisplay';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { 
  Lock,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { AuthError, parseAuthError } from '@/lib/utils/authErrorHandler';

function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // Check if user is authenticated or handle code parameter
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Handle password reset code directly
      const handlePasswordResetCode = async () => {
        try {
          const response = await fetch('/api/auth/exchange-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });
          
          if (!response.ok) {
            setAuthError(parseAuthError({ error: 'Invalid or expired reset link. Please request a new password reset.' }));
          } else {
            // Code exchange successful, clear any auth errors so the form can be shown
            setAuthError(null);
          }
        } catch (error) {
          setAuthError(parseAuthError({ error: 'Invalid or expired reset link. Please request a new password reset.' }));
        }
      };
      
      handlePasswordResetCode();
    } else {
      // Check if user is authenticated (session should be established by callback)
      const checkAuthStatus = async () => {
        try {
          const response = await fetch('/api/auth/me');
          if (!response.ok) {
            setAuthError(parseAuthError({ error: 'Invalid or expired reset link. Please request a new password reset.' }));
          } else {
            // User is authenticated, clear any auth errors
            setAuthError(null);
          }
        } catch (error) {
          setAuthError(parseAuthError({ error: 'Invalid or expired reset link. Please request a new password reset.' }));
        }
      };
      
      checkAuthStatus();
    }
  }, [searchParams]);

  const validateForm = () => {
    if (password.length < 8) {
      setAuthError(parseAuthError({ error: 'Password must be at least 8 characters long' }));
      return false;
    }
    
    if (password !== confirmPassword) {
      setAuthError(parseAuthError({ error: 'Passwords do not match' }));
      return false;
    }
    
    setAuthError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      setSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      console.error('Password update error:', error);
      setAuthError(parseAuthError(error));
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthError(null);
    handleSubmit(new Event('submit') as any);
  };

  const handleDismissError = () => {
    setAuthError(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-800">Password Updated!</CardTitle>
            <CardDescription>
              Your password has been successfully updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700 mb-6">
              You will be redirected to the login page in a few seconds.
            </p>
            <Link href="/login">
              <Button>
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authError && !password && !confirmPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">Invalid Reset Link</CardTitle>
            <CardDescription>
              {authError.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/forgot-password">
              <Button variant="outline" className="mb-3">
                Request New Reset Link
              </Button>
            </Link>
            <div className="text-sm text-red-600">
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            <AuthErrorDisplay
              error={authError}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />

            {/* Password Field */}
            <PasswordField
              label="New Password *"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              helperText="Password must be at least 8 characters long"
            />

            {/* Confirm Password Field */}
            <PasswordField
              label="Confirm New Password *"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Loading...</CardTitle>
            <CardDescription>
              Please wait while we load the reset form
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
