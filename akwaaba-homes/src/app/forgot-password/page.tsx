'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/FormField';
import { AuthErrorDisplay } from '@/components/ui/AuthErrorDisplay';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthError, parseAuthError } from '@/lib/utils/authErrorHandler';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setAuthError(parseAuthError({ error: 'Please enter your email address' }));
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset instructions');
      }

      setSuccess(true);
      toast({
        title: "Instructions Sent!",
        description: data.message || "Password reset instructions have been sent to your email.",
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      setAuthError(parseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthError(null);
    // Trigger form submission by calling the submit handler directly
    if (email) {
      // Call the form submission logic directly instead of creating a mock event
      setLoading(true);
      setAuthError(null);
      
      // Re-run the API call
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to send reset instructions');
          });
        }
        return response.json();
      })
      .then(data => {
        setSuccess(true);
        toast({
          title: "Instructions Sent!",
          description: data.message || "Password reset instructions have been sent to your email.",
        });
      })
      .catch(error => {
        console.error('Forgot password error:', error);
        setAuthError(parseAuthError(error));
      })
      .finally(() => {
        setLoading(false);
      });
    }
  };

  const handleDismissError = () => {
    setAuthError(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Check Your Email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What to do next:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reset link in the email</li>
                <li>• Create a new password</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/login">
                <Button className="w-full">
                  Return to Login
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                Send Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl text-slate-900">Forgot Password?</CardTitle>
            <CardDescription className="text-slate-600">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            <AuthErrorDisplay
              error={authError}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />

            <FormField
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="We'll send password reset instructions to this email address"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Instructions...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">
                Need help with your account?
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
