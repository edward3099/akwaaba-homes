'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Shield, 
  Award, 
  CheckCircle,
  Star
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Trust & Integrity",
      description: "We believe in building lasting relationships based on honesty, transparency, and ethical business practices."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Customer First",
      description: "Every decision we make is centered around providing exceptional service and value to our clients."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our business, from property selection to customer service."
    },
    {
      icon: <Home className="w-8 h-8 text-orange-600" />,
      title: "Local Expertise",
              description: "Deep knowledge of Ghana&apos;s real estate market and local communities to serve you better."
    }
  ];

  const stats = [
    { number: "500+", label: "Properties Listed" },
    { number: "50+", label: "Verified Agents" },
    { number: "1000+", label: "Happy Clients" },
    { number: "5+", label: "Years Experience" }
  ];

  const team = [
    {
      name: "Kwame Asante",
      role: "Founder & CEO",
      description: "15+ years in Ghana real estate with deep market knowledge and a passion for helping families find their perfect homes."
    },
    {
      name: "Ama Osei",
      role: "Head of Operations",
      description: "Expert in property management and customer service, ensuring smooth operations and client satisfaction."
    },
    {
      name: "Kofi Mensah",
      role: "Lead Property Consultant",
      description: "Specialist in residential and commercial properties with extensive network in Accra and surrounding areas."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About AkwaabaHomes</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner in Ghana real estate.             We&apos;re dedicated to helping families find their perfect homes 
            and investors discover profitable opportunities in one of Africa&apos;s most promising markets.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              To make quality housing accessible to every Ghanaian family while providing exceptional service 
              and building lasting relationships with our clients and partners.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We believe that everyone deserves a place to call home, and we&apos;re committed to making that dream 
              a reality through our comprehensive real estate services.
            </p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Vision</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              To become Ghana&apos;s most trusted and innovative real estate platform, setting industry standards 
              for quality, transparency, and customer satisfaction.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We envision a future where finding the perfect home is seamless, transparent, and accessible to everyone.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Choose AkwaabaHomes?</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Verified Properties</h3>
                  <p className="text-slate-600">Every property is thoroughly vetted to ensure quality and authenticity.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Expert Agents</h3>
                  <p className="text-slate-600">Our team of verified agents has deep local knowledge and experience.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Transparent Process</h3>
                  <p className="text-slate-600">Clear communication and honest pricing throughout your journey.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">24/7 Support</h3>
                  <p className="text-slate-600">We&apos;re here to help whenever you need assistance.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Ready to Get Started?</h3>
              <p className="text-slate-600 mb-6">
                Whether you&apos;re looking to buy, sell, or rent property in Ghana, our team is here to help. 
                Get in touch with us today!
              </p>
              <div className="space-y-3">
                <Link href="/contact">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Contact Us
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Become an Agent
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Ghana Real Estate Market */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Ghana Real Estate Market</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Market Overview</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Ghana&apos;s real estate market is experiencing significant growth, driven by urbanization, 
                economic development, and increasing foreign investment. The market offers diverse opportunities 
                across residential, commercial, and investment properties.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Key markets include Greater Accra, Ashanti, and Western regions, each offering unique 
                advantages for different types of investors and homebuyers.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Residential</Badge>
                <Badge variant="secondary">Commercial</Badge>
                <Badge variant="secondary">Luxury Homes</Badge>
                <Badge variant="secondary">Investment</Badge>
                <Badge variant="secondary">Land Development</Badge>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Market Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700">Strong economic growth driving demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700">Growing middle class population</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700">Favorable government policies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700">Increasing foreign investment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700">Infrastructure development</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect properties through AkwaabaHomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Browse Properties
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}






