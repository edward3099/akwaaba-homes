import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '@/components/auth/SignUpForm';
import PropertyListingForm from '@/components/admin/PropertyListingForm';

// Mock the auth context
jest.mock('@/lib/auth/authContext', () => ({
  useAuth: () => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    user: null,
    loading: false,
  }),
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the form validation hook
jest.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    validationState: {},
    handleFieldChange: jest.fn(),
    handleFieldBlur: jest.fn(),
  }),
}));

describe('Form Validation Testing', () => {
  describe('SignUpForm Validation', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('should display validation errors for empty required fields', async () => {
      render(<SignUpForm />);
      
      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Check for required field errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/you must agree to the terms and conditions/i)).toBeInTheDocument();
      });
    });

    it('should validate email format correctly', async () => {
      render(<SignUpForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      // Test valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });

    it('should validate password strength requirements', async () => {
      render(<SignUpForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Test weak password
      await user.type(passwordInput, 'weak');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
      });

      // Test strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongPassword123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/password must be at least 8 characters long/i)).not.toBeInTheDocument();
      });
    });

    it('should validate password confirmation matching', async () => {
      render(<SignUpForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });

      // Test matching passwords
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/passwords don't match/i)).not.toBeInTheDocument();
      });
    });

    it('should validate name field requirements', async () => {
      render(<SignUpForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      
      // Test empty names
      await user.type(firstNameInput, ' ');
      await user.tab();
      await user.type(lastNameInput, ' ');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      });

      // Test valid names
      await user.clear(firstNameInput);
      await user.clear(lastNameInput);
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/last name is required/i)).not.toBeInTheDocument();
      });
    });

    it('should require terms agreement', async () => {
      render(<SignUpForm />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you must agree to the terms and conditions/i)).toBeInTheDocument();
      });

      // Test with terms agreed
      const termsCheckbox = screen.getByRole('checkbox', { name: /agree to terms/i });
      await user.click(termsCheckbox);

      await waitFor(() => {
        expect(screen.queryByText(/you must agree to the terms and conditions/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('PropertyListingForm Validation', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('should validate required fields in each step', async () => {
      render(<PropertyListingForm />);
      
      // Step 1: Basic Information
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const priceInput = screen.getByLabelText(/price/i);
      
      // Try to proceed without filling required fields
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should stay on step 1 due to validation
      expect(screen.getByText(/basic information/i)).toBeInTheDocument();
    });

    it('should validate image upload requirements', async () => {
      render(<PropertyListingForm />);
      
      // Try to submit without uploading images
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show image requirement error
      await waitFor(() => {
        expect(screen.getByText(/please upload at least 3 images/i)).toBeInTheDocument();
      });
    });

    it('should validate file type and size for image uploads', async () => {
      render(<PropertyListingForm />);
      
      const fileInput = screen.getByLabelText(/upload images/i);
      
      // Create mock files for testing
      const validImageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
      const largeFile = new File(['large content'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' });
      
      // Test valid image upload
      await user.upload(fileInput, validImageFile);
      expect(screen.queryByText(/is not an image/i)).not.toBeInTheDocument();
      
      // Test invalid file type
      await user.upload(fileInput, invalidFile);
      await waitFor(() => {
        expect(screen.getByText(/is not an image/i)).toBeInTheDocument();
      });
      
      // Test file size limit
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      await user.upload(fileInput, largeFile);
      await waitFor(() => {
        expect(screen.getByText(/too large/i)).toBeInTheDocument();
      });
    });

    it('should validate numeric field boundaries', async () => {
      render(<PropertyListingForm />);
      
      const priceInput = screen.getByLabelText(/price/i);
      const bedroomsInput = screen.getByLabelText(/bedrooms/i);
      const bathroomsInput = screen.getByLabelText(/bathrooms/i);
      
      // Test negative values
      await user.type(priceInput, '-1000');
      await user.tab();
      
      await user.type(bedroomsInput, '-1');
      await user.tab();
      
      await user.type(bathroomsInput, '-2');
      await user.tab();

      // Should show validation errors for negative values
      await waitFor(() => {
        expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
        expect(screen.getByText(/bedrooms cannot be negative/i)).toBeInTheDocument();
        expect(screen.getByText(/bathrooms cannot be negative/i)).toBeInTheDocument();
      });
    });

    it('should validate text field length limits', async () => {
      render(<PropertyListingForm />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      // Test title length limits
      const longTitle = 'A'.repeat(101); // Exceeds 100 character limit
      await user.type(titleInput, longTitle);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/title too long/i)).toBeInTheDocument();
      });

      // Test description length limits
      const shortDescription = 'Short'; // Below 10 character minimum
      await user.type(descriptionInput, shortDescription);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate step progression logic', async () => {
      render(<PropertyListingForm />);
      
      // Fill required fields for step 1
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const priceInput = screen.getByLabelText(/price/i);
      
      await user.type(titleInput, 'Test Property');
      await user.type(descriptionInput, 'This is a test property description');
      await user.type(priceInput, '100000');
      
      // Should be able to proceed to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/location/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Error Handling', () => {
    it('should display validation errors in real-time', async () => {
      render(<SignUpForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Type invalid email and check immediate feedback
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when input becomes valid', async () => {
      render(<SignUpForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Type invalid email
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      // Fix the email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'valid@example.com');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });

    it('should prevent form submission with validation errors', async () => {
      render(<SignUpForm />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      // Form should not submit and errors should be displayed
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility in Form Validation', () => {
    it('should associate error messages with form fields', () => {
      render(<SignUpForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const emailError = screen.getByText(/please enter a valid email address/i);
      
      // Error message should be associated with the input field
      expect(emailInput).toHaveAttribute('aria-describedby');
      expect(emailError).toHaveAttribute('id');
      expect(emailInput.getAttribute('aria-describedby')).toContain(emailError.id);
    });

    it('should provide keyboard navigation for form validation', async () => {
      render(<SignUpForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Navigate to email field using Tab
      emailInput.focus();
      
      // Type invalid email and press Tab to trigger validation
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      // Error message should be accessible via keyboard
      await waitFor(() => {
        const errorMessage = screen.getByText(/please enter a valid email address/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should announce validation errors to screen readers', () => {
      render(<SignUpForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Error message should have appropriate ARIA attributes
      const errorMessage = screen.getByText(/please enter a valid email address/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });
});
