'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search/SearchBar';
import { 
  TrendingUp, 
  Shield, 
  Globe, 
  Users, 
  CheckCircle,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';

export function HeroSection() {
  const phrases = [
    'Find Your Perfect Ghanaian Home',
    'Discover Your Dream Ghana Property', 
    'Uncover Ghana\'s Finest Residences',
    'Your Ideal Tropical Home Awaits',
    'Own Your Ghanaian Heritage Haven'
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 800); // Longer fade out for better readability
    }, 4500); // Change phrase every 4.5 seconds (more time to read)

    return () => clearInterval(interval);
  }, [phrases.length, isPaused]);

  return (
    <section className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Floating Elements - Hidden on mobile */}
      <div className="hidden lg:block absolute top-20 left-10 animate-float">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div className="hidden lg:block absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
          <Globe className="w-6 h-6 text-accent" />
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-40 left-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-14 h-14 bg-verified/10 rounded-full flex items-center justify-center">
          <Users className="w-7 h-7 text-[oklch(var(--verified))]" />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 z-10">
        <div className="text-center max-w-4xl sm:max-w-5xl mx-auto">
          {/* Trust Badge */}
          <Badge variant="secondary" className="mb-3 sm:mb-4 md:mb-6 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm">
            <CheckCircle className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2 text-verified flex-shrink-0" />
            Ghana&apos;s Most Trusted Real Estate Platform
          </Badge>

          {/* Main Headline */}
          <div 
            className="mb-3 sm:mb-4 md:mb-6 px-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            tabIndex={0}
            role="region"
            aria-label="Animated headline text"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight text-center">
              <span 
                className={`gradient-text inline-block transition-all duration-700 ease-in-out transform ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                }`}
                style={{ 
                  minHeight: '1.2em',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Add subtle text shadow for better visibility
                  WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.1)' // Add subtle stroke for better definition
                }}
              >
                {phrases[currentPhraseIndex]}
              </span>
            </h1>
            {/* Subtle indicator that text changes */}
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                {phrases.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentPhraseIndex 
                        ? 'bg-primary' 
                        : 'bg-primary/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Discover verified properties from trusted agents and developers. 
            Perfect for locals and diaspora buyers seeking quality homes in prime locations.
          </p>

          {/* USP Highlights */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 px-4">
            <div className="flex items-center gap-2 bg-white/80 px-3 md:px-4 py-2 rounded-full border">
              <Shield className="w-3 md:w-4 h-3 md:h-4 text-verified" />
              <span className="text-xs md:text-sm font-medium">Verified Properties</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3 md:px-4 py-2 rounded-full border">
              <Globe className="w-3 md:w-4 h-3 md:h-4 text-primary" />
              <span className="text-xs md:text-sm font-medium">Multi-Currency</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3 md:px-4 py-2 rounded-full border">
              <Users className="w-3 md:w-4 h-3 md:h-4 text-accent" />
              <span className="text-xs md:text-sm font-medium">Diaspora Friendly</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8 md:mb-12 px-2">
            <SearchBar showAdvancedFilters />
          </div>






        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             }}
        />
      </div>
    </section>
  );
}
