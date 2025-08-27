'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMockAuth, MockAuthProvider } from '@/lib/mock-auth/mockAuthContext';

function MockLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useMockAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect based on role (will be determined by email)
        if (email.includes('admin')) {
          router.push('/admin');
        } else if (email.includes('agent')) {
          router.push('/agent-dashboard');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Mock Login (Development Only)
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use any email/password to test dashboards
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (determines role)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="admin@example.com or agent@example.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                admin@... = Admin Dashboard | agent@... = Agent Dashboard
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password (any password works)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter any password"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              <strong>Quick Login Examples:</strong>
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@akwaaba.com');
                  setPassword('password123');
                }}
                className="block w-full text-xs text-purple-600 hover:text-purple-500"
              >
                admin@akwaaba.com (Admin Dashboard)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('agent@akwaaba.com');
                  setPassword('password123');
                }}
                className="block w-full text-xs text-purple-600 hover:text-purple-500"
              >
                agent@akwaaba.com (Agent Dashboard)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MockLoginPage() {
  return (
    <MockAuthProvider>
      <MockLoginForm />
    </MockAuthProvider>
  );
}
