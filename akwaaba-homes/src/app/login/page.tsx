'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Info, Home, Heart, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);

  // Handle URL parameters for status messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (success && message) {
      setStatusMessage({
        type: 'success',
        title: success === 'email_verified' ? 'Email Verified!' : 'Success!',
        description: decodeURIComponent(message)
      });
    } else if (error && message) {
      setStatusMessage({
        type: 'error',
        title: error === 'email_not_confirmed' ? 'Email Not Verified' : 'Error',
        description: decodeURIComponent(message)
      });
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.code === 'EMAIL_NOT_CONFIRMED') {
          setStatusMessage({
            type: 'error',
            title: 'Email Not Verified',
            description: data.error || 'Please check your email to confirm your account before signing in.'
          });
          return;
        }
        
        throw new Error(data.error || 'Login failed');
      }

      // Check if user requires verification
      if (data.requires_verification) {
        toast({
          title: "Login Successful",
          description: "Your account is pending verification. You'll be notified once verified.",
        });
        // Redirect to dashboard with verification notice
        router.push('/agent/dashboard?verification=pending');
        return;
      }

      // Successful login
      toast({
        title: "Welcome Back!",
        description: "You've successfully signed in to AkwaabaHomes!",
      });

      // Redirect based on user role
      if (data.user.user_role === 'agent') {
        router.push('/agent/dashboard');
      } else if (data.user.user_role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    if (formData.email) {
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      router.push('/verify-email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Akwaaba!</h1>
          <p className="text-slate-600 text-lg">Welcome to your real estate journey</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-800 font-bold">Agent Sign In</CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Access your AkwaabaHomes agent dashboard
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Status Messages */}
            {statusMessage && (
              <Alert className={statusMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Info className="h-4 w-4 text-blue-600" />
                )}
                <AlertDescription className={statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  <strong>{statusMessage.title}</strong>
                  <br />
                  {statusMessage.description}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Verification Notice */}
            {statusMessage?.type === 'error' && statusMessage.title === 'Email Not Verified' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Need to verify your email?</strong>
                  <br />
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-yellow-800 underline"
                    onClick={handleResendVerification}
                  >
                    Click here to resend verification email
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                    required
                    data-testid="email"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                    required
                    data-testid="password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
                data-testid="login-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="pt-6 border-t border-slate-200">
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-green-600 hover:text-green-700 font-medium underline">
                    Apply as an Agent
                  </Link>
                </p>
                <div className="flex flex-col space-y-2">
                  <Link href="/contact">
                    <Button variant="outline" className="w-full h-10 border-slate-300 hover:border-slate-400">
                      <Users className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/admin-signin">
                    <Button variant="ghost" className="w-full h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50">
                      Admin Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Friendly Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Building dreams, one home at a time. 🏠
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
