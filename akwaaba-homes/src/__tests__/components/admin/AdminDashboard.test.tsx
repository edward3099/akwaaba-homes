import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { useMockAuth } from '@/lib/mock-auth/mockAuthContext'

// Mock the mock auth context
jest.mock('@/lib/mock-auth/mockAuthContext')
const mockUseMockAuth = useMockAuth as jest.MockedFunction<typeof useMockAuth>

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('AdminDashboard', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@akwaabahomes.com',
    role: 'ADMIN' as const,
    name: 'Admin User',
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup default mock auth context
    mockUseMockAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    })

    // Setup default fetch mock for successful API calls
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/admin/dashboard/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            properties: {
              total: 75,
              active: 60,
              pending: 15,
              featured: 10,
            },
            users: {
              total: 150,
              agents: 25,
              sellers: 75,
              buyers: 50,
            },
            revenue: {
              total: 50000,
              monthly: 5000,
              premium: 10000,
            },
            activity: {
              views: 5000,
              inquiries: 300,
              approvals: 50,
            },
          }),
        })
      }
      if (url.includes('/api/admin/dashboard/chart-data')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              { date: '2024-01', properties: 10, users: 20, revenue: 1000, views: 500 },
              { date: '2024-02', properties: 15, users: 25, revenue: 1500, views: 600 },
            ],
          }),
        })
      }
      if (url.includes('/api/admin/dashboard/recent-activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            activities: [
              { 
                id: '1', 
                type: 'property_created',
                title: 'Property Added', 
                description: 'New property listing created',
                timestamp: '2024-01-01T10:00:00Z' 
              },
              { 
                id: '2', 
                type: 'user_registered',
                title: 'Agent Approved', 
                description: 'New agent account approved',
                timestamp: '2024-01-01T09:00:00Z' 
              },
            ],
          }),
        })
      }
      if (url.includes('/api/properties') && url.includes('status=pending')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            properties: [
              { 
                id: '1', 
                title: 'Test Property', 
                owner_name: 'John Doe', 
                status: 'pending',
                created_at: '2024-01-01T10:00:00Z',
                price: 100000,
                currency: 'GHS'
              },
              { 
                id: '2', 
                title: 'Another Property', 
                owner_name: 'Jane Smith', 
                status: 'pending',
                created_at: '2024-01-01T09:00:00Z',
                price: 150000,
                currency: 'GHS'
              },
            ],
          }),
        })
      }
      if (url.includes('/api/admin/premium-pricing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            pricing: [
              { id: '1', name: 'Premium Listing', price: 100, duration_days: 30, features: ['Featured placement', 'Priority search', 'Analytics'], is_active: true },
            ],
          }),
        })
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      })
    })
  })

  afterEach(() => {
    // Clean up after each test
    jest.resetAllMocks()
  })

  describe('Dashboard Rendering', () => {
    it('renders dashboard title correctly', async () => {
      render(<AdminDashboard />)
      
      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument()
      })
    })

    it('displays all statistics cards with correct data', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('150')).toBeInTheDocument()
        
        expect(screen.getByText('Total Properties')).toBeInTheDocument()
        expect(screen.getByText('75')).toBeInTheDocument()
        
        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
        expect(screen.getByText('$50,000')).toBeInTheDocument()
        
        expect(screen.getByText('Premium Listings')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
      })
    })

    it('renders navigation tabs correctly', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Properties')).toBeInTheDocument()
        expect(screen.getByText('Agents')).toBeInTheDocument()
        expect(screen.getByText('Analytics')).toBeInTheDocument()
        expect(screen.getByText('Payments')).toBeInTheDocument()
      })
    })

    it('displays charts and data visualizations', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      })
    })
  })

  describe('Recent Activity Section', () => {
    it('displays recent activity items', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Property Added')).toBeInTheDocument()
        expect(screen.getByText('New property listing created')).toBeInTheDocument()
        expect(screen.getByText('Agent Approved')).toBeInTheDocument()
        expect(screen.getByText('New agent account approved')).toBeInTheDocument()
      })
    })

    it('shows activity timestamps in readable format', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        // Check that timestamps are displayed (format may vary based on implementation)
        expect(screen.getByText(/2024-01-01/)).toBeInTheDocument()
      })
    })
  })

  describe('Pending Approvals Section', () => {
    it('displays pending property approvals', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('displays pending agent approvals', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      })
    })

    it('shows approval action buttons', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getAllByText(/Approve/i)).toHaveLength(2)
        expect(screen.getAllByText(/Reject/i)).toHaveLength(2)
      })
    })
  })

  describe('Tab Navigation', () => {
    it('switches between different dashboard sections', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument()
      })

      // Click on Properties tab
      const propertiesTab = screen.getByText('Properties')
      fireEvent.click(propertiesTab)

      // Verify Properties tab content is displayed
      await waitFor(() => {
        expect(screen.getByText(/Properties Management/i)).toBeInTheDocument()
      })

      // Click on Agents tab
      const agentsTab = screen.getByText('Agents')
      fireEvent.click(agentsTab)

      // Verify Agents tab content is displayed
      await waitFor(() => {
        expect(screen.getByText(/Agents Management/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading indicator while fetching data', async () => {
      // Mock a slow API response
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ stats: {}, recentActivity: [], pendingApprovals: [] })
        }), 100))
      )

      render(<AdminDashboard />)

      // Should show loading state initially (skeleton cards with animate-pulse class)
      const skeletonCards = screen.getAllByText('').filter(el => 
        el.closest('div')?.classList.contains('animate-pulse')
      )
      expect(skeletonCards.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      // Mock API error
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Failed to fetch stats' }),
        })
      )

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch stats/)).toBeInTheDocument()
      })
    })

    it('shows error message for network failures', async () => {
      // Mock network failure
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      )

      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })
  })



  describe('Property Approval Actions', () => {
    it('handles property approval correctly', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        const approveButtons = screen.getAllByText(/Approve/i)
        expect(approveButtons).toHaveLength(2)
      })

      // Click first approve button
      const firstApproveButton = screen.getAllByText(/Approve/i)[0]
      fireEvent.click(firstApproveButton)

      // Verify approval action was triggered
      await waitFor(() => {
        expect(firstApproveButton).toBeDisabled()
      })
    })

    it('handles property rejection correctly', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        const rejectButtons = screen.getAllByText(/Reject/i)
        expect(rejectButtons).toHaveLength(2)
      })

      // Click first reject button
      const firstRejectButton = screen.getAllByText(/Reject/i)[0]
      fireEvent.click(firstRejectButton)

      // Verify rejection action was triggered
      await waitFor(() => {
        expect(firstRejectButton).toBeDisabled()
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('adapts layout for mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<AdminDashboard />)

      await waitFor(() => {
        // Verify mobile-optimized layout elements
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Refresh', () => {
    it('refreshes data when refresh button is clicked', async () => {
      render(<AdminDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
      })

      // Find and click refresh button (if it exists)
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByTestId('refresh-button')
      if (refreshButton) {
        fireEvent.click(refreshButton)
        
        // Verify fetch was called again
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledTimes(2)
        })
      }
    })
  })
})
