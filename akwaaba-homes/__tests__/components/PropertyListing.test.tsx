import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PropertyListing from '@/components/PropertyListing'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock currency formatter
jest.mock('@/lib/utils/currency', () => ({
  formatCurrency: (amount: number, currency: string = 'GHS') => {
    return `${currency} ${amount.toLocaleString()}`
  },
}))

const mockProperty = {
  id: 'test-property-1',
  title: 'Beautiful 3-Bedroom House in Accra',
  description: 'A stunning modern house with excellent amenities',
  price: 750000,
  currency: 'GHS',
  property_type: 'house',
  listing_type: 'sale',
  city: 'Accra',
  address: '123 Test Street, East Legon',
  bedrooms: 3,
  bathrooms: 2,
  area: 200,
  status: 'active',
  seller_id: 'seller-1',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  images: [
    {
      id: 'img-1',
      property_id: 'test-property-1',
      image_url: 'https://example.com/image1.jpg',
      is_primary: true,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'img-2',
      property_id: 'test-property-1',
      image_url: 'https://example.com/image2.jpg',
      is_primary: false,
      created_at: '2024-01-15T10:00:00Z',
    },
  ],
  seller: {
    id: 'seller-1',
    full_name: 'John Doe',
    company_name: 'Premium Properties Ltd',
    is_verified: true,
    verification_status: 'verified',
  },
}

describe('PropertyListing', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders property information correctly', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument()
    expect(screen.getByText('A stunning modern house with excellent amenities')).toBeInTheDocument()
    expect(screen.getByText('GHS 750,000')).toBeInTheDocument()
    expect(screen.getByText('Accra')).toBeInTheDocument()
    expect(screen.getByText('3 Bedrooms')).toBeInTheDocument()
    expect(screen.getByText('2 Bathrooms')).toBeInTheDocument()
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })

  it('displays property images correctly', () => {
    render(<PropertyListing property={mockProperty} />)
    
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    
    // Check primary image
    const primaryImage = images.find(img => img.getAttribute('src') === 'https://example.com/image1.jpg')
    expect(primaryImage).toBeInTheDocument()
  })

  it('shows property type and listing type badges', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('House')).toBeInTheDocument()
    expect(screen.getByText('For Sale')).toBeInTheDocument()
  })

  it('displays seller information correctly', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Premium Properties Ltd')).toBeInTheDocument()
    
    // Should show verification badge
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('handles click on property card', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }
    
    jest.doMock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }))
    
    render(<PropertyListing property={mockProperty} />)
    
    const propertyCard = screen.getByRole('button', { name: /Beautiful 3-Bedroom House in Accra/i })
    await user.click(propertyCard)
    
    // Should navigate to property detail page
    expect(mockRouter.push).toHaveBeenCalledWith(`/properties/${mockProperty.id}`)
  })

  it('shows property status correctly', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays price in correct format', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('GHS 750,000')).toBeInTheDocument()
  })

  it('shows property features correctly', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('3 Bedrooms')).toBeInTheDocument()
    expect(screen.getByText('2 Bathrooms')).toBeInTheDocument()
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })

  it('handles missing images gracefully', () => {
    const propertyWithoutImages = {
      ...mockProperty,
      images: [],
    }
    
    render(<PropertyListing property={propertyWithoutImages} />)
    
    // Should show placeholder or default image
    expect(screen.getByAltText('Property placeholder')).toBeInTheDocument()
  })

  it('handles missing seller information gracefully', () => {
    const propertyWithoutSeller = {
      ...mockProperty,
      seller: null,
    }
    
    render(<PropertyListing property={propertyWithoutSeller} />)
    
    // Should not crash and should handle missing seller gracefully
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('shows property creation date', () => {
    render(<PropertyListing property={mockProperty} />)
    
    // Should show relative time or formatted date
    expect(screen.getByText(/Listed/)).toBeInTheDocument()
  })

  it('handles different property types correctly', () => {
    const apartmentProperty = {
      ...mockProperty,
      property_type: 'apartment',
      listing_type: 'rent',
    }
    
    render(<PropertyListing property={apartmentProperty} />)
    
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByText('For Rent')).toBeInTheDocument()
  })

  it('displays contact information when available', () => {
    const propertyWithContact = {
      ...mockProperty,
      seller: {
        ...mockProperty.seller,
        phone: '+233 20 123 4567',
        email: 'john@premiumproperties.com',
      },
    }
    
    render(<PropertyListing property={propertyWithContact} />)
    
    expect(screen.getByText('+233 20 123 4567')).toBeInTheDocument()
    expect(screen.getByText('john@premiumproperties.com')).toBeInTheDocument()
  })

  it('shows property amenities when available', () => {
    const propertyWithAmenities = {
      ...mockProperty,
      amenities: ['Swimming Pool', 'Garden', 'Security', 'Parking'],
    }
    
    render(<PropertyListing property={propertyWithAmenities} />)
    
    expect(screen.getByText('Swimming Pool')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
  })

  it('handles long property titles gracefully', () => {
    const propertyWithLongTitle = {
      ...mockProperty,
      title: 'This is a very long property title that should be truncated or handled appropriately in the UI to prevent layout issues',
    }
    
    render(<PropertyListing property={propertyWithLongTitle} />)
    
    expect(screen.getByText(/This is a very long property title/)).toBeInTheDocument()
  })

  it('shows property location details correctly', () => {
    render(<PropertyListing property={mockProperty} />)
    
    expect(screen.getByText('Accra')).toBeInTheDocument()
    expect(screen.getByText('123 Test Street, East Legon')).toBeInTheDocument()
  })

  it('displays property price prominently', () => {
    render(<PropertyListing property={mockProperty} />)
    
    const priceElement = screen.getByText('GHS 750,000')
    expect(priceElement).toBeInTheDocument()
    
    // Price should be prominently displayed
    expect(priceElement).toHaveClass(/text-2xl|text-xl|font-bold/)
  })

  it('shows property status badge with correct styling', () => {
    render(<PropertyListing property={mockProperty} />)
    
    const statusBadge = screen.getByText('Active')
    expect(statusBadge).toBeInTheDocument()
    
    // Status badge should have appropriate styling
    expect(statusBadge).toHaveClass(/badge|status|tag/)
  })

  it('handles property without description gracefully', () => {
    const propertyWithoutDescription = {
      ...mockProperty,
      description: null,
    }
    
    render(<PropertyListing property={propertyWithoutDescription} />)
    
    // Should not crash and should handle missing description
    expect(screen.queryByText('A stunning modern house with excellent amenities')).not.toBeInTheDocument()
  })

  it('shows property verification status correctly', () => {
    const unverifiedProperty = {
      ...mockProperty,
      seller: {
        ...mockProperty.seller,
        is_verified: false,
        verification_status: 'pending',
      },
    }
    
    render(<PropertyListing property={unverifiedProperty} />)
    
    expect(screen.getByText('Pending Verification')).toBeInTheDocument()
  })

  it('displays property images in correct order', () => {
    render(<PropertyListing property={mockProperty} />)
    
    const images = screen.getAllByRole('img')
    
    // Primary image should be first
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg')
    expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg')
  })

  it('handles property with missing area information', () => {
    const propertyWithoutArea = {
      ...mockProperty,
      area: null,
    }
    
    render(<PropertyListing property={propertyWithoutArea} />)
    
    // Should not show area if not available
    expect(screen.queryByText(/m²/)).not.toBeInTheDocument()
  })

  it('shows property features in correct format', () => {
    render(<PropertyListing property={mockProperty} />)
    
    // Features should be displayed in a readable format
    expect(screen.getByText('3 Bedrooms')).toBeInTheDocument()
    expect(screen.getByText('2 Bathrooms')).toBeInTheDocument()
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })
})
