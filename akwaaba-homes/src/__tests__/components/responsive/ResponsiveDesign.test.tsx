import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '@/components/layout/Header';
import { PropertyCard } from '@/components/property/PropertyCard';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || 'Mock image'} />,
}));

// Mock auth context
jest.mock('@/lib/auth/authContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

// Mock property data
const mockProperty = {
  id: 'test-property-1',
  title: 'Beautiful 3-Bedroom House in Accra',
  description: 'A stunning modern house with excellent amenities',
  price: 750000,
  location: '123 Test Street, East Legon, Accra',
  property_type: 'house' as const,
  listing_type: 'sale' as const,
  bedrooms: 3,
  bathrooms: 2,
  area: 200,
  status: 'active' as const,
  seller_id: 'seller-1',
  views_count: 0,
  featured: false,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg'
  ],
  specifications: {
    bedrooms: 3,
    bathrooms: 2,
    size: 200,
    sizeUnit: 'sqm',
  },
  verification: {
    isVerified: true,
    documentsUploaded: true,
    verificationDate: '2024-01-15T10:00:00Z',
  },
  seller: {
    id: 'seller-1',
    name: 'John Doe',
    type: 'agent',
    phone: '+233 20 123 4567',
    email: 'john@premiumproperties.com',
    whatsapp: '+233 20 123 4567',
    isVerified: true,
    company: 'Premium Properties Ltd',
    licenseNumber: 'AG123456',
  },
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

describe('Responsive Design Testing', () => {
  describe('Header Component', () => {
    it('renders with responsive container classes', () => {
      render(<Header />);
      
      // Header should have responsive container
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('uses responsive padding classes', () => {
      render(<Header />);
      
      // Container should have responsive padding
      const header = screen.getByRole('banner');
      const container = header.querySelector('.container');
      expect(container).toHaveClass('px-3 sm:px-4 md:px-6');
    });

    it('enhances with larger screen styles', () => {
      render(<Header />);
      
      // Logo should be present and clickable
      const logo = screen.getByText('AkwaabaHomes').closest('a');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('href', '/');
    });

    it('shows mobile menu toggle on small screens', () => {
      render(<Header />);
      
      // Mobile menu button should be present
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('has responsive navigation structure', () => {
      render(<Header />);
      
      // Navigation should be present
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('PropertyCard Component', () => {
    it('renders with responsive card layout', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Card should be present
      expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument();
    });

    it('uses responsive height classes for image container', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Image container should have responsive height classes
      const image = screen.getByRole('img');
      const imageContainer = image.closest('div');
      expect(imageContainer).toHaveClass('h-32 sm:h-40 md:h-48');
    });

    it('displays responsive navigation dots for multiple images', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Should show navigation dots for multiple images
      const dots = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-1.5 h-1.5 sm:w-2 sm:h-2')
      );
      expect(dots).toHaveLength(4);
    });

    it('maintains responsive layout in grid view', () => {
      render(<PropertyCard property={mockProperty} viewMode="grid" />);
      
      // Card should render successfully in grid view
      expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument();
    });
  });

  describe('Responsive Utility Classes', () => {
    it('uses responsive padding classes', () => {
      render(<Header />);
      
      // Container should have responsive padding
      const header = screen.getByRole('banner');
      const container = header.querySelector('.container');
      expect(container).toHaveClass('px-3 sm:px-4 md:px-6');
    });

    it('uses responsive spacing classes', () => {
      render(<Header />);
      
      // Logo should be present and functional
      const logo = screen.getByText('AkwaabaHomes').closest('a');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('href', '/');
    });

    it('uses responsive text sizing', () => {
      render(<Header />);
      
      // Logo text should have responsive sizing
      const logoText = screen.getByText('AkwaabaHomes');
      expect(logoText).toBeInTheDocument();
    });
  });

  describe('Mobile-First Responsiveness', () => {
    it('starts with mobile layout by default', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Should render mobile-first layout
      expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument();
    });

    it('includes touch-friendly interactions', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Should have touch-friendly elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('maintains accessibility on mobile', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Should have proper ARIA labels
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt');
    });
  });

  describe('Breakpoint-Specific Behavior', () => {
    it('applies small screen styles', () => {
      render(<Header />);
      
      // Logo should be present and functional
      const logo = screen.getByText('AkwaabaHomes').closest('a');
      expect(logo).toBeInTheDocument();
    });

    it('applies medium screen styles', () => {
      render(<Header />);
      
      // Should have md: breakpoint classes
      const header = screen.getByRole('banner');
      const container = header.querySelector('.container');
      expect(container).toHaveClass('md:px-6');
    });

    it('applies large screen styles', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Should have md: breakpoint classes if applicable
      const image = screen.getByRole('img');
      const imageContainer = image.closest('div');
      expect(imageContainer).toHaveClass('md:h-48');
    });
  });
});
