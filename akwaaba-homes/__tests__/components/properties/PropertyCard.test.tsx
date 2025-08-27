import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PropertyCard } from '@/components/property/PropertyCard'

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

const mockProperty = {
  id: 'test-property-1',
  title: 'Beautiful 3-Bedroom House in Accra',
  description: 'A stunning modern house with excellent amenities',
  price: 750000,
  currency: 'GHS',
  status: 'for-sale',
  type: 'house',
  location: {
    address: '123 Test Street, East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    coordinates: {
      lat: 5.5600,
      lng: -0.2057,
    },
  },
  specifications: {
    bedrooms: 3,
    bathrooms: 2,
    size: 200,
    sizeUnit: 'sqm',
  },
  images: ['https://example.com/image1.jpg'],
  features: ['Modern Kitchen', 'Garden'],
  amenities: ['Swimming Pool', 'Security'],
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
  verification: {
    isVerified: true,
    documentsUploaded: true,
    verificationDate: '2024-01-15T10:00:00Z',
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  expiresAt: '2024-02-14T10:00:00Z',
  tier: 'normal',
}

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('Beautiful 3-Bedroom House in Accra')).toBeInTheDocument()
    expect(screen.getByText('GHS 750,000')).toBeInTheDocument()
    expect(screen.getByText('Accra')).toBeInTheDocument()
  })

  it('displays property images correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)
  })

  it('shows property type and status badges correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('House')).toBeInTheDocument()
    expect(screen.getByText('For Sale')).toBeInTheDocument()
  })
})
