'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Info, Shield, Building2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AdminSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: 'admin@akwaabahomes.com',
    password: 'adminpassword123'
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
      toast.error('Validation Error', {
        description: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);

    try {
      // Use client-side Supabase authentication directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role, is_verified')
        .eq('user_id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found. Please contact support.');
      }

      if (profile.user_role !== 'admin') {
        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Successful admin login
      toast.success('Admin Access Granted', {
        description: 'Welcome to the Admin Portal!'
      });

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login Failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Corporate Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-300 text-lg">Secure Administrative Access</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 font-bold">Administrator Sign In</CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Access the AkwaabaHomes administrative dashboard
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your admin email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
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
                    className="pl-10 pr-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
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
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
                data-testid="login-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Access Admin Portal'
                )}
              </Button>
            </form>

            <div className="pt-6 border-t border-slate-200">
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-600">
                  Need help with administrative access?
                </p>
                <div className="flex flex-col space-y-2">
                  <Link href="/contact">
                    <Button variant="outline" className="w-full h-10 border-slate-300 hover:border-slate-400">
                      Contact IT Support
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50">
                      Agent Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            © 2024 AkwaabaHomes. Administrative access only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-slate-300 text-lg">Please wait while we load the admin portal</p>
          </div>
        </div>
      </div>
    }>
      <AdminSignInForm />
    </Suspense>
  );
}
