import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface OrderStatus {
  orderId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  location?: {
    lat: number;
    lng: number;
  };
  lastUpdated: Date;
  estimatedDelivery?: Date;
}

class OrderTrackingService extends EventEmitter {
  private static instance: OrderTrackingService;
  private ws: WebSocket | null = null;
  private orderStatuses: Map<string, OrderStatus> = new Map();
  private connectionAttempts: number = 0;
  private maxRetries: number = 5;
  private backoffInterval: number = 1000; // Start with 1 second
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  private constructor() {
    super();
  }

  public static getInstance(): OrderTrackingService {
    if (!OrderTrackingService.instance) {
      OrderTrackingService.instance = new OrderTrackingService();
    }
    return OrderTrackingService.instance;
  }

  public connect(orderId: string): void {
    if (this.connectionState === 'connecting') {
      return;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState = 'connecting';

    try {
      this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/order-tracking/${orderId}`);

      this.ws.onopen = () => {
        this.connectionState = 'connected';
        this.connectionAttempts = 0;
        this.backoffInterval = 1000;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const status: OrderStatus = JSON.parse(event.data.toString());
          this.orderStatuses.set(status.orderId, status);
          this.emit('statusUpdate', status);
        } catch (error) {
          console.error('Error parsing order status:', error);
          this.emit('error', new Error('Invalid order status data received'));
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        this.connectionState = 'disconnected';
        this.emit('disconnected');

        if (this.connectionAttempts < this.maxRetries) {
          this.connectionAttempts++;
          const retryDelay = this.backoffInterval * Math.pow(2, this.connectionAttempts - 1);
          console.log(`Attempting to reconnect in ${retryDelay}ms (attempt ${this.connectionAttempts}/${this.maxRetries})`);
          setTimeout(() => this.connect(orderId), retryDelay);
        } else {
          this.emit('error', new Error('Maximum reconnection attempts reached'));
        }
      };
    } catch (error) {
      this.connectionState = 'disconnected';
      this.emit('error', error);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.connectionState = 'disconnected';
      this.connectionAttempts = 0;
      this.backoffInterval = 1000;
      this.ws.close();
      this.ws = null;
    }
  }

  public getOrderStatus(orderId: string): OrderStatus | undefined {
    return this.orderStatuses.get(orderId);
  }

  public subscribeToUpdates(orderId: string, callback: (status: OrderStatus) => void): void {
    this.connect(orderId);
    this.on('statusUpdate', (status: OrderStatus) => {
      if (status.orderId === orderId) {
        callback(status);
      }
    });
  }

  public unsubscribeFromUpdates(orderId: string): void {
    this.removeAllListeners('statusUpdate');
    this.disconnect();
  }
}

export const orderTrackingService = OrderTrackingService.getInstance();