import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { CreatePropertyForm } from '@/components/properties/CreatePropertyForm'

// Mock the mock auth context
jest.mock('@/lib/mock-auth/mockAuthContext', () => ({
  useMockAuth: () => ({
    user: {
      id: 'agent-user-id',
      email: 'agent@akwaabahomes.com',
      role: 'agent',
      firstName: 'Agent',
      lastName: 'User',
    },
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
  }),
}))

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

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-property-id' }, error: null })),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'test-image-path' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test-image-url.com' } })),
      })),
    },
  },
}))

describe('CreatePropertyForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the create property form', () => {
    render(<CreatePropertyForm />)
    
    expect(screen.getByText('Create New Property')).toBeInTheDocument()
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
  })

  it('shows the first step (Basic Information) by default', () => {
    render(<CreatePropertyForm />)
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByLabelText(/Property Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Property Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Listing Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument()
  })

  it('validates required fields in Basic Information step', async () => {
    render(<CreatePropertyForm />)
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Property title is required/i)).toBeInTheDocument()
    })
  })

  it('allows navigation to next step when Basic Information is valid', async () => {
    render(<CreatePropertyForm />)
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Property Title/i), 'Test Property')
    await user.selectOptions(screen.getByLabelText(/Property Type/i), 'house')
    await user.selectOptions(screen.getByLabelText(/Listing Type/i), 'sale')
    await user.type(screen.getByLabelText(/Price/i), '500000')
    
    // Navigate to next step
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Should show Location step
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument()
    })
  })

  it('shows all form steps in navigation', () => {
    render(<CreatePropertyForm />)
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
  })

  it('handles property type selection correctly', async () => {
    render(<CreatePropertyForm />)
    
    const propertyTypeSelect = screen.getByLabelText(/Property Type/i)
    
    // Check available options
    expect(screen.getByText('House')).toBeInTheDocument()
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByText('Land')).toBeInTheDocument()
    expect(screen.getByText('Commercial')).toBeInTheDocument()
    
    // Select a property type
    await user.selectOptions(propertyTypeSelect, 'apartment')
    
    expect(propertyTypeSelect).toHaveValue('apartment')
  })

  it('handles listing type selection correctly', async () => {
    render(<CreatePropertyForm />)
    
    const listingTypeSelect = screen.getByLabelText(/Listing Type/i)
    
    // Check available options
    expect(screen.getByText('For Sale')).toBeInTheDocument()
    expect(screen.getByText('For Rent')).toBeInTheDocument()
    expect(screen.getByText('For Lease')).toBeInTheDocument()
    
    // Select a listing type
    await user.selectOptions(listingTypeSelect, 'rent')
    
    expect(listingTypeSelect).toHaveValue('rent')
  })

  it('shows progress indicator correctly', () => {
    render(<CreatePropertyForm />)
    
    // Should show step 1 of 4
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    
    // Should show progress bar
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
