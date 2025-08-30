import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Home, 
  Search,
  Shield,
  CreditCard,
  MapPin,
  Camera,
  FileText,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help & Support | AkwaabaHomes',
  description: 'Get help and support for using AkwaabaHomes - Ghana\'s premier real estate platform for diaspora buyers.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help & Support
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get the help you need to navigate AkwaabaHomes and find your perfect property in Ghana
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-600" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get started with AkwaabaHomes in just a few steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Create Account</h3>
                      <p className="text-sm text-gray-600">Sign up as a buyer, agent, or seller</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Search Properties</h3>
                      <p className="text-sm text-gray-600">Use filters to find your ideal property</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Contact Agent</h3>
                      <p className="text-sm text-gray-600">Reach out via WhatsApp, call, or email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Schedule Inspection</h3>
                      <p className="text-sm text-gray-600">Arrange property viewing or virtual tour</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions and answers about using AkwaabaHomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">How do I search for properties?</h3>
                    <p className="text-gray-600 mt-1">
                      Use our advanced search filters to find properties by location, price range, property type, 
                      number of bedrooms, and more. You can also search by specific areas like East Legon, 
                      Airport Residential, or Trasacco Valley.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">How can I contact an agent?</h3>
                    <p className="text-gray-600 mt-1">
                      You can contact agents through multiple channels: WhatsApp (most popular in Ghana), 
                      phone call, or email. Each property listing shows the agent's contact information 
                      and preferred communication method.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Can I schedule property inspections from abroad?</h3>
                    <p className="text-gray-600 mt-1">
                      Yes! We offer inspection scheduling for diaspora buyers. You can arrange for family 
                      members, friends, or our trusted representatives to inspect properties on your behalf. 
                      Virtual tours are also available for many properties.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">How do I verify property authenticity?</h3>
                    <p className="text-gray-600 mt-1">
                      All properties on AkwaabaHomes are verified through our multi-step process including 
                      geo-tagging, document verification, and agent background checks. Look for the green 
                      verification badge on property listings.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">What payment methods are accepted?</h3>
                    <p className="text-gray-600 mt-1">
                      We support multiple payment methods including bank transfers, mobile money (MTN, Vodafone, AirtelTigo), 
                      and international wire transfers. All transactions are secure and tracked.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Agents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  For Real Estate Agents
                </CardTitle>
                <CardDescription>
                  Learn how to maximize your success on AkwaabaHomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">
                      Upload professional photos, add your license number, and showcase your specializations 
                      to build trust with potential clients.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Upload Quality Photos</h3>
                    <p className="text-sm text-gray-600">
                      Use high-resolution images and include multiple angles. Properties with better photos 
                      get 3x more inquiries.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Respond Quickly</h3>
                    <p className="text-sm text-gray-600">
                      Diaspora buyers expect quick responses. Aim to respond within 2 hours during business hours 
                      to increase conversion rates.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Use WhatsApp</h3>
                    <p className="text-sm text-gray-600">
                      WhatsApp is the preferred communication method in Ghana. Make sure your WhatsApp number 
                      is prominently displayed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+233 24 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@akwaabahomes.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 8AM-6PM GMT</p>
                    <p className="text-sm text-gray-600">Sat: 9AM-3PM GMT</p>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Search Properties
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Agents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
              </CardContent>
            </Card>

            {/* Trust & Safety */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Trust & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Verified Properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Licensed Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">24/7 Support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
