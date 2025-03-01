import { render, screen, waitFor } from '@testing-library/react'
import AdminDashboard from '../page'

// Mock the fetch function
global.fetch = jest.fn()

const mockDashboardData = {
  totalRevenue: 45231.89,
  totalOrders: 356,
  totalProducts: 145,
  totalCustomers: 2456,
  revenueChange: 12.5,
  ordersChange: 8.2,
  productsChange: -4.3,
  customersChange: 15.8,
  chartData: [
    { name: 'Jan', total: 12450 },
    { name: 'Feb', total: 15060 }
  ]
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    // Setup fetch mock
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDashboardData
    })
  })

  it('renders loading state initially', () => {
    render(<AdminDashboard />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('renders dashboard data after successful fetch', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Orders')).toBeInTheDocument()
    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('Total Customers')).toBeInTheDocument()

    expect(screen.getByText('R$ 45.231,89')).toBeInTheDocument()
    expect(screen.getByText('356')).toBeInTheDocument()
    expect(screen.getByText('145')).toBeInTheDocument()
    expect(screen.getByText('2.456')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument()
    })
  })

  it('renders chart with correct data', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    expect(screen.getByRole('tab', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Orders' })).toBeInTheDocument()
  })

  it('updates data periodically', async () => {
    jest.useFakeTimers()

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)

    expect(global.fetch).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })
})