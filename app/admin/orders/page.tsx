"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Order = {
  id: string
  customer: string
  date: string
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  items: number
}

const orders: Order[] = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2024-02-20",
    total: 1299.98,
    status: "completed",
    items: 2,
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2024-02-19",
    total: 699.99,
    status: "processing",
    items: 1,
  },
  {
    id: "#ORD-003",
    customer: "Bob Wilson",
    date: "2024-02-18",
    total: 899.97,
    status: "pending",
    items: 3,
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusIcons = {
  pending: Clock,
  processing: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(
                  (order) =>
                    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.customer.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((order) => {
                  const StatusIcon = statusIcons[order.status]
                  return (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4">
                        {new Date(order.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right">{order.items}</td>
                      <td className="py-3 px-4 text-right">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}