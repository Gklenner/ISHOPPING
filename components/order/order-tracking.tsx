"use client";

import { useEffect, useState } from 'react';
import { orderTrackingService } from '@/lib/order-tracking';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OrderTrackingProps {
  orderId: string;
}

interface Location {
  lat: number;
  lng: number;
}

interface OrderStatus {
  orderId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  location?: Location;
  lastUpdated: Date;
  estimatedDelivery?: Date;
}

const statusSteps = {
  pending: 25,
  processing: 50,
  shipped: 75,
  delivered: 100,
};

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStatusUpdate = (newStatus: OrderStatus) => {
      setStatus(newStatus);
      setError(null);
    };

    const handleError = (err: Error) => {
      setError('Failed to connect to tracking service');
      console.error('Tracking error:', err);
    };

    orderTrackingService.subscribeToUpdates(orderId, handleStatusUpdate);
    orderTrackingService.on('error', handleError);

    return () => {
      orderTrackingService.unsubscribeFromUpdates(orderId);
      orderTrackingService.removeListener('error', handleError);
    };
  }, [orderId]);

  if (error) {
    return (
      <Card className="p-4 bg-red-50">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Order Status</h3>
        <Progress value={statusSteps[status.status]} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Current Status</p>
          <p className="font-medium capitalize">{status.status}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Updated</p>
          <p className="font-medium">
            {new Date(status.lastUpdated).toLocaleString()}
          </p>
        </div>
        {status.estimatedDelivery && (
          <div className="col-span-2">
            <p className="text-gray-500">Estimated Delivery</p>
            <p className="font-medium">
              {new Date(status.estimatedDelivery).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {status.location && (
        <div className="rounded-lg overflow-hidden h-48 bg-gray-100">
          {/* Add map component here */}
          <div className="h-full flex items-center justify-center text-gray-500">
            Location: {status.location.lat}, {status.location.lng}
          </div>
        </div>
      )}
    </Card>
  );
}