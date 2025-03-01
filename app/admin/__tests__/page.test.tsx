import { render, screen } from '@testing-library/react'
import AdminDashboard from '../page'

describe('AdminDashboard', () => {
  it('renders dashboard title', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders all stat cards', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Orders')).toBeInTheDocument()
    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('Total Customers')).toBeInTheDocument()
  })

  it('renders overview section with tabs', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Orders' })).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })
})