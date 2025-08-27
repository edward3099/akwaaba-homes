import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CreatePropertyForm from '@/components/properties/CreatePropertyForm'

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
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
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
  }),
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
      expect(screen.getByText(/Property type is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Listing type is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Price is required/i)).toBeInTheDocument()
    })
  })

  it('allows navigation to next step when Basic Information is valid', async () => {
    render(<CreatePropertyForm />)
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Property Title/i), 'Test Property')
    await user.selectOptions(screen.getByLabelText(/Property Type/i), 'house')
    await user.selectOptions(screen.getByLabelText(/Listing Type/i), 'sale')
    await user.type(screen.getByLabelText(/Price/i), '500000')
    await user.type(screen.getByLabelText(/Description/i), 'A beautiful test property')
    
    // Navigate to next step
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Should show Location step
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Address/i)).toBeInTheDocument()
    })
  })

  it('allows navigation back to previous step', async () => {
    render(<CreatePropertyForm />)
    
    // Fill in Basic Information and go to Location step
    await user.type(screen.getByLabelText(/Property Title/i), 'Test Property')
    await user.selectOptions(screen.getByLabelText(/Property Type/i), 'house')
    await user.selectOptions(screen.getByLabelText(/Listing Type/i), 'sale')
    await user.type(screen.getByLabelText(/Price/i), '500000')
    
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Verify we're on Location step
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument()
    })
    
    // Go back to Basic Information
    const backButton = screen.getByText('Previous')
    await user.click(backButton)
    
    // Should be back on Basic Information step
    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Property')).toBeInTheDocument()
    })
  })

  it('shows all form steps in navigation', () => {
    render(<CreatePropertyForm />)
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
  })

  it('validates price format correctly', async () => {
    render(<CreatePropertyForm />)
    
    // Try invalid price
    await user.type(screen.getByLabelText(/Price/i), 'invalid-price')
    
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Price must be a valid number/i)).toBeInTheDocument()
    })
    
    // Try valid price
    await user.clear(screen.getByLabelText(/Price/i))
    await user.type(screen.getByLabelText(/Price/i), '500000')
    
    await user.click(nextButton)
    
    // Should not show price validation error
    await waitFor(() => {
      expect(screen.queryByText(/Price must be a valid number/i)).not.toBeInTheDocument()
    })
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

  it('shows character count for description field', async () => {
    render(<CreatePropertyForm />)
    
    const descriptionField = screen.getByLabelText(/Description/i)
    await user.type(descriptionField, 'Test description')
    
    // Should show character count
    expect(screen.getByText(/17\/1000/)).toBeInTheDocument()
  })

  it('validates description length', async () => {
    render(<CreatePropertyForm />)
    
    const descriptionField = screen.getByLabelText(/Description/i)
    const longDescription = 'A'.repeat(1001) // Exceeds 1000 character limit
    
    await user.type(descriptionField, longDescription)
    
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Description must be 1000 characters or less/i)).toBeInTheDocument()
    })
  })

  it('maintains form data when navigating between steps', async () => {
    render(<CreatePropertyForm />)
    
    // Fill in Basic Information
    await user.type(screen.getByLabelText(/Property Title/i), 'Test Property')
    await user.selectOptions(screen.getByLabelText(/Property Type/i), 'house')
    await user.selectOptions(screen.getByLabelText(/Listing Type/i), 'sale')
    await user.type(screen.getByLabelText(/Price/i), '500000')
    await user.type(screen.getByLabelText(/Description/i), 'A beautiful test property')
    
    // Go to Location step
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Fill in Location
    await user.type(screen.getByLabelText(/City/i), 'Accra')
    await user.type(screen.getByLabelText(/Address/i), '123 Test Street')
    
    // Go back to Basic Information
    const backButton = screen.getByText('Previous')
    await user.click(backButton)
    
    // Data should be preserved
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Property')).toBeInTheDocument()
      expect(screen.getByDisplayValue('house')).toBeInTheDocument()
      expect(screen.getByDisplayValue('sale')).toBeInTheDocument()
      expect(screen.getByDisplayValue('500000')).toBeInTheDocument()
      expect(screen.getByDisplayValue('A beautiful test property')).toBeInTheDocument()
    })
    
    // Go forward to Location again
    await user.click(nextButton)
    
    // Location data should be preserved
    await waitFor(() => {
      expect(screen.getByDisplayValue('Accra')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123 Test Street')).toBeInTheDocument()
    })
  })

  it('shows progress indicator correctly', () => {
    render(<CreatePropertyForm />)
    
    // Should show step 1 of 4
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    
    // Should show progress bar
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('handles form submission correctly', async () => {
    render(<CreatePropertyForm />)
    
    // Fill in all required fields across all steps
    // Basic Information
    await user.type(screen.getByLabelText(/Property Title/i), 'Test Property')
    await user.selectOptions(screen.getByLabelText(/Property Type/i), 'house')
    await user.selectOptions(screen.getByLabelText(/Listing Type/i), 'sale')
    await user.type(screen.getByLabelText(/Price/i), '500000')
    await user.type(screen.getByLabelText(/Description/i), 'A beautiful test property')
    
    // Go to Location
    await user.click(screen.getByText('Next'))
    
    // Fill Location
    await user.type(screen.getByLabelText(/City/i), 'Accra')
    await user.type(screen.getByLabelText(/Address/i), '123 Test Street')
    
    // Go to Details
    await user.click(screen.getByText('Next'))
    
    // Fill Details
    await user.type(screen.getByLabelText(/Bedrooms/i), '3')
    await user.type(screen.getByLabelText(/Bathrooms/i), '2')
    await user.type(screen.getByLabelText(/Area/i), '150')
    
    // Go to Images
    await user.click(screen.getByText('Next'))
    
    // Submit form
    const submitButton = screen.getByText('Create Property')
    await user.click(submitButton)
    
    // Should show success message or redirect
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })
})
