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
  pendingItems: { order: Order, item: any }[] = [];
  preparingItems: { order: Order, item: any }[] = [];
  readyItems: { order: Order, item: any }[] = [];

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
    this.pendingItems = [];
    this.preparingItems = [];
    this.readyItems = [];

    this.orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const wrapper = { order, item };
          // Default to OPEN if status is missing
          const status = item.status || 'OPEN';

          if (status === 'OPEN' || status === 'REOPENED') {
            this.pendingItems.push(wrapper);
          } else if (status === 'PREPARING') {
            this.preparingItems.push(wrapper);
          } else if (status === 'READY') {
            this.readyItems.push(wrapper);
          }
        });
      }
    });

    // Sort by time
    const sortByDate = (a: any, b: any) => new Date(a.order.date!).getTime() - new Date(b.order.date!).getTime();
    this.pendingItems.sort(sortByDate);
    this.preparingItems.sort(sortByDate);
    this.readyItems.sort(sortByDate);
  }

  updateItemStatus(item: any, newStatus: string): void {
    if (item.id) {
      this.taqueriaService.updateOrderItemStatus(item.id, newStatus).subscribe({
        next: (updatedItem) => {
          // Find order and item to update locally
          for (let o of this.orders) {
            if (o.items) {
              const i = o.items.find(it => it.id === updatedItem.id);
              if (i) {
                i.status = updatedItem.status;
                break;
              }
            }
          }
          this.categorizeOrders();
        },
        error: (err) => console.error('Failed to update item status', err)
      });
    }
  }

  updateStatus(order: Order, newStatus: string): void {
    // Legacy method, keeping empty or redirecting if needed, but UI will use updateItemStatus
  }

  getElapsedTime(dateStr: string | undefined): string {
    if (!dateStr) return '0 min';
    const start = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000); // minutes
    return `${diff} min`;
  }
}
