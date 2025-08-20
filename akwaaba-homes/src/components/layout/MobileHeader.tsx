'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  PlusCircle, 
  User,
  Shield,
  Heart,
  Bell
} from 'lucide-react';

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Buy', href: '/search?status=for-sale', icon: Home },
    { name: 'Rent', href: '/search?status=for-rent', icon: Search },
    { name: 'Sell', href: '/seller', icon: PlusCircle },
    { name: 'About', href: '/about', icon: Shield },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open on mobile
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  useEffect(() => {
    // Clean up body scroll lock on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 touch-manipulation">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-ghana-red via-ghana-gold to-ghana-green rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                AkwaabaHomes
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary tap-target flex items-center justify-center"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="tap-target">
              <Heart className="w-4 h-4 mr-2" />
              Saved
            </Button>
            <Button variant="outline" size="sm" className="tap-target">
              Log in
            </Button>
            <Button size="sm" className="btn-ghana tap-target">
              Sign up
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden tap-target touch-manipulation"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 md:hidden z-40">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 mobile-menu-overlay"
              onClick={toggleMenu}
            />
            
            {/* Menu Panel */}
            <div className="relative bg-white border-t animate-slide-up mobile-safe-area">
              <div className="px-4 pt-4 pb-6 space-y-1 smooth-scroll max-h-screen overflow-y-auto">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-4 text-base font-medium rounded-lg hover:bg-muted transition-all duration-200 touch-manipulation animate-fade-in tap-target"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={toggleMenu}
                    >
                      <Icon className="w-5 h-5 mr-3 text-muted-foreground" />
                      {item.name}
                    </Link>
                  );
                })}
                
                <div className="pt-6 pb-2 border-t">
                  <div className="flex flex-col space-y-3">
                    <Button variant="ghost" className="justify-start tap-target h-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <Heart className="w-4 h-4 mr-3" />
                      Saved Properties
                    </Button>
                    <Button variant="ghost" className="justify-start tap-target h-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                      <Bell className="w-4 h-4 mr-3" />
                      Notifications
                    </Button>
                    <Button variant="ghost" className="justify-start tap-target h-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                      <User className="w-4 h-4 mr-3" />
                      My Account
                    </Button>
                  </div>
                  
                  <div className="flex space-x-3 mt-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                    <Button variant="outline" size="lg" className="flex-1 tap-target h-12">
                      Log in
                    </Button>
                    <Button size="lg" className="btn-ghana flex-1 tap-target h-12">
                      Sign up
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
