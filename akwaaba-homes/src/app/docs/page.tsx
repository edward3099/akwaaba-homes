import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Code, 
  Database, 
  Shield, 
  Users, 
  Home, 
  Search,
  Camera,
  FileText,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Zap,
  Globe,
  Smartphone,
  CreditCard,
  MapPin,
  MessageCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation | AkwaabaHomes',
  description: 'Complete technical documentation for AkwaabaHomes - Ghana\'s premier real estate platform.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AkwaabaHomes Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete technical documentation and API reference for developers, agents, and administrators
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="#overview" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    Platform Overview
                  </a>
                  <a href="#architecture" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    System Architecture
                  </a>
                  <a href="#api" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    API Documentation
                  </a>
                  <a href="#authentication" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    Authentication
                  </a>
                  <a href="#database" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    Database Schema
                  </a>
                  <a href="#storage" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    File Storage
                  </a>
                  <a href="#deployment" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    Deployment Guide
                  </a>
                  <a href="#testing" className="block text-sm text-blue-600 hover:text-blue-800 py-1">
                    Testing
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Platform Overview */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Platform Overview
                  </CardTitle>
                  <CardDescription>
                    AkwaabaHomes is a comprehensive real estate platform designed specifically for the Ghanaian market
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Target Market</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Diaspora buyers seeking properties in Ghana</li>
                        <li>• Local Ghanaian property buyers</li>
                        <li>• Licensed real estate agents</li>
                        <li>• Property developers and sellers</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Advanced property search and filtering</li>
                        <li>• Multi-currency support (GHS, USD, EUR)</li>
                        <li>• WhatsApp integration for communication</li>
                        <li>• Property verification and geo-tagging</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Next.js 15</Badge>
                      <Badge variant="secondary">React 18</Badge>
                      <Badge variant="secondary">TypeScript</Badge>
                      <Badge variant="secondary">TailwindCSS</Badge>
                      <Badge variant="secondary">Supabase</Badge>
                      <Badge variant="secondary">PostgreSQL</Badge>
                      <Badge variant="secondary">Vercel</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* System Architecture */}
            <section id="architecture">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    System Architecture
                  </CardTitle>
                  <CardDescription>
                    High-level overview of the platform's technical architecture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">Frontend</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Next.js 15 with App Router, React 18, TypeScript, and TailwindCSS
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">Backend</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Supabase with PostgreSQL, Real-time subscriptions, and Edge Functions
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">Deployment</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Vercel for frontend, Supabase for backend services
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Data Flow</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span>User Interface (React/Next.js)</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span>API Routes (Next.js API)</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Database className="h-4 w-4 text-green-600" />
                        <span>Supabase Database (PostgreSQL)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Documentation */}
            <section id="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-purple-600" />
                    API Documentation
                  </CardTitle>
                  <CardDescription>
                    RESTful API endpoints for property management, user authentication, and file uploads
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">GET</Badge>
                        <code className="text-sm font-mono">/api/properties</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Fetch all properties with optional filtering</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        Query params: ?location=accra&minPrice=100000&maxPrice=500000&bedrooms=3
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">POST</Badge>
                        <code className="text-sm font-mono">/api/properties</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Create a new property listing (Agent only)</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        Body: {"{ title, description, price, location, images, ... }"}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">GET</Badge>
                        <code className="text-sm font-mono">/api/user/profile</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Get current user's profile information</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        Headers: Authorization: Bearer {"<token>"}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">PUT</Badge>
                        <code className="text-sm font-mono">/api/user/profile</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Update user profile information</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        Body: {"{ full_name, company_name, license_number, ... }"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Authentication & Authorization
                  </CardTitle>
                  <CardDescription>
                    User authentication and role-based access control
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">User Roles</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <strong>Buyer:</strong> Browse and search properties</li>
                        <li>• <strong>Agent:</strong> Create and manage property listings</li>
                        <li>• <strong>Admin:</strong> Platform management and moderation</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Authentication Methods</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Email and password registration</li>
                        <li>• Supabase Auth integration</li>
                        <li>• JWT token-based sessions</li>
                        <li>• Row Level Security (RLS) policies</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Security Features</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Email Verification</Badge>
                      <Badge variant="secondary">Password Hashing</Badge>
                      <Badge variant="secondary">CSRF Protection</Badge>
                      <Badge variant="secondary">Rate Limiting</Badge>
                      <Badge variant="secondary">Input Validation</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Schema */}
            <section id="database">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    Database Schema
                  </CardTitle>
                  <CardDescription>
                    PostgreSQL database structure and relationships
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">profiles Table</h3>
                      <p className="text-sm text-gray-600 mb-2">User profile information and verification status</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        id, user_id, full_name, email, phone, user_role, verification_status, 
                        profile_image, cover_image, company_name, license_number, experience_years
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">properties Table</h3>
                      <p className="text-sm text-gray-600 mb-2">Property listings with detailed information</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        id, agent_id, title, description, price, currency, property_type, 
                        bedrooms, bathrooms, location, coordinates, approval_status, created_at
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">property_images Table</h3>
                      <p className="text-sm text-gray-600 mb-2">Property photos and media files</p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        id, property_id, image_url, alt_text, is_primary, display_order
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* File Storage */}
            <section id="storage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-600" />
                    File Storage & Media
                  </CardTitle>
                  <CardDescription>
                    Image upload and storage management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Storage Buckets</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <strong>avatars:</strong> User profile pictures</li>
                        <li>• <strong>properties:</strong> Property listing images</li>
                        <li>• <strong>documents:</strong> Verification documents</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">File Upload Process</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>1. Client selects file</li>
                        <li>2. File validation (type, size)</li>
                        <li>3. Upload to Supabase Storage</li>
                        <li>4. Generate public URL</li>
                        <li>5. Update database record</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Supported Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">JPEG</Badge>
                      <Badge variant="secondary">PNG</Badge>
                      <Badge variant="secondary">WebP</Badge>
                      <Badge variant="secondary">PDF</Badge>
                      <Badge variant="secondary">Max 10MB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Deployment Guide */}
            <section id="deployment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Deployment Guide
                  </CardTitle>
                  <CardDescription>
                    How to deploy AkwaabaHomes to production
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Environment Setup</h3>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br/>
                        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key<br/>
                        SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Vercel Deployment</h3>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Connect your GitHub repository to Vercel</li>
                        <li>Set environment variables in Vercel dashboard</li>
                        <li>Deploy automatically on git push</li>
                        <li>Configure custom domain (optional)</li>
                      </ol>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Database Migration</h3>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Run SQL migrations in Supabase dashboard</li>
                        <li>Set up Row Level Security policies</li>
                        <li>Configure storage buckets and policies</li>
                        <li>Seed initial data (optional)</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Testing */}
            <section id="testing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Testing
                  </CardTitle>
                  <CardDescription>
                    Testing strategies and tools used in the project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Frontend Testing</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Jest for unit testing</li>
                        <li>• React Testing Library</li>
                        <li>• Component testing</li>
                        <li>• Integration testing</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">E2E Testing</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Playwright for browser automation</li>
                        <li>• User journey testing</li>
                        <li>• Cross-browser compatibility</li>
                        <li>• Mobile responsiveness</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Test Coverage</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Unit Tests</Badge>
                      <Badge variant="secondary">Integration Tests</Badge>
                      <Badge variant="secondary">E2E Tests</Badge>
                      <Badge variant="secondary">API Tests</Badge>
                      <Badge variant="secondary">Accessibility Tests</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
