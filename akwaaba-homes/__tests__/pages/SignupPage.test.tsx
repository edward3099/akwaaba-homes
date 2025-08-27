import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignupPage from '@/app/signup/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/signup'
  },
}))

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
  })),
}))

describe('SignupPage', () => {
  const mockFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+233201234567',
    companyName: 'Test Real Estate',
    businessType: 'Real Estate Agency',
    licenseNumber: 'RE123456',
    experienceYears: '5',
    bio: 'Experienced real estate professional with 5+ years in the industry. Specializing in residential and commercial properties in Accra and surrounding areas. Proven track record of successful transactions and client satisfaction.',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the signup page', () => {
    render(<SignupPage />)

    expect(screen.getByText('Join AkwaabaHomes')).toBeInTheDocument()
    expect(screen.getByText('Create Your Agent Account')).toBeInTheDocument()
  })

  it('displays all required form fields', () => {
    render(<SignupPage />)

    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument()
    expect(screen.getByLabelText('Company Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Business Type *')).toBeInTheDocument()
    expect(screen.getByLabelText('License Number *')).toBeInTheDocument()
    expect(screen.getByLabelText('Years of Experience *')).toBeInTheDocument()
    expect(screen.getByLabelText('Bio *')).toBeInTheDocument()
    expect(screen.getByLabelText('Password *')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument()
  })

  it('shows terms and conditions checkbox', () => {
    render(<SignupPage />)

    expect(screen.getByLabelText(/I agree to the Terms and Conditions/)).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    render(<SignupPage />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Last name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<SignupPage />)

    const emailField = screen.getByLabelText('Email *')
    fireEvent.change(emailField, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailField)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('validates phone number format', async () => {
    render(<SignupPage />)

    const phoneField = screen.getByLabelText('Phone *')
    fireEvent.change(phoneField, { target: { value: '123' } })
    fireEvent.blur(phoneField)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
    })
  })

  it('validates password strength', async () => {
    render(<SignupPage />)

    const passwordField = screen.getByLabelText('Password *')
    fireEvent.change(passwordField, { target: { value: 'weak' } })
    fireEvent.blur(passwordField)

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    render(<SignupPage />)

    const passwordField = screen.getByLabelText('Password *')
    const confirmPasswordField = screen.getByLabelText('Confirm Password *')

    fireEvent.change(passwordField, { target: { value: 'TestPass123!' } })
    fireEvent.change(confirmPasswordField, { target: { value: 'DifferentPass123!' } })
    fireEvent.blur(confirmPasswordField)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('validates bio length', async () => {
    render(<SignupPage />)

    const bioField = screen.getByLabelText('Bio *')
    fireEvent.change(bioField, { target: { value: 'Short bio' } })
    fireEvent.blur(bioField)

    await waitFor(() => {
      expect(screen.getByText(/Bio must be at least 50 characters/)).toBeInTheDocument()
    })
  })

  it('requires terms agreement', async () => {
    render(<SignupPage />)

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: mockFormData.firstName } })
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: mockFormData.lastName } })
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: mockFormData.email } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: mockFormData.phone } })
    fireEvent.change(screen.getByLabelText('Company Name *'), { target: { value: mockFormData.companyName } })
    fireEvent.change(screen.getByLabelText('Business Type *'), { target: { value: mockFormData.businessType } })
    fireEvent.change(screen.getByLabelText('License Number *'), { target: { value: mockFormData.licenseNumber } })
    fireEvent.change(screen.getByLabelText('Years of Experience *'), { target: { value: mockFormData.experienceYears } })
    fireEvent.change(screen.getByLabelText('Bio *'), { target: { value: mockFormData.bio } })
    fireEvent.change(screen.getByLabelText('Password *'), { target: { value: mockFormData.password } })
    fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: mockFormData.confirmPassword } })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('You must agree to the terms and conditions')).toBeInTheDocument()
    })
  })

  it('submits form successfully with valid data', async () => {
    render(<SignupPage />)

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: mockFormData.firstName } })
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: mockFormData.lastName } })
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: mockFormData.email } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: mockFormData.phone } })
    fireEvent.change(screen.getByLabelText('Company Name *'), { target: { value: mockFormData.companyName } })
    fireEvent.change(screen.getByLabelText('Business Type *'), { target: { value: mockFormData.businessType } })
    fireEvent.change(screen.getByLabelText('License Number *'), { target: { value: mockFormData.licenseNumber } })
    fireEvent.change(screen.getByLabelText('Years of Experience *'), { target: { value: mockFormData.experienceYears } })
    fireEvent.change(screen.getByLabelText('Bio *'), { target: { value: mockFormData.bio } })
    fireEvent.change(screen.getByLabelText('Password *'), { target: { value: mockFormData.password } })
    fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: mockFormData.confirmPassword } })

    // Check terms agreement
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/))

    // Wait for password strength validation
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).not.toBeDisabled()
    })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument()
    })
  })

  it('handles mobile responsive layout', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<SignupPage />)

    expect(screen.getByText('Join AkwaabaHomes')).toBeInTheDocument()
  })

  it('shows loading state during form submission', async () => {
    render(<SignupPage />)

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: mockFormData.firstName } })
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: mockFormData.lastName } })
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: mockFormData.email } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: mockFormData.phone } })
    fireEvent.change(screen.getByLabelText('Company Name *'), { target: { value: mockFormData.companyName } })
    fireEvent.change(screen.getByLabelText('Business Type *'), { target: { value: mockFormData.businessType } })
    fireEvent.change(screen.getByLabelText('License Number *'), { target: { value: mockFormData.licenseNumber } })
    fireEvent.change(screen.getByLabelText('Years of Experience *'), { target: { value: mockFormData.experienceYears } })
    fireEvent.change(screen.getByLabelText('Bio *'), { target: { value: mockFormData.bio } })
    fireEvent.change(screen.getByLabelText('Password *'), { target: { value: mockFormData.password } })
    fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: mockFormData.confirmPassword } })

    // Check terms agreement
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/))

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).not.toBeDisabled()
    })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    // Should show loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })
})
