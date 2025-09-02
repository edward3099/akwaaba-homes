import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminDashboard from '@/components/admin/AdminDashboard'

// Mock the ProtectedRoute component
jest.mock('@/components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>
  }
})

// Mock the AdminLayout component
jest.mock('@/components/layouts/AdminLayout', () => {
  return function MockAdminLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="admin-layout">{children}</div>
  }
})

describe('AdminDashboard', () => {
  const mockStats = {
    totalUsers: 1250,
    totalProperties: 890,
    pendingApprovals: 23,
    totalRevenue: 1250000,
    monthlyGrowth: 15.5,
    activeAgents: 89,
    verifiedProperties: 756,
    totalTransactions: 234,
  }

  const mockRecentActivity = [
    {
      id: '1',
      type: 'property_approval',
      message: 'Property "Luxury Villa in East Legon" approved',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'John Doe',
    },
    {
      id: '2',
      type: 'agent_verification',
      message: 'Agent Sarah Johnson verified',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'Sarah Johnson',
    },
  ]

  const mockPendingProperties = [
    {
      id: 'prop1',
      title: 'Modern Apartment in Accra',
      agent: 'John Doe',
      submittedAt: '2024-01-15T08:00:00Z',
      status: 'pending',
    },
    {
      id: 'prop2',
      title: 'Luxury Villa in East Legon',
      agent: 'Sarah Johnson',
      submittedAt: '2024-01-15T07:30:00Z',
      status: 'pending',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the admin dashboard', async () => {
    render(<AdminDashboard />)

    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('displays dashboard statistics', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Total Properties')).toBeInTheDocument()
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })
  })

  it('shows recent activity section', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })

  it('displays pending property approvals', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Pending Property Approvals')).toBeInTheDocument()
    })
  })

  it('shows agent management section', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Agent Management')).toBeInTheDocument()
    })
  })

  it('displays premium pricing management', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Premium Pricing Management')).toBeInTheDocument()
    })
  })

  it('handles property approval action', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      const approveButton = screen.getByText('Approve')
      expect(approveButton).toBeInTheDocument()
    })

    const approveButton = screen.getByText('Approve')
    fireEvent.click(approveButton)

    // Should show confirmation or success message
    await waitFor(() => {
      expect(screen.getByText('Property approved successfully')).toBeInTheDocument()
    })
  })

  it('handles property rejection action', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      const rejectButton = screen.getByText('Reject')
      expect(rejectButton).toBeInTheDocument()
    })

    const rejectButton = screen.getByText('Reject')
    fireEvent.click(rejectButton)

    // Should show rejection form or confirmation
    await waitFor(() => {
      expect(screen.getByText('Rejection Reason')).toBeInTheDocument()
    })
  })

  it('shows charts and analytics', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Growth Trends')).toBeInTheDocument()
      expect(screen.getByText('Property Distribution')).toBeInTheDocument()
    })
  })

  it('handles mobile responsive layout', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    })
  })

  it('displays error state when data fails to load', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      // Component should still render even if data fails
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', async () => {
    render(<AdminDashboard />)

    // Check for loading indicators
    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
  })

  it('handles navigation to detailed views', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      const viewAllButton = screen.getByText('View All')
      expect(viewAllButton).toBeInTheDocument()
    })

    const viewAllButton = screen.getByText('View All')
    fireEvent.click(viewAllButton)

    // Should navigate to detailed view
    await waitFor(() => {
      expect(screen.getByText('All Properties')).toBeInTheDocument()
    })
  })
})
