"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart as Chart } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, DollarSign, Package, ShoppingCart, Users } from "lucide-react"

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

const stats = [
  {
    title: "Total Revenue",
    value: "R$ 45.231,89",
    icon: DollarSign,
    trending: "up",
    change: 12.5
  },
  {
    title: "Total Orders",
    value: "356",
    icon: ShoppingCart,
    trending: "up",
    change: 8.2
  },
  {
    title: "Total Products",
    value: "145",
    icon: Package,
    trending: "down",
    change: 4.3
  },
  {
    title: "Total Customers",
    value: "2,456",
    icon: Users,
    trending: "up",
    change: 15.8
  }
]

const chartData = [
  { name: "Jan", total: 12450 },
  { name: "Feb", total: 15060 },
  { name: "Mar", total: 18200 },
  { name: "Apr", total: 21030 },
  { name: "May", total: 25890 },
  { name: "Jun", total: 31200 },
  { name: "Jul", total: 35800 },
  { name: "Aug", total: 42100 },
  { name: "Sep", total: 45230 },
  { name: "Oct", total: 48900 },
  { name: "Nov", total: 52340 },
  { name: "Dec", total: 58900 }
]

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        const data = await response.json()
        setDashboardData(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="mt-4">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 p-6">
            <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
          </Card>

          <Card className="col-span-3 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const currentStats = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(dashboardData?.totalRevenue || 0),
      icon: DollarSign,
      trending: dashboardData?.revenueChange >= 0 ? "up" : "down",
      change: Math.abs(dashboardData?.revenueChange || 0)
    },
    {
      title: "Total Orders",
      value: dashboardData?.totalOrders.toString() || "0",
      icon: ShoppingCart,
      trending: dashboardData?.ordersChange >= 0 ? "up" : "down",
      change: Math.abs(dashboardData?.ordersChange || 0)
    },
    {
      title: "Total Products",
      value: dashboardData?.totalProducts.toString() || "0",
      icon: Package,
      trending: dashboardData?.productsChange >= 0 ? "up" : "down",
      change: Math.abs(dashboardData?.productsChange || 0)
    },
    {
      title: "Total Customers",
      value: dashboardData?.totalCustomers.toString() || "0",
      icon: Users,
      trending: dashboardData?.customersChange >= 0 ? "up" : "down",
      change: Math.abs(dashboardData?.customersChange || 0)
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentStats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trending === "up" ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span
                  className={`flex items-center text-sm ${stat.trending === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  <TrendIcon className="h-4 w-4 mr-1" />
                  {stat.change}%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Overview</h3>
            <Tabs defaultValue="revenue" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue">
                <Chart
                  data={dashboardData?.chartData || []}
                  categories={["total"]}
                  index="name"
                  valueFormatter={(value: number) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value)
                  }
                  className="aspect-[4/3]"
                />
              </TabsContent>
              <TabsContent value="orders">
                <Chart 
                  data={dashboardData?.chartData || []} 
                  categories={["total"]} 
                  index="name" 
                  className="aspect-[4/3]" 
                />
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <Card className="col-span-3 p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-8">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New order #ORD-{2024}${item}</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}