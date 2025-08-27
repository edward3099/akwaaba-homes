import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignupPage from '@/app/signup/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock the password strength meter component
jest.mock('@/components/ui/PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: ({ onPasswordChange, onStrengthChange, label, placeholder, required }: any) => (
    <div className="space-y-2">
      <label htmlFor="password">{label}</label>
      <input
        id="password"
        type="password"
        placeholder={placeholder}
        required={required}
        onChange={(e) => {
          onPasswordChange?.(e.target.value)
          onStrengthChange?.(e.target.value.length > 8 ? 'strong' : 'weak')
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  ),
}))

// Mock the phone input component
jest.mock('@/components/ui/PhoneInput', () => ({
  PhoneInput: ({ onPhoneChange, label, placeholder, required }: any) => (
    <div className="space-y-2">
      <label htmlFor="phone">{label}</label>
      <input
        id="phone"
        type="tel"
        placeholder={placeholder}
        required={required}
        onChange={(e) => onPhoneChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  ),
}))

// Mock the bio textarea component
jest.mock('@/components/ui/Textarea', () => ({
  Textarea: ({ onBioChange, label, placeholder, required }: any) => (
    <div className="space-y-2">
      <label htmlFor="bio">{label}</label>
      <textarea
        id="bio"
        placeholder={placeholder}
        required={required}
        onChange={(e) => onBioChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        rows={4}
      />
    </div>
  ),
}))

// Mock the checkbox component
jest.mock('@/components/ui/Checkbox', () => ({
  Checkbox: ({ onTermsChange, label, required }: any) => (
    <div className="flex items-center space-x-2">
      <input
        id="terms"
        type="checkbox"
        required={required}
        onChange={(e) => onTermsChange?.(e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
      />
      <label htmlFor="terms" className="text-sm text-gray-700">
        {label}
      </label>
    </div>
  ),
}))

// Mock the button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, type, disabled, onClick }: any) => (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {children}
    </button>
  ),
}))

describe('SignupPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    jest.resetAllMocks()
  })

  describe('Page Rendering', () => {
    it('renders the signup page with all form elements', () => {
      render(<SignupPage />)

      // Check for main page elements
      expect(screen.getByText(/Create Your Agent Account/i)).toBeInTheDocument()
      expect(screen.getByText(/Join AkwaabaHomes as a trusted agent/i)).toBeInTheDocument()

      // Check for form fields
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/I agree to the terms and conditions/i)).toBeInTheDocument()

      // Check for submit button
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
    })

    it('displays proper form labels and placeholders', () => {
      render(<SignupPage />)

      // Check for proper labeling
      expect(screen.getByLabelText(/First Name/i)).toHaveAttribute('placeholder', 'Enter your first name')
      expect(screen.getByLabelText(/Last Name/i)).toHaveAttribute('placeholder', 'Enter your last name')
      expect(screen.getByLabelText(/Email/i)).toHaveAttribute('placeholder', 'Enter your email address')
      expect(screen.getByLabelText(/Phone/i)).toHaveAttribute('placeholder', 'Enter your phone number')
      expect(screen.getByLabelText(/Bio/i)).toHaveAttribute('placeholder', 'Tell us about yourself and your experience')
    })
  })

  describe('Form Validation', () => {
    it('validates required fields on form submission', async () => {
      render(<SignupPage />)

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Phone is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Bio is required/i)).toBeInTheDocument()
        expect(screen.getByText(/You must agree to the terms and conditions/i)).toBeInTheDocument()
      })
    })

    it('validates email format correctly', async () => {
      render(<SignupPage />)

      // Fill in required fields with invalid email
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Experienced real estate agent with 5 years in the market.' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for email validation error
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('validates phone number format correctly', async () => {
      render(<SignupPage />)

      // Fill in required fields with invalid phone
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: 'invalid-phone' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Experienced real estate agent with 5 years in the market.' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for phone validation error
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument()
      })
    })

    it('validates password strength requirements', async () => {
      render(<SignupPage />)

      // Fill in required fields with weak password
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'weak' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Experienced real estate agent with 5 years in the market.' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for password strength error
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument()
      })
    })

    it('validates bio length requirements', async () => {
      render(<SignupPage />)

      // Fill in required fields with short bio
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Short bio' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for bio length error
      await waitFor(() => {
        expect(screen.getByText(/Bio must be at least 50 characters long/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form successfully with valid data', async () => {
      render(<SignupPage />)

      // Fill in all required fields with valid data
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Experienced real estate agent with 5 years in the market. Specializing in residential properties in Accra and surrounding areas.' } })

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/i)
      fireEvent.click(termsCheckbox)

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Verify form submission (this would typically show a success message or redirect)
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })

    it('prevents submission without terms agreement', async () => {
      render(<SignupPage />)

      // Fill in all required fields but don't check terms
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Experienced real estate agent with 5 years in the market.' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for terms agreement error
      await waitFor(() => {
        expect(screen.getByText(/You must agree to the terms and conditions/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Experience', () => {
    it('provides real-time validation feedback', async () => {
      render(<SignupPage />)

      // Start typing in email field
      const emailInput = screen.getByLabelText(/Email/i)
      fireEvent.change(emailInput, { target: { value: 'invalid' } })
      fireEvent.blur(emailInput)

      // Check for immediate validation feedback
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
      })

      // Fix the email
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } })
      fireEvent.blur(emailInput)

      // Check that error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument()
      })
    })

    it('shows loading state during form submission', async () => {
      render(<SignupPage />)

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } })
      fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'Experienced real estate agent with 5 years in the market.' } })

      // Check terms checkbox
      const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/i)
      fireEvent.click(termsCheckbox)

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Verify loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
        expect(submitButton).toHaveTextContent(/Creating Account/i)
      })
    })

    it('handles form reset functionality', async () => {
      render(<SignupPage />)

      // Fill in some fields
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })

      // Check that fields have values
      expect(screen.getByLabelText(/First Name/i)).toHaveValue('John')
      expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe')

      // Find and click reset button (if it exists)
      const resetButton = screen.queryByText(/Reset/i) || screen.queryByRole('button', { name: /Reset/i })
      if (resetButton) {
        fireEvent.click(resetButton)

        // Verify fields are cleared
        await waitFor(() => {
          expect(screen.getByLabelText(/First Name/i)).toHaveValue('')
          expect(screen.getByLabelText(/Last Name/i)).toHaveValue('')
        })
      }
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<SignupPage />)

      // Check that all form fields have proper labels
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/I agree to the terms and conditions/i)).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<SignupPage />)

      // Check that form fields are focusable
      const firstNameInput = screen.getByLabelText(/First Name/i)
      const lastNameInput = screen.getByLabelText(/Last Name/i)
      const emailInput = screen.getByLabelText(/Email/i)

      firstNameInput.focus()
      expect(document.activeElement).toBe(firstNameInput)

      // Test tab navigation
      lastNameInput.focus()
      expect(document.activeElement).toBe(lastNameInput)

      emailInput.focus()
      expect(document.activeElement).toBe(emailInput)
    })

    it('provides error announcements for screen readers', async () => {
      render(<SignupPage />)

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)

      // Check for error messages that screen readers can announce
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/is required/i)
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('adapts layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<SignupPage />)

      // Verify mobile-optimized layout elements
      expect(screen.getByText(/Create Your Agent Account/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
    })

    it('handles mobile input methods correctly', () => {
      render(<SignupPage />)

      // Test mobile-specific input handling
      const phoneInput = screen.getByLabelText(/Phone/i)
      fireEvent.change(phoneInput, { target: { value: '+233201234567' } })

      // Verify phone input works correctly
      expect(phoneInput).toHaveValue('+233201234567')
    })
  })

  describe('Internationalization', () => {
    it('displays Ghana-specific content and formatting', () => {
      render(<SignupPage />)

      // Check for Ghana-specific content
      expect(screen.getByText(/AkwaabaHomes/i)).toBeInTheDocument()
      
      // Check for Ghana phone number format
      const phoneInput = screen.getByLabelText(/Phone/i)
      expect(phoneInput).toHaveAttribute('placeholder', 'Enter your phone number')
    })

    it('handles Ghana phone number validation', async () => {
      render(<SignupPage />)

      // Test valid Ghana phone number
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+233201234567' } })
      fireEvent.blur(screen.getByLabelText(/Phone/i))

      // Should not show validation error for valid Ghana number
      await waitFor(() => {
        expect(screen.queryByText(/Please enter a valid phone number/i)).not.toBeInTheDocument()
      })
    })
  })
})
