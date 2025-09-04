'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Home } from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  
  // Check if user is authenticated and get user profile
  const isAuthenticated = !!user;
  const userProfile = user?.user_metadata;

  // Header component - List Your Property button has been removed

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
        <div className="flex h-14 sm:h-16 items-center justify-between min-w-0 overflow-hidden">
          {/* Logo - Mobile-first responsive design */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent flex-shrink-0">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            
            {/* Logo text with progressive enhancement */}
            <div className="flex flex-col min-w-0">
              {/* Always show main logo text on mobile, with responsive sizing */}
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold gradient-text truncate">
                Akwaaba Homes
              </span>
              {/* Show tagline on larger screens */}
              <span className="text-xs text-muted-foreground hidden sm:block">Ghana Real Estate</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav id="navigation" role="navigation" aria-label="Main navigation" className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/agents"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              Agents
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/developers"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              Developers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              Privacy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            
            {/* Test Page Links - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Link
                  href="/test-apis"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors relative group"
                >
                  Test APIs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/test-image-system"
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors relative group"
                >
                  Test Images
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/test-integration"
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors relative group"
                >
                  Test Integration
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
                </Link>
              </>
            )}
            
            {/* Dashboard Links - Only show when authenticated */}
            {isAuthenticated && userProfile && (
              <>
                {userProfile.user_type === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors relative group"
                  >
                    Admin Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full"></span>
                  </Link>
                )}
                {userProfile.user_type === 'agent' && (
                  <Link
                    href="/agent-dashboard"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors relative group"
                  >
                    Agent Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side - Auth buttons or user menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0 min-w-0">
            {!loading && (
              <>
                {!isAuthenticated ? (
                  <div className="hidden sm:flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center space-x-2">
                    {userProfile?.user_type === 'admin' ? (
                      <Link href="/admin">
                        <Button variant="outline" size="sm">
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : userProfile?.user_type === 'agent' ? (
                      <Link href="/agent-dashboard">
                        <Button variant="outline" size="sm">
                          Agent Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <div className="hidden sm:flex items-center space-x-2">
                        {userProfile?.user_type === 'admin' ? (
                          <Link href="/admin">
                            <Button variant="outline" size="sm">
                              Admin Dashboard
                            </Button>
                          </Link>
                        ) : userProfile?.user_type === 'agent' ? (
                          <Link href="/agent-dashboard">
                            <Button variant="outline" size="sm">
                              Agent Dashboard
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/properties">
                            <Button variant="outline" size="sm">
                              Browse Properties
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                    <Link href="/profile">
                      <Button size="sm">
                        Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors ml-1 sm:ml-2 flex-shrink-0 touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav role="navigation" aria-label="Mobile navigation" className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-3 sm:px-4 py-4 space-y-2">
              <Link
                href="/agents"
                className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Agents
              </Link>
              <Link
                href="/developers"
                className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Developers
              </Link>
              <Link
                href="/privacy"
                className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy
              </Link>
              <Link
                href="/about"
                className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Test Page Links - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Link
                    href="/test-apis"
                    className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Test APIs
                  </Link>
                  <Link
                    href="/test-image-system"
                    className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Test Images
                  </Link>
                  <Link
                    href="/test-integration"
                    className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Test Integration
                  </Link>
                </>
              )}
              
              {/* Dashboard Links - Only show when authenticated */}
              {isAuthenticated && userProfile && (
                <>
                  {userProfile.user_type === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {userProfile.user_type === 'agent' && (
                    <Link
                      href="/agent-dashboard"
                      className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Agent Dashboard
                    </Link>
                  )}
                  {userProfile.user_type === 'seller' && (
                    <Link
                      href="/seller-dashboard"
                      className="block px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-green-600 hover:text-blue-700 hover:bg-green-50 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Seller Dashboard
                    </Link>
                  )}
                </>
              )}
              
              <div className="pt-4 border-t">
                <div className="px-3 sm:px-4 py-2 space-y-3">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
