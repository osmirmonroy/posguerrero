import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { WebSocketService } from '../../services/web-socket.service';
import { Order, OrderStatus } from '../../models/taqueria.models';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-kitchen-dashboard',
  templateUrl: './kitchen-dashboard.component.html',
  styleUrls: ['./kitchen-dashboard.component.css']
})
export class KitchenDashboardComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  openOrders: Order[] = [];
  preparingOrders: Order[] = [];
  readyOrders: Order[] = [];

  private wsSubscription: Subscription | undefined;
  private timerSubscription: Subscription | undefined;

  constructor(
    private taqueriaService: TaqueriaService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.setupWebSocket();

    // Update elapsed times every minute (or second if we want seconds precision)
    this.timerSubscription = interval(10000).subscribe(() => {
      // Just triggers change detection basically if we used a pipe for relative time
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadOrders(): void {
    this.taqueriaService.getKitchenOrders().subscribe(orders => {
      this.orders = orders;
      this.categorizeOrders();
    });
  }

  setupWebSocket(): void {
    this.wsSubscription = this.webSocketService.getOrderUpdates().subscribe(order => {
      if (order) {
        this.handleOrderUpdate(order);
      }
    });
  }

  handleOrderUpdate(updatedOrder: Order): void {
    const index = this.orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      if (updatedOrder.status === OrderStatus.DELIVERED || updatedOrder.status === OrderStatus.PAID) {
        this.orders.splice(index, 1);
      } else {
        this.orders[index] = updatedOrder;
      }
    } else {
      // New order
      if (updatedOrder.status !== OrderStatus.DELIVERED && updatedOrder.status !== OrderStatus.PAID) {
        this.orders.push(updatedOrder);
      }
    }
    this.categorizeOrders();
  }

  categorizeOrders(): void {
    this.openOrders = this.orders.filter(o => o.status === OrderStatus.OPEN).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    this.preparingOrders = this.orders.filter(o => o.status === OrderStatus.PREPARING).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    this.readyOrders = this.orders.filter(o => o.status === OrderStatus.READY).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  }

  updateStatus(order: Order, newStatus: string): void {
    if (order.id) {
      this.taqueriaService.updateOrderStatus(order.id, newStatus).subscribe({
        next: (updated) => {
          // Optimistic update handled by WS usually, but good to have here too
          this.handleOrderUpdate(updated);
        },
        error: (err) => console.error('Failed to update status', err)
      });
    }
  }

  getElapsedTime(dateStr: string | undefined): string {
    if (!dateStr) return '0 min';
    const start = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000); // minutes
    return `${diff} min`;
  }
}
