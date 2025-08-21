'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Home, MapPin, Phone } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Buy', href: '/search?status=for-sale' },
    { name: 'Rent', href: '/search?status=for-rent' },
    { name: 'Sell', href: '/seller' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-lg font-bold gradient-text whitespace-nowrap">AkwaabaHomes</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Ghana Real Estate</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Trust Indicators & Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Verification Badge */}
            <Badge variant="secondary" className="hidden xl:flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-verified rounded-full"></div>
              Verified Platform
            </Badge>

            {/* Contact */}
            <div className="hidden xl:flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>+233 XX XXX XXXX</span>
            </div>

            {/* Currency Toggle - placeholder for now */}
            <div className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-muted rounded-lg text-xs">
              <span>₵ GHS</span>
            </div>

            {/* CTA Button */}
            <Button size="sm" className="btn-ghana hidden sm:flex text-xs sm:text-sm">
              List Property
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden tap-target touch-manipulation h-8 w-8 sm:h-9 sm:w-9 p-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background animate-slide-up">
            <div className="px-3 pt-3 pb-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-sm sm:text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors tap-target touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">Currency:</span>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-sm">
                    ₵ GHS
                  </div>
                </div>
                <div className="px-3 py-2">
                  <Button className="w-full btn-ghana">
                    List Your Property
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
