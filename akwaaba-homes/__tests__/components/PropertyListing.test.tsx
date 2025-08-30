import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { PropertyCard } from '@/components/property/PropertyCard'

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
  currency: 'GHS' as const,
  status: 'for-sale' as const,
  type: 'house' as const,
  location: {
    address: '123 Test Street, East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana' as const,
    coordinates: {
      lat: 5.5600,
      lng: -0.2057,
    },
  },
  specifications: {
    bedrooms: 3,
    bathrooms: 2,
    size: 200,
    sizeUnit: 'sqm' as const,
  },
  images: ['https://example.com/image1.jpg'],
  features: ['Modern Kitchen', 'Garden'],
  amenities: ['Swimming Pool', 'Security'],
  seller: {
    id: 'seller-1',
    name: 'John Doe',
    type: 'agent' as const,
    phone: '+233 20 123 4567',
    email: 'john@premiumproperties.com',
    whatsapp: '+233 20 123 4567',
    isVerified: true,
    company: 'Premium Properties Ltd',
    licenseNumber: 'AG123456',
  },
  verification: {
    isVerified: true,
    documentsUploaded: true,
    verificationDate: '2024-01-15T10:00:00Z',
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  expiresAt: '2024-02-14T10:00:00Z',
  tier: 'normal' as const,
}

describe('PropertyCard', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument()
    expect(screen.getByText('A stunning modern house with excellent amenities')).toBeInTheDocument()
    expect(screen.getByText('GHS 750,000')).toBeInTheDocument()
    expect(screen.getByText('Accra')).toBeInTheDocument()
    expect(screen.getByText('3 Bedrooms')).toBeInTheDocument()
    expect(screen.getByText('2 Bathrooms')).toBeInTheDocument()
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })

  it('displays property images correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)
    
    // Check primary image
    const primaryImage = images.find(img => img.getAttribute('src') === 'https://example.com/image1.jpg')
    expect(primaryImage).toBeInTheDocument()
  })

  it('shows property type and status badges', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('House')).toBeInTheDocument()
    expect(screen.getByText('For Sale')).toBeInTheDocument()
  })

  it('displays seller information correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
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
    
    render(<PropertyCard property={mockProperty} />)
    
    const propertyCard = screen.getByRole('button', { name: /Beautiful 3-Bedroom House in Accra/i })
    await user.click(propertyCard)
    
    // Should navigate to property detail page
    expect(mockRouter.push).toHaveBeenCalledWith(`/properties/${mockProperty.id}`)
  })

  it('shows property status correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays price in correct format', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('GHS 750,000')).toBeInTheDocument()
  })

  it('shows property features correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('3 Bedrooms')).toBeInTheDocument()
    expect(screen.getByText('2 Bathrooms')).toBeInTheDocument()
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })

  it('handles missing images gracefully', () => {
    const propertyWithoutImages = {
      ...mockProperty,
      images: [],
    }
    
    render(<PropertyCard property={propertyWithoutImages} />)
    
    // Should show placeholder or default image
    expect(screen.getByAltText('Property placeholder')).toBeInTheDocument()
  })

  it('handles missing seller information gracefully', () => {
    const propertyWithoutSeller = {
      ...mockProperty,
      seller: null,
    }
    
    render(<PropertyCard property={propertyWithoutSeller} />)
    
    // Should not crash and should handle gracefully
    expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument()
  })

  it('displays different property types correctly', () => {
    const apartmentProperty = {
      ...mockProperty,
      type: 'apartment' as const,
      title: 'Modern 2-Bedroom Apartment',
    }
    
    render(<PropertyCard property={apartmentProperty} />)
    
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByText('Modern 2-Bedroom Apartment')).toBeInTheDocument()
  })

  it('shows contact information when available', () => {
    const propertyWithContact = {
      ...mockProperty,
      seller: {
        ...mockProperty.seller,
        phone: '+233 20 123 4567',
        whatsapp: '+233 20 123 4567',
      },
    }
    
    render(<PropertyCard property={propertyWithContact} />)
    
    expect(screen.getByText('+233 20 123 4567')).toBeInTheDocument()
  })

  it('displays amenities correctly', () => {
    const propertyWithAmenities = {
      ...mockProperty,
      amenities: ['Swimming Pool', 'Security', 'Garden', 'Parking'],
    }
    
    render(<PropertyCard property={propertyWithAmenities} />)
    
    expect(screen.getByText('Swimming Pool')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
  })

  it('handles long property titles gracefully', () => {
    const propertyWithLongTitle = {
      ...mockProperty,
      title: 'This is a very long property title that should be handled gracefully by the component without breaking the layout or causing any visual issues',
    }
    
    render(<PropertyCard property={propertyWithLongTitle} />)
    
    expect(screen.getByText(/This is a very long property title/)).toBeInTheDocument()
  })

  it('displays property tier correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    // Should show tier badge
    expect(screen.getByText('Normal')).toBeInTheDocument()
  })

  it('shows premium tier for featured properties', () => {
    const premiumProperty = {
      ...mockProperty,
      tier: 'premium' as const,
    }
    
    render(<PropertyCard property={premiumProperty} />)
    
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('handles missing description gracefully', () => {
    const propertyWithoutDescription = {
      ...mockProperty,
      description: '',
    }
    
    render(<PropertyCard property={propertyWithoutDescription} />)
    
    // Should not crash and should handle gracefully
    expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument()
  })

  it('shows verification status correctly', () => {
    const unverifiedProperty = {
      ...mockProperty,
      verification: {
        ...mockProperty.verification,
        isVerified: false,
      },
    }
    
    render(<PropertyCard property={unverifiedProperty} />)
    
    // Should show unverified status
    expect(screen.getByText('Unverified')).toBeInTheDocument()
  })

  it('displays property size correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })

  it('handles missing area gracefully', () => {
    const propertyWithoutArea = {
      ...mockProperty,
      specifications: {
        ...mockProperty.specifications,
        size: 0,
      },
    }
    
    render(<PropertyCard property={propertyWithoutArea} />)
    
    // Should not crash and should handle gracefully
    expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument()
  })

  it('shows property features correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('Modern Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
  })
})
