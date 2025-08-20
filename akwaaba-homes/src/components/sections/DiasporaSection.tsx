'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Globe, 
  DollarSign, 
  Video, 
  Calendar, 
  Users, 
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Plane,
  Heart
} from 'lucide-react';

export function DiasporaSection() {
  const diasporaFeatures = [
    {
      icon: DollarSign,
      title: 'Multi-Currency Display',
      description: 'View prices in GHS, USD, GBP, and EUR with real-time exchange rates.',
      highlight: 'Real-time rates'
    },
    {
      icon: Video,
      title: 'Virtual Property Tours',
      description: '360° virtual tours and video walkthroughs from the comfort of your current location.',
      highlight: 'HD quality'
    },
    {
      icon: Calendar,
      title: 'Family Inspection Scheduling',
      description: 'Schedule property inspections for family members or representatives in Ghana.',
      highlight: 'Easy scheduling'
    },
    {
      icon: Users,
      title: 'Diaspora Support Team',
      description: 'Dedicated support team that understands the unique needs of diaspora buyers.',
      highlight: '24/7 support'
    }
  ];

  const buyingSteps = [
    {
      step: '01',
      title: 'Browse & Filter',
      description: 'Search properties in your preferred currency and filter by your specific needs.'
    },
    {
      step: '02',
      title: 'Virtual Tour',
      description: 'Take detailed virtual tours and schedule video calls with agents.'
    },
    {
      step: '03',
      title: 'Family Inspection',
      description: 'Arrange for family members or trusted representatives to inspect properties.'
    },
    {
      step: '04',
      title: 'Secure Purchase',
      description: 'Complete the purchase with our secure, international-friendly process.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Osei',
      location: 'London, UK',
      message: 'Found my retirement home in Accra from London. The virtual tours and family inspection service made it seamless.',
      flag: '🇬🇧'
    },
    {
      name: 'Kwame Asante',
      location: 'Toronto, Canada',
      message: 'The multi-currency feature and dedicated diaspora support made buying property in Ghana stress-free.',
      flag: '🇨🇦'
    },
    {
      name: 'Akosua Mensah',
      location: 'New York, USA',
      message: 'Excellent service! My family in Ghana helped with the inspection while I handled everything remotely.',
      flag: '🇺🇸'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        {/* Currency Feature Highlight */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                See Prices in Your Currency
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                All properties display prices in multiple currencies with real-time exchange rates. 
                No more mental calculations - see exactly what you&apos;ll pay in your local currency.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-verified" />
                  <span>Real-time exchange rates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-verified" />
                  <span>GHS, USD, GBP, EUR supported</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-verified" />
                  <span>Transparent pricing</span>
                </div>
              </div>
              
              <Button className="btn-ghana">
                View Properties
              </Button>
            </div>
            
            <div className="bg-muted/50 rounded-2xl p-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold">Example Property Price</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg">
                  <span className="font-medium">🇬🇭 Ghana Cedis</span>
                  <span className="text-lg font-bold text-primary">₵ 850,000</span>
                </div>
                <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg">
                  <span className="font-medium">🇺🇸 US Dollar</span>
                  <span className="text-lg font-bold">$ 52,700</span>
                </div>
                <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg">
                  <span className="font-medium">🇬🇧 British Pound</span>
                  <span className="text-lg font-bold">£ 41,650</span>
                </div>
                <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg">
                  <span className="font-medium">🇪🇺 Euro</span>
                  <span className="text-lg font-bold">€ 49,300</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                *Rates updated in real-time
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-center text-white">
          <Plane className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Invest in Ghana Real Estate?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of diaspora Ghanaians who have successfully purchased 
            properties back home through our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Browse Properties Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Phone className="w-4 h-4 mr-2" />
              Schedule Consultation
            </Button>
          </div>
          

        </div>
      </div>
    </section>
  );
}
