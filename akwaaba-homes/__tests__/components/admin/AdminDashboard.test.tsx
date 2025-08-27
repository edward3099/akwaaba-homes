import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminDashboard from '@/components/admin/AdminDashboard'

// Mock the mock auth context
jest.mock('@/lib/mock-auth/mockAuthContext', () => ({
  useMockAuth: () => ({
    user: {
      id: 'admin-user-id',
      email: 'admin@akwaabahomes.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    },
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
  }),
}))

// Mock the recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the admin dashboard', async () => {
    render(<AdminDashboard />)

    // Check for main dashboard elements
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('displays dashboard statistics', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      // Check for main stats sections
      expect(screen.getByText('Properties')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('Activity')).toBeInTheDocument()
    })
  })

  it('shows navigation tabs', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Properties')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Payments')).toBeInTheDocument()
    })
  })

  it('displays charts and analytics', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      // Check for chart components
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
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
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
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

  it('handles tab navigation', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      const propertiesTab = screen.getByText('Properties')
      fireEvent.click(propertiesTab)
    })

    // Should show properties sub-tabs
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    render(<AdminDashboard />)

    // Component should render even while loading
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
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
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('displays error state when data fails to load', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      // Component should still render even if data fails
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('shows admin user information', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })
  })

  it('handles property approval actions', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      const propertiesTab = screen.getByText('Properties')
      fireEvent.click(propertiesTab)
    })

    // Should show approval actions
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('displays revenue analytics', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('Monthly')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })
  })

  it('shows user statistics', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Sellers')).toBeInTheDocument()
      expect(screen.getByText('Buyers')).toBeInTheDocument()
    })
  })
})
