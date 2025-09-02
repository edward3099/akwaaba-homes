import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AgentProfile from '@/components/agent/AgentProfile'

// Mock the ProtectedRoute component
jest.mock('@/components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>
  }
})

// Mock the AgentLayout component
jest.mock('@/components/layouts/AgentLayout', () => {
  return function MockAgentLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="agent-layout">{children}</div>
  }
})

describe('AgentProfile', () => {
  const mockAgent = {
    id: 'test-agent-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+233201234567',
    company: 'Test Real Estate',
    businessType: 'Real Estate Agency',
    license: 'RE123456',
    experience: 5,
    verificationStatus: 'verified',
    profileImage: null,
    bio: 'Experienced real estate agent with 5+ years in the industry',
    specializations: ['residential', 'commercial'],
    languages: ['English', 'Twi'],
    createdAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the agent profile page', async () => {
    render(<AgentProfile />)

    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('agent-layout')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })
  })

  it('displays agent personal information', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Professional Information')).toBeInTheDocument()
    })
  })

  it('shows edit mode when edit button is clicked', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      const editButton = screen.getByText('Edit Profile')
      expect(editButton).toBeInTheDocument()
    })

    const editButton = screen.getByText('Edit Profile')
    fireEvent.click(editButton)

    // Check if form fields are now editable
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    })
  })

  it('displays agent verification status', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })
  })

  it('shows agent specializations', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      expect(screen.getByText('Residential')).toBeInTheDocument()
      expect(screen.getByText('Commercial')).toBeInTheDocument()
    })
  })

  it('displays agent languages', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Twi')).toBeInTheDocument()
    })
  })

  it('handles profile image upload', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      const uploadButton = screen.getByText('Upload Photo')
      expect(uploadButton).toBeInTheDocument()
    })
  })

  it('shows save and cancel buttons in edit mode', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      const editButton = screen.getByText('Edit Profile')
      fireEvent.click(editButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  it('validates required fields in edit mode', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      const editButton = screen.getByText('Edit Profile')
      fireEvent.click(editButton)
    })

    // Clear required fields
    const firstNameField = screen.getByDisplayValue('John')
    fireEvent.change(firstNameField, { target: { value: '' } })

    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
  })

  it('handles mobile responsive layout', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<AgentProfile />)

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    })
  })

  it('displays error message when profile update fails', async () => {
    render(<AgentProfile />)

    await waitFor(() => {
      const editButton = screen.getByText('Edit Profile')
      fireEvent.click(editButton)
    })

    // Simulate save with invalid data
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
  })
})
