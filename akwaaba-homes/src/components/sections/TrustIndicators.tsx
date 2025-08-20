'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  CheckCircle, 
  Award, 
  Users, 
  Clock, 
  MapPin,
  Star,
  TrendingUp,
  Lock,
  Verified,
  Phone,
  FileCheck
} from 'lucide-react';

export function TrustIndicators() {
  const trustFeatures = [
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'Every property undergoes thorough verification including document checks and physical inspections.',
      stat: '98%',
      statLabel: 'Verified Rate'
    },
    {
      icon: CheckCircle,
      title: 'Licensed Agents',
      description: 'All agents are licensed real estate professionals with verified credentials and positive reviews.',
      stat: '500+',
      statLabel: 'Verified Agents'
    },
    {
      icon: Lock,
      title: 'Secure Transactions',
      description: 'Your data and transactions are protected with bank-level security and encryption.',
      stat: '100%',
      statLabel: 'Secure'
    },
    {
      icon: Users,
      title: 'Satisfied Clients',
      description: 'Join thousands of happy clients who found their dream homes through our platform.',
      stat: '2,500+',
      statLabel: 'Happy Clients'
    }
  ];

  const verificationSteps = [
    {
      icon: FileCheck,
      title: 'Document Verification',
      description: 'We verify property titles, land certificates, and all legal documents.'
    },
    {
      icon: MapPin,
      title: 'Location Confirmation',
      description: 'Physical site visits and GPS coordinates confirm exact property locations.'
    },
    {
      icon: Verified,
      title: 'Agent Screening',
      description: 'Comprehensive background checks and license verification for all agents.'
    },
    {
      icon: Star,
      title: 'Quality Assurance',
      description: 'Regular reviews and quality checks ensure maintained standards.'
    }
  ];

  const awards = [
    {
      title: 'Best Real Estate Platform',
      year: '2024',
      organization: 'Ghana Property Awards'
    },
    {
      title: 'Most Trusted Platform',
      year: '2023',
      organization: 'Real Estate Excellence'
    },
    {
      title: 'Innovation in PropTech',
      year: '2023',
      organization: 'Ghana Tech Awards'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Trust & Security
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Why Choose</span>
            <br />
            <span className="gradient-text">AkwaabaHomes?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've built Ghana's most trusted real estate platform with security, 
            verification, and transparency at the core of everything we do.
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="property-card-shadow hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                
                <div className="pt-4 border-t border-border">
                  <div className="text-2xl font-bold text-primary">{feature.stat}</div>
                  <div className="text-xs text-muted-foreground">{feature.statLabel}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification Process */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Our Verification Process</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every property goes through our rigorous 4-step verification process 
              to ensure authenticity and quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Connection Line */}
                {index < verificationSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>



        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Find Your Dream Home?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who trust AkwaabaHomes for their real estate needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-ghana">
              Start Searching Properties
            </Button>
            <Button size="lg" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Speak to an Expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
