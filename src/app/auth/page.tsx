'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Home, Shield } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      if (user.user_metadata?.user_type === 'admin') {
        router.push('/admin');
      } else if (user.user_metadata?.user_type === 'agent') {
        router.push('/agent-dashboard');
      } else if (user.user_metadata?.user_type === 'seller') {
        router.push('/seller-dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect due to useEffect
  }

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const handleSuccess = () => {
    // Form will handle success, this is just a fallback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <Home className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Akwaaba Homes</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Ghana's Premier Real Estate Platform
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Connect with trusted real estate professionals, discover your dream property, 
              and experience seamless property management with our comprehensive platform.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Secure & Trusted</h3>
                <p className="text-gray-600">Verified professionals and secure transactions</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Professional Network</h3>
                <p className="text-gray-600">Connect with licensed agents and verified sellers</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Home className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Property Excellence</h3>
                <p className="text-gray-600">Curated properties with detailed information</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication Forms */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Home className="h-10 w-10 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Akwaaba Homes</h1>
              </div>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Authentication Forms */}
            {mode === 'signin' && (
              <SignInForm
                onSuccess={handleSuccess}
                onSwitchToSignUp={() => handleModeChange('signup')}
                onForgotPassword={() => handleModeChange('forgot-password')}
              />
            )}

            {mode === 'signup' && (
              <SignUpForm
                onSuccess={handleSuccess}
                onSwitchToSignIn={() => handleModeChange('signin')}
              />
            )}

            {mode === 'forgot-password' && (
              <ForgotPasswordForm
                onBackToSignIn={() => handleModeChange('signin')}
              />
            )}

            {/* Quick Mode Switcher */}
            <div className="mt-6">
              <Card>
                <CardContent className="p-4">
                  <Tabs value={mode} onValueChange={(value) => handleModeChange(value as AuthMode)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      <TabsTrigger value="forgot-password">Reset</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
