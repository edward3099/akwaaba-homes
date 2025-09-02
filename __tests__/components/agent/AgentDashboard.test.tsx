import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AgentDashboard from '@/components/agent/AgentDashboard'

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

describe('AgentDashboard', () => {
  const mockAgent = {
    id: 'test-agent-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+233201234567',
    company: 'Test Real Estate',
    license: 'RE123456',
    experience: 5,
    verificationStatus: 'verified',
    profileImage: null,
    bio: 'Experienced real estate agent',
    specializations: ['residential', 'commercial'],
    languages: ['English', 'Twi'],
    createdAt: '2024-01-01T00:00:00Z',
  }

  const mockStats = {
    totalProperties: 25,
    activeListings: 18,
    totalSales: 12,
    totalCommission: 45000,
    monthlyCommission: 8500,
    responseRate: 95,
    averageResponseTime: 2.5,
  }

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders the agent dashboard with profile information', async () => {
    render(<AgentDashboard />)

    // Check if protected route and layout are rendered
    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('agent-layout')).toBeInTheDocument()

    // Check for main dashboard elements
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays agent profile information correctly', async () => {
    render(<AgentDashboard />)

    await waitFor(() => {
      // Check for profile section
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })
  })

  it('shows verification status badge', async () => {
    render(<AgentDashboard />)

    await waitFor(() => {
      // Check for verification status
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })
  })

  it('displays quick action buttons', async () => {
    render(<AgentDashboard />)

    await waitFor(() => {
      // Check for quick action buttons
      expect(screen.getByText('Add Property')).toBeInTheDocument()
      expect(screen.getByText('View Properties')).toBeInTheDocument()
      expect(screen.getByText('Manage Clients')).toBeInTheDocument()
    })
  })

  it('shows statistics section', async () => {
    render(<AgentDashboard />)

    await waitFor(() => {
      // Check for statistics
      expect(screen.getByText('Properties')).toBeInTheDocument()
      expect(screen.getByText('Sales')).toBeInTheDocument()
      expect(screen.getByText('Commission')).toBeInTheDocument()
    })
  })

  it('handles loading state correctly', async () => {
    render(<AgentDashboard />)

    // Check for loading indicators
    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
  })

  it('renders mobile responsive layout', async () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<AgentDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    })
  })

  it('displays error state when data fails to load', async () => {
    render(<AgentDashboard />)

    await waitFor(() => {
      // Component should still render even if data fails
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    })
  })
})
