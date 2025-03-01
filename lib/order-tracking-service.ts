import { EventEmitter } from 'events';
import prisma from './db/prisma';

interface OrderLocation {
  lat: number;
  lng: number;
}

interface OrderStatus {
  orderId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  location?: OrderLocation;
  lastUpdated: Date;
  estimatedDelivery?: Date;
}

class OrderTrackingService extends EventEmitter {
  private static instance: OrderTrackingService;
  private statusUpdates: Map<string, OrderStatus> = new Map();
  private connections: Map<string, Set<string>> = new Map(); // orderId -> Set of connectionIds

  private constructor() {
    super();
    this.setupCleanupInterval();
  }

  public static getInstance(): OrderTrackingService {
    if (!OrderTrackingService.instance) {
      OrderTrackingService.instance = new OrderTrackingService();
    }
    return OrderTrackingService.instance;
  }

  private setupCleanupInterval() {
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 1000 * 60 * 30); // Cleanup every 30 minutes
  }

  private cleanupStaleConnections() {
    const now = Date.now();
    this.connections.forEach((connections, orderId) => {
      if (connections.size === 0) {
        this.connections.delete(orderId);
        this.statusUpdates.delete(orderId);
      }
    });
  }

  public async subscribeToUpdates(orderId: string, connectionId: string): Promise<void> {
    if (!this.connections.has(orderId)) {
      this.connections.set(orderId, new Set());
      await this.initializeOrderStatus(orderId);
    }
    this.connections.get(orderId)?.add(connectionId);
  }

  public unsubscribeFromUpdates(orderId: string, connectionId: string): void {
    const connections = this.connections.get(orderId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.connections.delete(orderId);
        this.statusUpdates.delete(orderId);
      }
    }
  }

  private async initializeOrderStatus(orderId: string): Promise<void> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          estimatedDeliveryDate: true
        }
      });

      if (order) {
        this.statusUpdates.set(orderId, {
          orderId,
          status: order.status as 'pending' | 'processing' | 'shipped' | 'delivered',
          lastUpdated: order.updatedAt,
          estimatedDelivery: order.estimatedDeliveryDate || undefined
        });
      }
    } catch (error) {
      console.error('Error initializing order status:', error);
      this.emit('error', error);
    }
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      // Update in database
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status.status,
          updatedAt: status.lastUpdated,
          estimatedDeliveryDate: status.estimatedDelivery
        }
      });

      // Update in memory
      this.statusUpdates.set(orderId, status);

      // Notify subscribers
      const connections = this.connections.get(orderId);
      if (connections) {
        connections.forEach(connectionId => {
          this.emit(`status:${connectionId}`, status);
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      this.emit('error', error);
    }
  }

  public getOrderStatus(orderId: string): OrderStatus | undefined {
    return this.statusUpdates.get(orderId);
  }
}

export const orderTrackingService = OrderTrackingService.getInstance();