import { NextResponse } from "next/server"

type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
  chartData: Array<{
    name: string
    total: number
  }>
}

export async function GET() {
  try {
    // In a real implementation, these would be database queries
    const currentDate = new Date()
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1))

    // Aggregate data for the dashboard
    const stats: DashboardStats = {
      totalRevenue: await calculateTotalRevenue(),
      totalOrders: await countTotalOrders(),
      totalProducts: await countActiveProducts(),
      totalCustomers: await countActiveCustomers(),
      revenueChange: await calculateRevenueChange(lastMonth),
      ordersChange: await calculateOrdersChange(lastMonth),
      productsChange: await calculateProductsChange(lastMonth),
      customersChange: await calculateCustomersChange(lastMonth),
      chartData: await generateChartData(),
    }

    // Cache the results
    await cacheResults('dashboard-stats', stats, 300) // Cache for 5 minutes

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}