import { Component, OnInit } from '@angular/core';
import { Product, Order, OrderItem, OrderStatus, Extra } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [MessageService]
})
export class MenuComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  groupedProducts: { name: string, products: Product[] }[] = [];
  layout: 'list' | 'grid' = 'grid';
  currentOrder: Order | null = null;
  orderItems: OrderItem[] = [];
  extras: Extra[] = [];
  selectedExtras: Extra[] = [];
  selectedProduct: Product | null = null;
  extrasDialog: boolean = false;

  constructor(
    private taqueriaService: TaqueriaService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.taqueriaService.getProducts().subscribe(data => {
      this.allProducts = data;
      this.products = [...this.allProducts];
      this.groupProducts();
    });
    this.taqueriaService.getExtras().subscribe(data => {
      this.extras = data;
    });
  }

  groupProducts() {
    const groups: { [key: string]: Product[] } = {};
    this.products.forEach(product => {
      const category = product.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    this.groupedProducts = Object.keys(groups).map(name => ({
      name,
      products: groups[name]
    }));
  }

  filterProducts(query: string) {
    if (!query) {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }
    this.groupProducts();
  }

  startNewOrder() {
    this.currentOrder = null;
    this.orderItems = [];
    this.messageService.add({ severity: 'info', summary: 'Nuevo Pedido', detail: 'Iniciando un nuevo pedido.' });
  }

  openExtrasDialog(product: Product) {
    if (!this.currentOrder && this.orderItems.length === 0) {
      this.startNewOrder();
    }
    this.selectedProduct = product;
    this.selectedExtras = [];
    this.extrasDialog = true;
  }

  confirmExtras() {
    if (this.selectedProduct) {
      this.orderItems.push({
        product: this.selectedProduct,
        quantity: 1,
        extras: this.selectedExtras
      });
      this.extrasDialog = false;
      this.selectedProduct = null;
      this.selectedExtras = [];
    }
  }

  sendOrder() {
    const order: Order = {
      id: this.currentOrder?.id,
      items: this.orderItems,
      status: this.currentOrder ? this.currentOrder.status : OrderStatus.OPEN
    };

    if (this.currentOrder && this.currentOrder.id) {
      this.taqueriaService.updateOrder(this.currentOrder.id, order).subscribe(updatedOrder => {
        this.currentOrder = updatedOrder;
        this.orderItems = updatedOrder.items;
        this.messageService.add({ severity: 'success', summary: 'Pedido Actualizado', detail: 'Pedido enviado a cocina' });
      });
    } else {
      this.taqueriaService.createOrder(order).subscribe(newOrder => {
        this.currentOrder = newOrder;
        this.orderItems = newOrder.items;
        this.messageService.add({ severity: 'success', summary: 'Pedido Creado', detail: 'Pedido creado exitosamente' });
      });
    }
  }

  updateStatus(status: OrderStatus) {
    if (this.currentOrder && this.currentOrder.id) {
      const updatedOrder = { ...this.currentOrder, status: status };
      this.taqueriaService.updateOrder(this.currentOrder.id, updatedOrder).subscribe(order => {
        this.currentOrder = order;
        this.messageService.add({ severity: 'success', summary: 'Estado Actualizado', detail: `Estado del pedido cambiado a ${status}` });
        if (status === OrderStatus.PAID) {
          this.currentOrder = null;
          this.orderItems = [];
        }
      });
    }
  }

  get OrderStatus() {
    return OrderStatus;
  }

  getItemTotal(item: OrderItem): number {
    let price = item.product.price;
    if (item.extras) {
      price += item.extras.reduce((sum, e) => sum + e.price, 0);
    }
    return price * item.quantity;
  }
}
