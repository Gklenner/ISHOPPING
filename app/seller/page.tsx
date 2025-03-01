'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Chart } from '@/components/ui/chart';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
}

interface Analytics {
  dailySales: number;
  totalOrders: number;
  averageRating: number;
  revenue: number;
}

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        fetch('/api/seller/products'),
        fetch('/api/seller/orders'),
        fetch('/api/seller/analytics')
      ]);

      if (!productsRes.ok || !ordersRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [productsData, ordersData, analyticsData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        analyticsRes.json()
      ]);

      setProducts(productsData);
      setOrders(ordersData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Daily Sales</h3>
          <p className="text-2xl">${analytics?.dailySales}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total Orders</h3>
          <p className="text-2xl">{analytics?.totalOrders}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Average Rating</h3>
          <p className="text-2xl">{analytics?.averageRating}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Revenue</h3>
          <p className="text-2xl">${analytics?.revenue}</p>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <Button>Add Product</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Update Status</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="h-[400px]">
              <Chart />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}